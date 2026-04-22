import { z } from "zod";
import { eq, and, isNull, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { notifications } from "@/server/db/schema";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notifications.userId, ctx.userId)];
      if (input.unreadOnly) conditions.push(isNull(notifications.readAt));

      return ctx.db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit: input.limit,
      });
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.userId),
          isNull(notifications.readAt),
        ),
      );
    return Number(result[0]?.count ?? 0);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.userId),
          ),
        );
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, ctx.userId),
          isNull(notifications.readAt),
        ),
      );
    return { success: true };
  }),
});
