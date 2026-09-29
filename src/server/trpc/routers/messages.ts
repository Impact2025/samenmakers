import { z } from "zod";
import { eq, and, or, lt, desc, sql, inArray, isNull } from "drizzle-orm";
import Pusher from "pusher";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { messages, matches, blockedUsers, users } from "@/server/db/schema";
import { canMessage } from "@/lib/access";
import { loadPerson } from "@/server/learning/access";
import type { db as DbClient } from "@/server/db";

const NO_ACCESS =
  "Tijdens de opleiding kun je alleen berichten sturen aan je eigen klas en docenten";

/** Mag deze gebruiker contact hebben met de ander? (klasgrenzen, geblokkeerd, actief) */
async function assertCanMessage(
  db: typeof DbClient,
  meId: string,
  otherId: string,
) {
  if (meId === otherId)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Je kunt jezelf geen bericht sturen",
    });
  const [me, other, blocked, target] = await Promise.all([
    loadPerson(db, meId),
    loadPerson(db, otherId),
    db.query.blockedUsers.findFirst({
      where: or(
        and(
          eq(blockedUsers.blockerId, meId),
          eq(blockedUsers.blockedId, otherId),
        ),
        and(
          eq(blockedUsers.blockerId, otherId),
          eq(blockedUsers.blockedId, meId),
        ),
      ),
      columns: { id: true },
    }),
    db.query.users.findFirst({
      where: eq(users.id, otherId),
      columns: { status: true },
    }),
  ]);
  if (!me || !other || !target || target.status !== "active" || blocked)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Je kunt deze gebruiker geen bericht sturen",
    });
  if (!canMessage(me, other))
    throw new TRPCError({ code: "FORBIDDEN", message: NO_ACCESS });
}

function getPusher() {
  try {
    return new Pusher({
      appId: process.env.PUSHER_APP_ID ?? "",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
      secret: process.env.PUSHER_SECRET ?? "",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
      useTLS: true,
    });
  } catch {
    return null;
  }
}

export const messagesRouter = createTRPCRouter({
  // Kan ik deze persoon een bericht sturen? Voor het tonen van de knop.
  canStart: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await assertCanMessage(ctx.db, ctx.userId, input.targetId);
        return { allowed: true as const };
      } catch (e) {
        if (e instanceof TRPCError) return { allowed: false as const };
        throw e;
      }
    }),

  // Alle leden kunnen elkaar direct berichten (zonder eerst te matchen), binnen de klasgrenzen.
  start: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertCanMessage(ctx.db, ctx.userId, input.targetId);
      const existing = await ctx.db.query.matches.findFirst({
        where: or(
          and(
            eq(matches.userId, ctx.userId),
            eq(matches.targetId, input.targetId),
          ),
          and(
            eq(matches.userId, input.targetId),
            eq(matches.targetId, ctx.userId),
          ),
        ),
      });
      if (existing) {
        if (existing.status !== "matched")
          await ctx.db
            .update(matches)
            .set({ status: "matched", updatedAt: new Date() })
            .where(eq(matches.id, existing.id));
        return { matchId: existing.id };
      }
      const [row] = await ctx.db
        .insert(matches)
        .values({
          userId: ctx.userId,
          targetId: input.targetId,
          status: "matched",
        })
        .returning({ id: matches.id });
      return { matchId: row!.id };
    }),

  // Load conversation history
  history: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify user is part of this match
      const match = await ctx.db.query.matches.findFirst({
        where: and(
          eq(matches.id, input.matchId),
          or(eq(matches.userId, ctx.userId), eq(matches.targetId, ctx.userId)),
          eq(matches.status, "matched"),
        ),
      });

      if (!match) return { items: [], nextCursor: undefined };

      const conditions = [eq(messages.matchId, input.matchId)];
      if (input.cursor) {
        conditions.push(lt(messages.createdAt, new Date(input.cursor)));
      }

      const rows = await ctx.db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit + 1);

      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;
      items.reverse();

      return {
        items,
        nextCursor: hasMore ? items[0]?.createdAt.toISOString() : undefined,
      };
    }),

  // Send a message
  send: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const match = await ctx.db.query.matches.findFirst({
        where: and(
          eq(matches.id, input.matchId),
          or(eq(matches.userId, ctx.userId), eq(matches.targetId, ctx.userId)),
          eq(matches.status, "matched"),
        ),
      });

      if (!match)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Geen toegang tot dit gesprek",
        });

      await assertCanMessage(
        ctx.db,
        ctx.userId,
        match.userId === ctx.userId ? match.targetId : match.userId,
      );

      const [message] = await ctx.db
        .insert(messages)
        .values({
          matchId: input.matchId,
          senderId: ctx.userId,
          content: input.content,
        })
        .returning();

      // Trigger real-time event via Pusher
      const pusher = getPusher();
      if (pusher && message) {
        await pusher
          .trigger(`private-match-${input.matchId}`, "new-message", {
            id: message.id,
            matchId: message.matchId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt,
          })
          .catch(() => {
            // Non-fatal: client falls back to polling
          });
      }

      return message;
    }),

  // Mark messages in a conversation as read
  markRead: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.db.query.matches.findFirst({
        where: and(
          eq(matches.id, input.matchId),
          or(eq(matches.userId, ctx.userId), eq(matches.targetId, ctx.userId)),
        ),
        columns: { id: true },
      });
      if (!match)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Geen toegang tot dit gesprek",
        });

      await ctx.db
        .update(messages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messages.matchId, input.matchId),
            sql`${messages.senderId} != ${ctx.userId}`,
            sql`${messages.readAt} IS NULL`,
          ),
        );
      return { success: true };
    }),

  // Unread count across all conversations
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const myMatchIds = await ctx.db
      .select({ id: matches.id })
      .from(matches)
      .where(
        and(
          or(eq(matches.userId, ctx.userId), eq(matches.targetId, ctx.userId)),
          eq(matches.status, "matched"),
        ),
      );

    if (myMatchIds.length === 0) return 0;

    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          inArray(
            messages.matchId,
            myMatchIds.map((m) => m.id),
          ),
          sql`${messages.senderId} != ${ctx.userId}`,
          isNull(messages.readAt),
        ),
      );

    return Number(result[0]?.count ?? 0);
  }),
});
