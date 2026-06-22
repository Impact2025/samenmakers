import { NextResponse } from "next/server";
import { gatherPlatformMetrics } from "@/server/admin/metrics";
import { generateManagementInsight } from "@/lib/ai/management-insight";
import { sendManagementDigest } from "@/lib/email";

// Called by Vercel Cron: every day at 07:00
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await gatherPlatformMetrics("daily");
  const insight = await generateManagementInsight(metrics);
  await sendManagementDigest({ metrics, insight });

  console.log(
    `[management-daily] sent (users=${metrics.totalUsers}, mrr=${metrics.mrr}, ai=${insight ? "yes" : "no"})`,
  );

  return NextResponse.json({ ok: true, period: "daily", aiInsight: !!insight });
}
