/**
 * Demo-data voor de leeromgeving: één programma, één lopende editie, een docent,
 * cursisten met voortgang. Koppelt bestaande demo-gebruikers (scripts/seed.ts);
 * maakt zelf geen accounts aan. Idempotent: bestaat het programma al, dan stopt het script.
 *
 * Gebruik: npx tsx --env-file=.env.local scripts/seed-onderwijs.ts
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, inArray } from "drizzle-orm";
import * as schema from "../src/server/db/schema";
import { generateInviteCode } from "../src/lib/learning";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });
const {
  programs,
  modules,
  lessons,
  cohorts,
  cohortMembers,
  lessonProgress,
  users,
} = schema;

const SLUG = "leergang-sociaal-ondernemen";

type Seed = {
  title: string;
  description: string;
  startOffsetDays: number;
  endOffsetDays: number;
  lessons: {
    title: string;
    type: "tekst" | "video" | "bestand" | "reflectie" | "live";
    minutes?: number;
    content: Record<string, string>;
    required?: boolean;
  }[];
};

const CURRICULUM: Seed[] = [
  {
    title: "Missie, visie & maatschappelijk doel",
    description:
      "Waarom bestaat jouw onderneming? Formuleer een scherpe missie en maak je impact concreet.",
    startOffsetDays: 0,
    endOffsetDays: 13,
    lessons: [
      {
        title: "Welkom en werkwijze",
        type: "tekst",
        minutes: 10,
        content: {
          body: "## Welkom bij de leergang\n\nIn zes modules werk je aan een **impactvolle, financieel gezonde onderneming**.\n\n- Elke module bestaat uit korte lessen, een opdracht en een live sessie\n- Je deelt ervaringen met je cohort in de community\n- Je docent geeft feedback op je reflecties\n\nLees dit even rustig door en ga daarna verder met de volgende les.",
        },
      },
      {
        title: "Van probleem naar missie",
        type: "video",
        minutes: 18,
        content: {
          videoUrl: "https://www.youtube.com/watch?v=Ci6vTgSmOhs",
          body: "Bekijk de video en noteer de **drie kernvragen** van de missiecanvas.",
        },
      },
      {
        title: "Reflectie: jouw waarom",
        type: "reflectie",
        minutes: 15,
        content: {
          prompt:
            "Wat is het maatschappelijke probleem dat jij wilt oplossen, en voor wie precies?",
        },
      },
    ],
  },
  {
    title: "Doelgroep & Theory of Change",
    description:
      "Wie help je, en hoe veroorzaakt jouw activiteit verandering? Bouw je Theory of Change.",
    startOffsetDays: 14,
    endOffsetDays: 27,
    lessons: [
      {
        title: "Doelgroepsegmentatie",
        type: "tekst",
        minutes: 20,
        content: {
          body: "## Segmenteer je doelgroep\n\nStart bij de vraag **wie het meest baat heeft** bij jouw oplossing.\n\n1. Beschrijf de groep in één zin\n2. Benoem drie behoeften\n3. Toets ze met minstens vijf gesprekken\n\n> Een doelgroep die je niet kunt noemen, kun je niet helpen.",
        },
      },
      {
        title: "Theory of Change werkblad",
        type: "bestand",
        minutes: 30,
        content: {
          fileUrl: "https://example.com/theory-of-change-werkblad.pdf",
          fileName: "Theory of Change werkblad.pdf",
          body: "Download het werkblad en vul de eerste drie kolommen in.",
        },
      },
      {
        title: "Live sessie: Theory of Change",
        type: "live",
        minutes: 90,
        content: {
          meetingUrl: "https://meet.google.com/demo-tocx-live",
          startsAt: "",
          body: "Breng je ingevulde werkblad mee. We bespreken in groepjes.",
        },
      },
    ],
  },
  {
    title: "SROI & impactmeting",
    description: "Maak je impact meetbaar en communiceer het naar financiers.",
    startOffsetDays: 28,
    endOffsetDays: 41,
    lessons: [
      {
        title: "Inleiding SROI",
        type: "tekst",
        minutes: 25,
        content: {
          body: "## Social Return on Investment\n\nSROI drukt **maatschappelijke waarde** uit in euro's.\n\n- Bepaal de scope\n- Benoem de stakeholders\n- Koppel indicatoren aan uitkomsten\n\nIn de volgende les rekenen we een voorbeeld door.",
        },
      },
      {
        title: "Impactindicatoren kiezen",
        type: "video",
        minutes: 22,
        content: {
          videoUrl: "https://vimeo.com/76979871",
          body: "Kies per uitkomst maximaal twee indicatoren.",
        },
      },
      {
        title: "Optioneel: rekenvoorbeeld",
        type: "tekst",
        minutes: 15,
        required: false,
        content: {
          body: "Een werkbank-tuin: 20 deelnemers, gemiddeld 6 maanden traject. Bereken de maatschappelijke kosten die zijn vermeden.",
        },
      },
    ],
  },
  {
    title: "Financiering & duurzaam verdienmodel",
    description:
      "Combineer subsidie, fondsen en marktinkomsten tot een robuust model.",
    startOffsetDays: 42,
    endOffsetDays: 55,
    lessons: [
      {
        title: "Subsidie versus marktinkomsten",
        type: "tekst",
        minutes: 20,
        content: {
          body: "## Verdienmodellen combineren\n\nGezonde sociale ondernemingen bouwen op **meerdere poten**:\n\n- Marktinkomsten (klanten)\n- Fondsen en subsidies\n- Giften en crowdfunding\n\nStreef naar minimaal 40% eigen inkomsten in jaar drie.",
        },
      },
      {
        title: "Financial runway template",
        type: "bestand",
        minutes: 30,
        content: {
          fileUrl: "https://example.com/runway.xlsx",
          fileName: "Financial Runway Template.xlsx",
        },
      },
      {
        title: "Reflectie: jouw verdienmodel",
        type: "reflectie",
        minutes: 15,
        content: {
          prompt:
            "Welke drie inkomstenbronnen wil jij over twee jaar hebben, en wat is de eerste stap richting elk?",
        },
      },
    ],
  },
];

async function main() {
  const existing = await db.query.programs.findFirst({
    where: eq(programs.slug, SLUG),
  });
  if (existing) {
    console.log("↩︎ Programma bestaat al — niets gedaan.");
    return;
  }

  const emails = {
    admin: "v.munster@weareimpact.nl",
    docent: "daan@impactinvest.nl",
    cursisten: [
      "sara@circulairmode.nl",
      "jurre@cleantechventures.nl",
      "amina@voedselverspilling.nl",
      "thomas@groenestad.nl",
      "lisanne@edtech4good.nl",
    ],
  };
  const found = await db.query.users.findMany({
    where: inArray(users.email, [
      emails.admin,
      emails.docent,
      ...emails.cursisten,
    ]),
    columns: { id: true, email: true },
  });
  const idOf = (email: string) => found.find((u) => u.email === email)?.id;
  const adminId = idOf(emails.admin);
  if (!adminId) throw new Error(`Gebruiker ${emails.admin} niet gevonden.`);

  const [program] = await db
    .insert(programs)
    .values({
      slug: SLUG,
      name: "Leergang Sociaal Ondernemen",
      tagline: "In vier modules van idee naar impactvolle onderneming",
      description:
        "Een praktijkgerichte leergang voor sociaal ondernemers: missie, doelgroep, impactmeting en financiering.",
      color: "#d8006e",
      status: "gepubliceerd",
      admissionMode: "uitnodiging",
      createdBy: adminId,
    })
    .returning();

  const lessonRows: { id: string; required: boolean }[] = [];
  for (const [mi, m] of CURRICULUM.entries()) {
    const [mod] = await db
      .insert(modules)
      .values({
        programId: program!.id,
        position: mi,
        title: m.title,
        description: m.description,
        startOffsetDays: m.startOffsetDays,
        endOffsetDays: m.endOffsetDays,
      })
      .returning();
    for (const [li, l] of m.lessons.entries()) {
      const content = { ...l.content };
      if (l.type === "live")
        content.startsAt = new Date(Date.now() + 5 * 86_400_000).toISOString();
      const [row] = await db
        .insert(lessons)
        .values({
          moduleId: mod!.id,
          position: li,
          title: l.title,
          type: l.type,
          content,
          durationMinutes: l.minutes ?? null,
          isRequired: l.required ?? true,
        })
        .returning();
      lessonRows.push({ id: row!.id, required: l.required ?? true });
    }
  }

  // Editie die 3 weken geleden startte: module 1 klaar, module 2 loopt.
  const start = new Date(Date.now() - 21 * 86_400_000);
  const end = new Date(start.getTime() + 56 * 86_400_000);
  const [cohort] = await db
    .insert(cohorts)
    .values({
      programId: program!.id,
      name: "Cohort najaar 2026",
      description: "Demo-editie met docent en vijf cursisten.",
      status: "lopend",
      startDate: start,
      endDate: end,
      capacity: 20,
      inviteCode: generateInviteCode(),
      completionRules: { minLessonPercent: 100 },
      createdBy: adminId,
    })
    .returning();

  const members: { userId: string; role: "manager" | "docent" | "cursist" }[] =
    [{ userId: adminId, role: "manager" }];
  const docentId = idOf(emails.docent);
  if (docentId) members.push({ userId: docentId, role: "docent" });
  for (const e of emails.cursisten) {
    const uid = idOf(e);
    if (uid) members.push({ userId: uid, role: "cursist" });
  }
  await db
    .insert(cohortMembers)
    .values(members.map((m) => ({ cohortId: cohort!.id, ...m })))
    .onConflictDoNothing();

  // Voortgang: elke cursist is een ander stuk verder (van 0 tot 6 lessen).
  const required = lessonRows.filter((l) => l.required);
  const learners = members.filter((m) => m.role === "cursist");
  const doneCounts = [6, 4, 3, 1, 0];
  const progressRows = learners.flatMap((m, i) =>
    required.slice(0, doneCounts[i] ?? 0).map((l) => ({
      userId: m.userId,
      lessonId: l.id,
      cohortId: cohort!.id,
      status: "klaar" as const,
      completedAt: new Date(Date.now() - (i + 1) * 86_400_000),
    })),
  );
  if (progressRows.length > 0)
    await db.insert(lessonProgress).values(progressRows).onConflictDoNothing();

  console.log(
    `✅ Programma "${program!.name}" met ${CURRICULUM.length} modules, ${lessonRows.length} lessen, editie "${cohort!.name}" en ${members.length} leden aangemaakt.`,
  );
  console.log(`   Uitnodigingscode: ${cohort!.inviteCode}`);
  console.log(
    `   Docent: ${emails.docent}${docentId ? "" : " (niet gevonden — overgeslagen)"}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
