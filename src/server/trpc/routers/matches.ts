import { z } from "zod";
import { eq, and, or, notInArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc/init";
import { matches, users, blockedUsers } from "@/server/db/schema";
import { checkSwipeLimit } from "@/lib/ratelimit";
import { sendMatchEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";

export const matchesRouter = createTRPCRouter({
  // Get next N profiles to swipe
  swipeDeck: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      // Already swiped IDs
      const swiped = await ctx.db
        .select({ targetId: matches.targetId })
        .from(matches)
        .where(eq(matches.userId, ctx.userId));

      const blocked = await ctx.db
        .select({ blockedId: blockedUsers.blockedId })
        .from(blockedUsers)
        .where(eq(blockedUsers.blockerId, ctx.userId));

      const excludeIds = [
        ctx.userId,
        ...swiped.map((s) => s.targetId),
        ...blocked.map((b) => b.blockedId),
      ];

      return ctx.db
        .select()
        .from(users)
        .where(
          and(
            notInArray(users.id, excludeIds),
            eq(users.status, "active"),
          ),
        )
        .orderBy(
          sql`${users.isFeatured} DESC, RANDOM()`,
        )
        .limit(input.limit);
    }),

  // Record a swipe
  swipe: protectedProcedure
    .input(
      z.object({
        targetId: z.string(),
        decision: z.enum(["like", "pass"]),
        requestMessage: z.string().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isPro = ctx.session.user.isPro || ctx.session.user.role === "admin";
      const { allowed, remaining } = await checkSwipeLimit(ctx.userId, isPro);

      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: isPro
            ? "Je hebt het dagelijkse swipe-limiet bereikt."
            : `Je hebt je 20 dagelijkse swipes gebruikt. Upgrade naar Pro voor onbeperkt swipen.`,
        });
      }

      const status = input.decision === "pass" ? "declined" : "pending";

      await ctx.db.insert(matches).values({
        userId: ctx.userId,
        targetId: input.targetId,
        status,
        requestMessage: input.requestMessage,
      }).onConflictDoNothing();

      if (input.decision !== "like") return { matched: false };

      // Check for mutual like
      const mutual = await ctx.db.query.matches.findFirst({
        where: and(
          eq(matches.userId, input.targetId),
          eq(matches.targetId, ctx.userId),
          eq(matches.status, "pending"),
        ),
      });

      if (!mutual) return { matched: false };

      // Update both to matched
      await ctx.db
        .update(matches)
        .set({ status: "matched", updatedAt: new Date() })
        .where(
          or(
            and(eq(matches.userId, ctx.userId), eq(matches.targetId, input.targetId)),
            and(eq(matches.userId, input.targetId), eq(matches.targetId, ctx.userId)),
          ),
        );

      // Notify both parties
      const [me, target] = await Promise.all([
        ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) }),
        ctx.db.query.users.findFirst({ where: eq(users.id, input.targetId) }),
      ]);

      await Promise.all([
        createNotification(ctx.db, {
          userId: input.targetId,
          type: "new_match",
          title: "Nieuwe match!",
          body: `Jullie zijn een match! Je kunt nu chatten met ${me?.naam ?? "een maker"}.`,
          url: "/berichten",
          ...(me?.avatarUrl ? { avatarUrl: me.avatarUrl } : {}),
        }),
        createNotification(ctx.db, {
          userId: ctx.userId,
          type: "new_match",
          title: "Nieuwe match!",
          body: `Jullie zijn een match! Je kunt nu chatten met ${target?.naam ?? "een maker"}.`,
          url: "/berichten",
          ...(target?.avatarUrl ? { avatarUrl: target.avatarUrl } : {}),
        }),
      ]);

      // Send match emails non-blocking
      const matchId = mutual.id;
      if (me?.email && target) {
        sendMatchEmail({
          to: me.email,
          naam: me.naam ?? me.name ?? "Maker",
          matchNaam: target.naam ?? target.name ?? "een maker",
          matchId,
        }).catch(console.error);
      }
      if (target?.email && me) {
        sendMatchEmail({
          to: target.email,
          naam: target.naam ?? target.name ?? "Maker",
          matchNaam: me.naam ?? me.name ?? "een maker",
          matchId,
        }).catch(console.error);
      }

      return {
        matched: true,
        matchId,
        target: {
          naam: target?.naam,
          avatarUrl: target?.avatarUrl,
        },
      };
    }),

  // My confirmed matches
  myMatches: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.matches.findMany({
      where: and(
        or(
          eq(matches.userId, ctx.userId),
          eq(matches.targetId, ctx.userId),
        ),
        eq(matches.status, "matched"),
      ),
      with: {
        user: true,
        target: true,
        messages: {
          orderBy: (m, { desc }) => [desc(m.createdAt)],
          limit: 1,
        },
      },
      orderBy: (m, { desc }) => [desc(m.updatedAt)],
    });
  }),

  // Mentorship deck (separate swipe pool)
  mentorshipDeck: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(10) }))
    .query(async ({ ctx, input }) => {
      const me = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      });

      if (!me?.mentorshipRole || me.mentorshipRole === "none") return [];

      const complementaryRoles =
        me.mentorshipRole === "mentor"
          ? ["mentee", "both"]
          : me.mentorshipRole === "mentee"
            ? ["mentor", "both"]
            : ["mentor", "mentee", "both"];

      const swiped = await ctx.db
        .select({ targetId: matches.targetId })
        .from(matches)
        .where(eq(matches.userId, ctx.userId));

      const excludeIds = [ctx.userId, ...swiped.map((s) => s.targetId)];

      return ctx.db
        .select()
        .from(users)
        .where(
          and(
            notInArray(users.id, excludeIds),
            eq(users.status, "active"),
            sql`${users.mentorshipRole} = ANY(${complementaryRoles})`,
          ),
        )
        .limit(input.limit);
    }),
});
