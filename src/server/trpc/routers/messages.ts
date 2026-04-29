import { z } from "zod";
import { eq, and, or, asc, lt, desc, sql, inArray, isNull } from "drizzle-orm";
import Pusher from "pusher";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { messages, matches } from "@/server/db/schema";

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
          or(
            eq(matches.userId, ctx.userId),
            eq(matches.targetId, ctx.userId),
          ),
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
        nextCursor: hasMore
          ? items[0]?.createdAt.toISOString()
          : undefined,
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
          or(
            eq(matches.userId, ctx.userId),
            eq(matches.targetId, ctx.userId),
          ),
          eq(matches.status, "matched"),
        ),
      });

      if (!match) throw new Error("Geen toegang tot dit gesprek");

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
          or(
            eq(matches.userId, ctx.userId),
            eq(matches.targetId, ctx.userId),
          ),
          eq(matches.status, "matched"),
        ),
      );

    if (myMatchIds.length === 0) return 0;

    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          inArray(messages.matchId, myMatchIds.map((m) => m.id)),
          sql`${messages.senderId} != ${ctx.userId}`,
          isNull(messages.readAt),
        ),
      );

    return Number(result[0]?.count ?? 0);
  }),
});
