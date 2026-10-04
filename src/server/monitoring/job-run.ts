import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { jobRuns } from "@/server/db/schema";
import { sendAlertEmail } from "@/lib/email";

async function record(
  job: string,
  startedAt: Date,
  status: "ok" | "error",
  error: string | null,
) {
  // Bewaking mag een taak nooit laten falen.
  await db
    .insert(jobRuns)
    .values({
      job,
      status,
      error: error?.slice(0, 1000) ?? null,
      durationMs: Date.now() - startedAt.getTime(),
      startedAt,
    })
    .catch((e) => console.error(`[job-run] registreren mislukt (${job})`, e));
}

/**
 * Voert een cron-handler uit en legt vast of hij slaagde. Bij een fout (exception of
 * 5xx-antwoord) gaat er meteen een alertmail naar beheer. Pas aanroepen ná de CRON_SECRET-check.
 */
export async function withJobRun(
  job: string,
  fn: () => Promise<Response>,
): Promise<Response> {
  const startedAt = new Date();
  try {
    const res = await fn();
    // Geweigerde aanroepen (geen geldige CRON_SECRET) zijn geen run.
    if (res.status === 401 || res.status === 403) return res;
    if (res.status >= 500) {
      await record(job, startedAt, "error", `HTTP ${res.status}`);
      await sendAlertEmail({
        subject: `Taak ${job} mislukt`,
        lines: [`De taak ${job} gaf HTTP ${res.status}.`],
      }).catch(() => {});
    } else {
      await record(job, startedAt, "ok", null);
    }
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[${job}] mislukt`, e);
    Sentry.captureException(e, { tags: { job } });
    await record(job, startedAt, "error", message);
    await sendAlertEmail({
      subject: `Taak ${job} mislukt`,
      lines: [`De taak ${job} is gecrasht.`, message],
    }).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "Taak mislukt" },
      { status: 500 },
    );
  }
}
