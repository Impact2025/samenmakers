import { NextResponse } from "next/server";
import { gatherPlatformMetrics } from "@/server/admin/metrics";
import { generateManagementInsight } from "@/lib/ai/management-insight";
import { sendManagementDigest } from "@/lib/email";
import { getJobProblems } from "@/server/monitoring/job-status";
import { withJobRun } from "@/server/monitoring/job-run";

// Called by Vercel Cron: every Monday at 07:30
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await gatherPlatformMetrics("weekly");
  const insight = await generateManagementInsight(metrics);
  const problems = await getJobProblems();
  await sendManagementDigest({ metrics, insight, problems });

  console.log(
    `[management-weekly] sent (users=${metrics.totalUsers}, mrr=${metrics.mrr}, ai=${insight ? "yes" : "no"})`,
  );

  return NextResponse.json({
    ok: true,
    period: "weekly",
    aiInsight: !!insight,
  });
}

export const GET = (request: Request) =>
  withJobRun("management-weekly", () => run(request));
