import { db } from "@/server/db";
import { users, matches, events, posts } from "@/server/db/schema";
import { eq, gte, and, desc, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subDays } from "@/lib/date-utils";
import { sendWeeklyDigest } from "@/lib/email";

// Called by Vercel Cron: every Monday at 08:00
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = subDays(new Date(), 7);

  const subscribers = await db
    .select({ id: users.id, email: users.email, naam: users.naam, name: users.name })
    .from(users)
    .where(and(eq(users.weeklyDigestEnabled, true), eq(users.status, "active")));

  const recentPosts = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.isPublished, true), gte(posts.publishedAt, since)))
    .orderBy(desc(posts.publishedAt))
    .limit(3);

  const upcomingEvents = await db
    .select({ id: events.id, title: events.title, startAt: events.startAt })
    .from(events)
    .where(gte(events.startAt, new Date()))
    .orderBy(events.startAt)
    .limit(3);

  let sent = 0;
  let failed = 0;

  for (const user of subscribers) {
    const naam = user.naam ?? user.name ?? "Maker";

    // Count new matches in the past week
    const newMatchesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(
        and(
          or(eq(matches.userId, user.id), eq(matches.targetId, user.id)),
          eq(matches.status, "matched"),
          gte(matches.updatedAt, since),
        ),
      );
    const newMatches = Number(newMatchesResult[0]?.count ?? 0);

    await sendWeeklyDigest({
      to: user.email ?? "",
      naam,
      newMatches,
      recentPosts,
      upcomingEvents,
    }).then(() => sent++).catch(() => failed++);
  }

  console.log(`[weekly-digest] sent=${sent} failed=${failed}`);

  return NextResponse.json({ ok: true, sent, failed });
}
