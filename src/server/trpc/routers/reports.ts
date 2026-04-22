import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { reportedContent, blockedUsers } from "@/server/db/schema";

export const reportsRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().optional(),
        targetPostId: z.string().optional(),
        type: z.enum(["spam", "harassment", "inappropriate", "misinformation", "other"]),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(reportedContent).values({
        reporterId: ctx.userId,
        ...input,
      });
      return { success: true };
    }),

  block: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(blockedUsers)
        .values({ blockerId: ctx.userId, blockedId: input.targetId })
        .onConflictDoNothing();
      return { success: true };
    }),

  unblock: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(blockedUsers)
        .where(
          and(
            eq(blockedUsers.blockerId, ctx.userId),
            eq(blockedUsers.blockedId, input.targetId),
          ),
        );
      return { success: true };
    }),

  myBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.blockedUsers.findMany({
      where: eq(blockedUsers.blockerId, ctx.userId),
    });
  }),
});
