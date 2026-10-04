import { NextResponse } from "next/server";
import { sendAlertEmail } from "@/lib/email";
import { getJobProblems } from "@/server/monitoring/job-status";

// Vercel Cron: elke ochtend. Mailt alleen als er iets mis is, zodat stilte "goed" betekent.
// Bewust niet via withJobRun: de bewaker bewaakt de anderen en alarmeert zelf.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const problems = await getJobProblems();
  if (problems.length > 0) {
    await sendAlertEmail({
      subject: `${problems.length} geplande taak/taken met problemen`,
      lines: problems.map((p) => `${p.job} (${p.kind}): ${p.detail}`),
    });
  }
  console.log(`[system-watch] ${problems.length} problemen`);
  return NextResponse.json({ ok: true, problems: problems.length });
}
