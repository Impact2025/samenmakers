import { z } from "zod";
import { eq, desc, gte, count, sql, and } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import {
  users,
  matches,
  messages,
  posts,
  events,
  eventAttendees,
  auditLog,
  reportedContent,
  cohorts,
  cohortMembers,
} from "@/server/db/schema";
import { subDays } from "@/lib/date-utils";

export const adminRouter = createTRPCRouter({
  // Platform analytics
  analytics: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const [
      totalUsers,
      newUsersThisMonth,
      totalMatches,
      mutualMatches,
      totalMessages,
      activeUsersThisWeek,
      totalPosts,
      totalEvents,
      proUsers,
      totalCohorts,
      totalCohortMembers,
    ] = await Promise.all([
      ctx.db.select({ count: count() }).from(users),
      ctx.db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
      ctx.db.select({ count: count() }).from(matches),
      ctx.db.select({ count: count() }).from(matches).where(eq(matches.status, "matched")),
      ctx.db.select({ count: count() }).from(messages),
      ctx.db.select({ count: sql<number>`count(distinct ${messages.senderId})` }).from(messages).where(gte(messages.createdAt, sevenDaysAgo)),
      ctx.db.select({ count: count() }).from(posts).where(eq(posts.isPublished, true)),
      ctx.db.select({ count: count() }).from(events).where(eq(events.isPublished, true)),
      ctx.db.select({ count: count() }).from(users).where(eq(users.subscriptionStatus, "active")),
      ctx.db.select({ count: count() }).from(cohorts),
      ctx.db.select({ count: count() }).from(cohortMembers),
    ]);

    const totalMatchCount = Number(totalMatches[0]?.count ?? 0);
    const mutualMatchCount = Number(mutualMatches[0]?.count ?? 0);

    return {
      totalUsers: Number(totalUsers[0]?.count ?? 0),
      newUsersThisMonth: Number(newUsersThisMonth[0]?.count ?? 0),
      matchRate: totalMatchCount > 0
        ? Math.round((mutualMatchCount / totalMatchCount) * 100)
        : 0,
      totalMessages: Number(totalMessages[0]?.count ?? 0),
      activeUsersThisWeek: Number(activeUsersThisWeek[0]?.count ?? 0),
      totalPosts: Number(totalPosts[0]?.count ?? 0),
      totalEvents: Number(totalEvents[0]?.count ?? 0),
      proUsers: Number(proUsers[0]?.count ?? 0),
      mrr: Number(proUsers[0]?.count ?? 0) * 9,
      totalCohorts: Number(totalCohorts[0]?.count ?? 0),
      totalCohortMembers: Number(totalCohortMembers[0]?.count ?? 0),
    };
  }),

  // User management
  users: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      status: z.enum(["active", "suspended", "banned", "pending_deletion"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(users.status, input.status));
      return ctx.db.query.users.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
      });
    }),

  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      isFeatured: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      status: z.enum(["active", "suspended", "banned", "pending_deletion"]).optional(),
      role: z.enum(["user", "admin"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "update_user",
        targetType: "user",
        targetId: id,
        details: JSON.stringify(data),
      });

      return { success: true };
    }),

  // Content moderation
  pendingContent: adminProcedure.query(async ({ ctx }) => {
    const [unpublishedPosts, unpublishedEvents, pendingReports] = await Promise.all([
      ctx.db.query.posts.findMany({ where: eq(posts.isPublished, false), with: { author: true }, limit: 20 }),
      ctx.db.query.events.findMany({ where: eq(events.isPublished, false), with: { organiser: true }, limit: 20 }),
      ctx.db.query.reportedContent.findMany({ where: eq(reportedContent.status, "pending"), limit: 20 }),
    ]);
    return { unpublishedPosts, unpublishedEvents, pendingReports };
  }),

  publishPost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(posts).set({ isPublished: true, publishedAt: new Date() }).where(eq(posts.id, input.id));
      await ctx.db.insert(auditLog).values({ adminId: ctx.userId, action: "publish_post", targetType: "post", targetId: input.id });
      return { success: true };
    }),

  publishEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(events).set({ isPublished: true }).where(eq(events.id, input.id));
      await ctx.db.insert(auditLog).values({ adminId: ctx.userId, action: "publish_event", targetType: "event", targetId: input.id });
      return { success: true };
    }),

  resolveReport: adminProcedure
    .input(z.object({ id: z.string(), status: z.enum(["resolved", "dismissed"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(reportedContent).set({ status: input.status, resolvedBy: ctx.userId, resolvedAt: new Date() }).where(eq(reportedContent.id, input.id));
      return { success: true };
    }),

  // Cohort management
  createCohort: adminProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), isPublic: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const [cohort] = await ctx.db.insert(cohorts).values({ ...input, inviteCode, createdBy: ctx.userId }).returning();
      return cohort;
    }),

  // Audit log
  auditLog: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx }) => {
      return ctx.db.query.auditLog.findMany({
        orderBy: [desc(auditLog.createdAt)],
        limit: 50,
        with: { admin: true },
      });
    }),
});
