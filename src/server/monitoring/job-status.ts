import { gte } from "drizzle-orm";
import { db } from "@/server/db";
import { jobRuns } from "@/server/db/schema";
import { evaluateJobHealth, type JobProblem } from "@/lib/job-health";

const LOOKBACK_MS = 9 * 86_400_000; // langer dan de wekelijkse taken

/** Problemen met geplande taken, op basis van de registratie in job_runs. */
export async function getJobProblems(now = new Date()): Promise<JobProblem[]> {
  const rows = await db
    .select({
      job: jobRuns.job,
      status: jobRuns.status,
      startedAt: jobRuns.startedAt,
      error: jobRuns.error,
    })
    .from(jobRuns)
    .where(gte(jobRuns.startedAt, new Date(now.getTime() - LOOKBACK_MS)));
  return evaluateJobHealth(rows, now);
}
