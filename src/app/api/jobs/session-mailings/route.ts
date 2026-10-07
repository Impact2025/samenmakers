import { and, asc, eq, gt, isNull, lte, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { cohortMembers, cohortSessions, users } from "@/server/db/schema";
import { sendEventEmail } from "@/lib/email";
import { dueMailings, sessionCycle } from "@/lib/session-cycle";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { withJobRun } from "@/server/monitoring/job-run";
import { isCronAuthorized } from "@/lib/cron-auth";

// Vercel Cron: dagelijks (vercel.json). Per komende sessie:
//  - 3 weken vooraf: briefing met de docent (docent + facilitators)
//  - 2 weken vooraf: huiswerk, introductie docent en schema naar de cursisten
// Idempotent: de verzendmoment-kolom wordt eerst geclaimd, dus overlappende runs sturen niet dubbel.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";
const BRAND = "WE SHAPE THE FUTURE";

async function recipients(
  cohortId: string,
  roles: ("cursist" | "docent" | "facilitator")[],
) {
  const rows = await db
    .select({
      role: cohortMembers.role,
      userId: users.id,
      email: users.email,
      naam: users.naam,
      name: users.name,
    })
    .from(cohortMembers)
    .innerJoin(users, eq(users.id, cohortMembers.userId))
    .where(
      and(
        eq(cohortMembers.cohortId, cohortId),
        ne(cohortMembers.status, "uitgeschreven"),
        eq(users.status, "active"),
      ),
    );
  return rows.filter(
    (r) => r.email && (roles as string[]).includes(r.role),
  ) as ((typeof rows)[number] & { email: string })[];
}

async function run(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Alleen sessies binnen 3 weken (plus een dag marge voor een gemiste run).
  const horizon = new Date(now.getTime() + 22 * 86_400_000);
  const sessions = await db.query.cohortSessions.findMany({
    where: and(
      gt(cohortSessions.startsAt, now),
      lte(cohortSessions.startsAt, horizon),
    ),
    orderBy: [asc(cohortSessions.startsAt)],
    with: {
      cohort: { columns: { id: true, name: true, status: true } },
      teacher: { columns: { naam: true, name: true } },
    },
  });

  let briefings = 0;
  let homework = 0;
  let failed = 0;

  for (const s of sessions) {
    if (s.cohort.status === "concept" || s.cohort.status === "afgerond")
      continue;
    const due = dueMailings(
      s.startsAt,
      {
        briefingSentAt: s.briefingSentAt,
        homeworkMailSentAt: s.homeworkMailSentAt,
      },
      now,
    );
    const cycle = sessionCycle(s.startsAt);
    const dueAt = s.homeworkDueAt ?? cycle.homeworkDueAt;
    const teacherNaam = s.teacher?.naam ?? s.teacher?.name ?? "nog niet bekend";
    const where = s.location ?? (s.meetingUrl ? "Online" : "Locatie volgt");
    const eventInfo = {
      title: s.title,
      when: formatDateTime(s.startsAt),
      where,
    };

    if (due.includes("briefing")) {
      const claimed = await db
        .update(cohortSessions)
        .set({ briefingSentAt: now })
        .where(
          and(
            eq(cohortSessions.id, s.id),
            isNull(cohortSessions.briefingSentAt),
          ),
        )
        .returning({ id: cohortSessions.id });
      if (claimed.length > 0) {
        const to = await recipients(s.cohortId, ["docent", "facilitator"]);
        // Alleen de docent van deze sessie, plus alle facilitators.
        const targets = to.filter(
          (r) => r.role === "facilitator" || r.userId === s.teacherId,
        );
        for (const r of targets) {
          try {
            await sendEventEmail({
              to: r.email,
              subject: `Briefing over 3 weken: ${s.title}`,
              heading: "Tijd voor de briefing",
              intro: `Over drie weken is ${s.title} (${s.cohort.name}). Plan de briefing tussen docent (${teacherNaam}) en facilitator in, en stem programma en lesdoelen af.`,
              event: eventInfo,
              cta: {
                label: "Naar de sessie",
                url: `${APP_URL}/leren/${s.cohortId}/sessies`,
              },
              brand: BRAND,
              footer:
                "Je ontvangt deze e-mail omdat je docent of facilitator bent in deze leergang.",
            });
            briefings++;
          } catch (e) {
            failed++;
            console.error("[session-mailings] briefing mislukt", r.userId, e);
          }
        }
      }
    }

    if (due.includes("huiswerk")) {
      const claimed = await db
        .update(cohortSessions)
        .set({ homeworkMailSentAt: now })
        .where(
          and(
            eq(cohortSessions.id, s.id),
            isNull(cohortSessions.homeworkMailSentAt),
          ),
        )
        .returning({ id: cohortSessions.id });
      if (claimed.length > 0) {
        const learners = await recipients(s.cohortId, ["cursist"]);
        for (const r of learners) {
          try {
            await sendEventEmail({
              to: r.email,
              subject: `Huiswerk voor ${s.title}`,
              heading: "Je huiswerk staat klaar",
              intro: `Over twee weken is ${s.title}. Je docent is ${teacherNaam}. Lever je huiswerk uiterlijk ${formatDate(dueAt)} in via het platform, niet per e-mail.`,
              event: eventInfo,
              cta: {
                label: "Naar je opdrachten",
                url: `${APP_URL}/leren/${s.cohortId}/opdrachten`,
              },
              lines: s.description ? [{ text: s.description }] : [],
              brand: BRAND,
              footer:
                "Je ontvangt deze e-mail omdat je deelneemt aan deze leergang.",
            });
            homework++;
          } catch (e) {
            failed++;
            console.error(
              "[session-mailings] huiswerkmail mislukt",
              r.userId,
              e,
            );
          }
        }
      }
    }
  }

  console.log(
    `[session-mailings] ${sessions.length} sessies, ${briefings} briefings, ${homework} huiswerkmails, ${failed} mislukt`,
  );
  return NextResponse.json({ ok: true, briefings, homework, failed });
}

export const GET = (request: Request) =>
  withJobRun("session-mailings", () => run(request));
