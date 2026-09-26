import "server-only";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { db as defaultDb } from "@/server/db";
import {
  users,
  matches,
  messages,
  posts,
  events,
  cohorts,
  cohortMembers,
  reportedContent,
} from "@/server/db/schema";
import { subDays } from "@/lib/date-utils";

export type MetricsPeriod = "daily" | "weekly";

export interface PlatformMetrics {
  period: MetricsPeriod;
  windowLabel: string;
  generatedAt: Date;

  // Users
  totalUsers: number;
  newUsersInWindow: number;
  newUsersPrevWindow: number;
  userGrowthPct: number;
  activeUsersInWindow: number;

  // Revenue
  proUsers: number;
  mrr: number;
  canceledSubscriptions: number;
  proConversionPct: number;

  // Engagement
  totalMatches: number;
  mutualMatches: number;
  newMatchesInWindow: number;
  matchRate: number;
  totalMessages: number;
  messagesInWindow: number;

  // Clubs (cohorts)
  totalCohorts: number;
  totalCohortMembers: number;
  avgMembersPerCohort: number;

  // Content
  publishedPosts: number;
  newPostsInWindow: number;
  publishedEvents: number;
  upcomingEvents: number;

  // Moderation backlog
  pendingReports: number;
  unpublishedPosts: number;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Gathers a rich snapshot of platform KPIs over a rolling window.
 * Shared by the admin dashboard and the daily/weekly management cron jobs.
 */
export async function gatherPlatformMetrics(
  period: MetricsPeriod,
  db = defaultDb,
): Promise<PlatformMetrics> {
  const now = new Date();
  const windowDays = period === "daily" ? 1 : 7;
  const windowStart = subDays(now, windowDays);
  const prevWindowStart = subDays(now, windowDays * 2);

  const [
    totalUsers,
    newUsersInWindow,
    newUsersPrevWindow,
    activeUsersInWindow,
    proUsers,
    canceledSubscriptions,
    totalMatches,
    mutualMatches,
    newMatchesInWindow,
    totalMessages,
    messagesInWindow,
    totalCohorts,
    totalCohortMembers,
    publishedPosts,
    newPostsInWindow,
    publishedEvents,
    upcomingEvents,
    pendingReports,
    unpublishedPosts,
  ] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(users).where(gte(users.createdAt, windowStart)),
    db
      .select({ c: count() })
      .from(users)
      .where(and(gte(users.createdAt, prevWindowStart), lt(users.createdAt, windowStart))),
    db
      .select({ c: sql<number>`count(distinct ${messages.senderId})` })
      .from(messages)
      .where(gte(messages.createdAt, windowStart)),
    db.select({ c: count() }).from(users).where(eq(users.subscriptionStatus, "active")),
    db.select({ c: count() }).from(users).where(eq(users.subscriptionStatus, "canceled")),
    db.select({ c: count() }).from(matches),
    db.select({ c: count() }).from(matches).where(eq(matches.status, "matched")),
    db
      .select({ c: count() })
      .from(matches)
      .where(and(eq(matches.status, "matched"), gte(matches.updatedAt, windowStart))),
    db.select({ c: count() }).from(messages),
    db.select({ c: count() }).from(messages).where(gte(messages.createdAt, windowStart)),
    db.select({ c: count() }).from(cohorts),
    db.select({ c: count() }).from(cohortMembers),
    db.select({ c: count() }).from(posts).where(eq(posts.isPublished, true)),
    db
      .select({ c: count() })
      .from(posts)
      .where(and(eq(posts.isPublished, true), gte(posts.publishedAt, windowStart))),
    db.select({ c: count() }).from(events).where(eq(events.isPublished, true)),
    db.select({ c: count() }).from(events).where(gte(events.startAt, now)),
    db
      .select({ c: count() })
      .from(reportedContent)
      .where(eq(reportedContent.status, "pending")),
    db.select({ c: count() }).from(posts).where(eq(posts.isPublished, false)),
  ]);

  const n = (r: Array<{ c: number }>) => Number(r[0]?.c ?? 0);

  const totalUsersN = n(totalUsers);
  const newUsersN = n(newUsersInWindow);
  const newUsersPrevN = n(newUsersPrevWindow);
  const proUsersN = n(proUsers);
  const totalMatchesN = n(totalMatches);
  const mutualMatchesN = n(mutualMatches);
  const totalCohortsN = n(totalCohorts);
  const totalCohortMembersN = n(totalCohortMembers);

  return {
    period,
    windowLabel: period === "daily" ? "afgelopen 24 uur" : "afgelopen 7 dagen",
    generatedAt: now,

    totalUsers: totalUsersN,
    newUsersInWindow: newUsersN,
    newUsersPrevWindow: newUsersPrevN,
    userGrowthPct:
      newUsersPrevN > 0
        ? Math.round(((newUsersN - newUsersPrevN) / newUsersPrevN) * 100)
        : newUsersN > 0
          ? 100
          : 0,
    activeUsersInWindow: n(activeUsersInWindow),

    proUsers: proUsersN,
    mrr: proUsersN * 9,
    canceledSubscriptions: n(canceledSubscriptions),
    proConversionPct: pct(proUsersN, totalUsersN),

    totalMatches: totalMatchesN,
    mutualMatches: mutualMatchesN,
    newMatchesInWindow: n(newMatchesInWindow),
    matchRate: pct(mutualMatchesN, totalMatchesN),
    totalMessages: n(totalMessages),
    messagesInWindow: n(messagesInWindow),

    totalCohorts: totalCohortsN,
    totalCohortMembers: totalCohortMembersN,
    avgMembersPerCohort:
      totalCohortsN > 0
        ? Math.round((totalCohortMembersN / totalCohortsN) * 10) / 10
        : 0,

    publishedPosts: n(publishedPosts),
    newPostsInWindow: n(newPostsInWindow),
    publishedEvents: n(publishedEvents),
    upcomingEvents: n(upcomingEvents),

    pendingReports: n(pendingReports),
    unpublishedPosts: n(unpublishedPosts),
  };
}
