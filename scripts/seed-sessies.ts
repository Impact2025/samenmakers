/**
 * Demo-sessies en opdrachten voor de testeditie, zodat je het platform als cursist,
 * docent en beheerder kunt doorlopen. Vereist scripts/seed-onderwijs.ts.
 * Idempotent: heeft de editie al sessies, dan stopt het script.
 *
 * Gebruik: npx tsx --env-file=.env.local scripts/seed-sessies.ts
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../src/server/db/schema";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });
const { cohorts, cohortSessions, assignments, users } = schema;

const DAY = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * DAY);

async function main() {
  const cohort = await db.query.cohorts.findFirst({
    where: eq(cohorts.name, "Cohort najaar 2026"),
  });
  if (!cohort)
    throw new Error("Editie niet gevonden: draai eerst seed-onderwijs.ts");

  const existing = await db.query.cohortSessions.findFirst({
    where: eq(cohortSessions.cohortId, cohort.id),
  });
  if (existing) {
    console.log("↩︎ Editie heeft al sessies — niets gedaan.");
    return;
  }

  const docent = await db.query.users.findFirst({
    where: eq(users.email, "daan@impactinvest.nl"),
    columns: { id: true },
  });
  const admin = await db.query.users.findFirst({
    where: eq(users.email, "v.munster@weareimpact.nl"),
    columns: { id: true },
  });

  const [afgelopen, komend] = await db
    .insert(cohortSessions)
    .values([
      {
        cohortId: cohort.id,
        title: "Demo: Sessie 1 — Impactmodel (afgelopen)",
        description: "Testsessie, drie dagen geleden. Deadline is verstreken.",
        startsAt: inDays(-3),
        location: "Haarlem",
        teacherId: docent?.id,
        homeworkDueAt: inDays(-6),
      },
      {
        cohortId: cohort.id,
        title: "Demo: Sessie 2 — Businessmodel (komend)",
        description: "Testsessie over vijf dagen. Docenttoegang is nu open.",
        startsAt: inDays(5),
        location: "Online",
        meetingUrl: "https://meet.example.com/demo",
        teacherId: docent?.id,
        homeworkDueAt: inDays(2),
      },
    ])
    .returning();

  await db.insert(assignments).values([
    {
      cohortId: cohort.id,
      sessionId: afgelopen!.id,
      title: "Demo: Impactcanvas",
      description: "Lever je ingevulde impactcanvas in (te laat testen).",
      createdBy: admin?.id,
    },
    {
      cohortId: cohort.id,
      sessionId: komend!.id,
      title: "Demo: Businessplan concept",
      description: "Lever je conceptplan in (op tijd testen).",
      createdBy: admin?.id,
    },
  ]);

  console.log("✅ 2 demo-sessies en 2 opdrachten aangemaakt voor", cohort.name);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
