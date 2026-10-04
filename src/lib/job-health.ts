// Pure beoordeling van de geplande taken (geen DB, getest in job-health.test.ts).
// maxAgeHours = hoe oud de laatste geslaagde run mag zijn voordat we alarm slaan: het
// schema in vercel.json plus ruim speling voor een trage of overgeslagen run.

export const JOBS = [
  { name: "event-reminders", maxAgeHours: 3 },
  { name: "publish-scheduled", maxAgeHours: 3 },
  { name: "session-mailings", maxAgeHours: 30 },
  { name: "gdpr-cleanup", maxAgeHours: 30 },
  { name: "management-daily", maxAgeHours: 30 },
  { name: "weekly-digest", maxAgeHours: 24 * 7 + 6 },
  { name: "management-weekly", maxAgeHours: 24 * 7 + 6 },
] as const;

export interface JobRunRow {
  job: string;
  status: "ok" | "error";
  startedAt: Date;
  error: string | null;
}

export interface JobProblem {
  job: string;
  kind: "mislukt" | "te-laat" | "nooit-gedraaid";
  detail: string;
}

const HOUR = 3_600_000;

/** Per taak: laatste run mislukt, of de laatste geslaagde run is te oud of ontbreekt. */
export function evaluateJobHealth(
  runs: JobRunRow[],
  now: Date,
  jobs: readonly { name: string; maxAgeHours: number }[] = JOBS,
): JobProblem[] {
  const problems: JobProblem[] = [];
  for (const { name, maxAgeHours } of jobs) {
    const mine = runs
      .filter((r) => r.job === name)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    const last = mine[0];
    if (!last) {
      problems.push({
        job: name,
        kind: "nooit-gedraaid",
        detail: "Geen enkele run geregistreerd.",
      });
      continue;
    }
    if (last.status === "error") {
      problems.push({
        job: name,
        kind: "mislukt",
        detail: last.error ?? "Onbekende fout",
      });
      continue;
    }
    const ageH = (now.getTime() - last.startedAt.getTime()) / HOUR;
    if (ageH > maxAgeHours) {
      problems.push({
        job: name,
        kind: "te-laat",
        detail: `Laatste geslaagde run ${Math.round(ageH)} uur geleden (max ${maxAgeHours}).`,
      });
    }
  }
  return problems;
}
