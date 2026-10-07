import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subDays } from "@/lib/date-utils";
import { withJobRun } from "@/server/monitoring/job-run";
import { isCronAuthorized } from "@/lib/cron-auth";

// Called by Vercel Cron: every hour
// Auto-publishes posts that have been in review for > 7 days without admin action
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function run(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = subDays(new Date(), 7);

  const toPublish = await db
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(and(eq(posts.isPublished, false), lte(posts.createdAt, cutoff)));

  console.log(
    `[publish-scheduled] ${toPublish.length} posts auto-publishing after review window`,
  );

  for (const post of toPublish) {
    await db
      .update(posts)
      .set({ isPublished: true, publishedAt: new Date() })
      .where(eq(posts.id, post.id));
  }

  return NextResponse.json({ ok: true, published: toPublish.length });
}

export const GET = (request: Request) =>
  withJobRun("publish-scheduled", () => run(request));
