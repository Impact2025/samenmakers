/**
 * Inlogaccounts voor élke rol, met demo-inhoud voor elk scherm: beheerder, manager,
 * docent, facilitator, cursist, alumnus (met en zonder jaarlidmaatschap) en gewoon lid.
 * Vult aan wat seed.ts, seed-onderwijs.ts en seed-sessies.ts nog niet dekken:
 * een afgeronde editie voor alumni, inleveringen met feedback, aanwezigheid,
 * lesmateriaal (kennisbank) en klas- en alumnifeeds.
 *
 * Idempotent: elk onderdeel wordt overgeslagen als het er al is.
 * Vereist: seed.ts, seed-onderwijs.ts en (voor sessies/opdrachten) seed-sessies.ts.
 *
 * Gebruik: npx tsx --env-file=.env.local scripts/seed-demo-rollen.ts
 * Wachtwoord van alle demo-accounts: Demo1234!
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { and, eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "../src/server/db/schema";
import { generateInviteCode } from "../src/lib/learning";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });
const {
  users,
  cohorts,
  cohortMembers,
  cohortSessions,
  assignments,
  submissions,
  attendance,
  cohortMaterials,
  feedPosts,
  memberships,
} = schema;

const PASSWORD = "Demo1234!";
const DAY = 86_400_000;
const ago = (n: number) => new Date(Date.now() - n * DAY);
const inDays = (n: number) => new Date(Date.now() + n * DAY);
// Openbare pdf, zodat de beveiligde downloadroute het materiaal kan doorgeven.
const DEMO_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const CURRENT_COHORT = "Cohort najaar 2026";
const ALUMNI_COHORT = "Cohort voorjaar 2026";

const NEW_USERS = [
  {
    key: "facilitator",
    email: "facilitator@demo.weareimpact.nl",
    name: "Femke Facilitator",
    bio: "Begeleidt de klas, modereert de klasfeed en houdt de voortgang in de gaten.",
    sector: "Onderwijs & Training",
    avatar: 5,
  },
  {
    key: "alumnus",
    email: "alumnus@demo.weareimpact.nl",
    name: "Alex Alumnus",
    bio: "Rondde de leergang af in het voorjaar en heeft een lopend jaarlidmaatschap.",
    sector: "Social Impact",
    avatar: 12,
  },
  {
    key: "alumna-zonder-lidmaatschap",
    email: "alumna@demo.weareimpact.nl",
    name: "Anouk Afgerond",
    bio: "Rondde de leergang af, maar heeft (nog) geen jaarlidmaatschap. Test de drempel.",
    sector: "Duurzaamheid",
    avatar: 45,
  },
  {
    key: "lid",
    email: "lid@demo.weareimpact.nl",
    name: "Lars Lid",
    bio: "Gewoon community-lid zonder leergang. Ziet geen klas, wel de community.",
    sector: "Tech for Good",
    avatar: 33,
  },
] as const;

async function ensureUsers() {
  const hashed = await bcrypt.hash(PASSWORD, 12);
  for (const u of NEW_USERS) {
    await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: u.name,
        naam: u.name,
        email: u.email,
        password: hashed,
        bio: u.bio,
        sector: u.sector,
        regio: "Haarlem",
        fase: "groei",
        avatarUrl: `https://i.pravatar.cc/300?img=${u.avatar}`,
        expertise: [u.sector],
        profileVisibility: "members",
        profileCompleteness: 80,
        isVerified: true,
        referralCode: randomUUID().slice(0, 8).toUpperCase(),
        emailVerified: new Date(),
      })
      .onConflictDoNothing({ target: users.email });
  }
  const rows = await db.query.users.findMany({
    where: inArray(
      users.email,
      NEW_USERS.map((u) => u.email),
    ),
    columns: { id: true, email: true },
  });
  const byKey = Object.fromEntries(
    NEW_USERS.map((u) => [u.key, rows.find((r) => r.email === u.email)!.id]),
  );
  return byKey as Record<(typeof NEW_USERS)[number]["key"], string>;
}

async function idOf(email: string) {
  const u = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  return u?.id;
}

async function main() {
  const current = await db.query.cohorts.findFirst({
    where: eq(cohorts.name, CURRENT_COHORT),
  });
  if (!current?.programId)
    throw new Error("Editie niet gevonden: draai eerst seed-onderwijs.ts");

  const adminId = await idOf("v.munster@weareimpact.nl");
  const docentId = await idOf("daan@impactinvest.nl");
  const sara = await idOf("sara@circulairmode.nl");
  const jurre = await idOf("jurre@cleantechventures.nl");
  const amina = await idOf("amina@voedselverspilling.nl");
  const thomas = await idOf("thomas@groenestad.nl");
  if (!adminId || !docentId || !sara || !jurre || !amina || !thomas)
    throw new Error("Demo-gebruikers ontbreken: draai eerst seed.ts");

  const ids = await ensureUsers();
  console.log("✅ Accounts gecontroleerd/aangemaakt");

  // ─── Klas: facilitator erbij, voortgang, aanwezigheid, inleveringen, feed ───
  await db
    .insert(cohortMembers)
    .values({
      cohortId: current.id,
      userId: ids.facilitator,
      role: "facilitator",
    })
    .onConflictDoNothing();

  const sessions = await db.query.cohortSessions.findMany({
    where: eq(cohortSessions.cohortId, current.id),
  });
  const past = sessions.find((s) => s.startsAt < new Date());
  const assigns = await db.query.assignments.findMany({
    where: eq(assignments.cohortId, current.id),
  });
  const pastAssign = assigns.find((a) => a.sessionId === past?.id);
  const nextAssign = assigns.find((a) => a.id !== pastAssign?.id);

  if (past) {
    await db
      .insert(attendance)
      .values(
        [
          { userId: sara, status: "aanwezig" as const },
          { userId: jurre, status: "afwezig" as const },
          { userId: amina, status: "geoorloofd" as const },
          { userId: thomas, status: "aanwezig" as const },
        ].map((a) => ({ ...a, sessionId: past.id, markedBy: docentId })),
      )
      .onConflictDoNothing();
  }

  if (pastAssign) {
    await db
      .insert(submissions)
      .values([
        {
          assignmentId: pastAssign.id,
          userId: sara,
          text: "Mijn impactcanvas: we verminderen 12 ton textielafval per jaar en bereiken 800 huishoudens.",
          status: "beoordeeld" as const,
          feedback:
            "Sterk uitgewerkt. Maak je doelgroep nog iets scherper en koppel de 12 ton aan een meetmethode.",
          reviewedBy: docentId,
          reviewedAt: ago(1),
          submittedAt: ago(5),
        },
        {
          assignmentId: pastAssign.id,
          userId: thomas,
          text: "Te laat ingeleverd, maar hierbij mijn canvas voor groene wijken.",
          isLate: true,
          submittedAt: ago(2),
        },
      ])
      .onConflictDoNothing();
  }
  if (nextAssign) {
    await db
      .insert(submissions)
      .values({
        assignmentId: nextAssign.id,
        userId: amina,
        text: "Concept businessplan voor voedselverspilling in de horeca.",
        submittedAt: ago(0.2),
      })
      .onConflictDoNothing();
  }

  await seedOnce(
    "klasfeed",
    () =>
      db.query.feedPosts.findFirst({
        where: eq(feedPosts.cohortId, current.id),
      }),
    () =>
      db.insert(feedPosts).values([
        {
          cohortId: current.id,
          authorId: sara,
          kind: "hulpvraag",
          title: "Wie heeft ervaring met impactmeting?",
          body: "Ik zoek iemand die mij kan helpen een eenvoudige meetmethode op te zetten voor mijn textielproject.",
          createdAt: ago(2),
        },
        {
          cohortId: current.id,
          authorId: jurre,
          kind: "aanbod",
          title: "Ik denk graag mee over cleantech-financiering",
          body: "Zes jaar ervaring met subsidies en investeerders. Stuur me gerust een bericht.",
          createdAt: ago(1),
        },
        {
          cohortId: current.id,
          authorId: ids.facilitator,
          kind: "aanbod",
          title: "Spreekuur donderdag 16:00",
          body: "Vragen over de opdracht? Ik ben donderdag online beschikbaar.",
          createdAt: ago(0.5),
        },
      ]),
  );

  await seedOnce(
    "materiaal huidige editie",
    () =>
      db.query.cohortMaterials.findFirst({
        where: eq(cohortMaterials.cohortId, current.id),
      }),
    () =>
      db.insert(cohortMaterials).values({
        cohortId: current.id,
        sessionId: past?.id,
        title: "Slides sessie 1 — Impactmodel",
        description: "Presentatie van de eerste sessie.",
        url: DEMO_PDF,
        fileName: "sessie-1-impactmodel.pdf",
        mimeType: "application/pdf",
        sizeBytes: 13_264,
        uploadedBy: docentId,
      }),
  );

  // ─── Afgeronde editie: alumni ───────────────────────────────────────────────
  let alumniCohort = await db.query.cohorts.findFirst({
    where: eq(cohorts.name, ALUMNI_COHORT),
  });
  if (!alumniCohort) {
    [alumniCohort] = await db
      .insert(cohorts)
      .values({
        programId: current.programId,
        name: ALUMNI_COHORT,
        description: "Afgeronde demo-editie: bron van alumni en lesmateriaal.",
        status: "afgerond",
        startDate: ago(200),
        endDate: ago(120),
        capacity: 20,
        inviteCode: generateInviteCode(),
        completionRules: { minLessonPercent: 100 },
        createdBy: adminId,
      })
      .returning();
    console.log(`✅ Editie "${ALUMNI_COHORT}" aangemaakt`);
  }
  const ac = alumniCohort!;

  await db
    .insert(cohortMembers)
    .values([
      { cohortId: ac.id, userId: adminId, role: "manager" as const },
      { cohortId: ac.id, userId: docentId, role: "docent" as const },
      {
        cohortId: ac.id,
        userId: ids.alumnus,
        role: "alumnus" as const,
        status: "afgerond" as const,
        completedAt: ago(120),
      },
      {
        cohortId: ac.id,
        userId: ids["alumna-zonder-lidmaatschap"],
        role: "cursist" as const,
        status: "afgerond" as const,
        completedAt: ago(120),
      },
    ])
    .onConflictDoNothing();

  await seedOnce(
    "sessie afgeronde editie",
    () =>
      db.query.cohortSessions.findFirst({
        where: eq(cohortSessions.cohortId, ac.id),
      }),
    async () => {
      const [s] = await db
        .insert(cohortSessions)
        .values({
          cohortId: ac.id,
          title: "Sessie 1 — Financiering & pitch",
          description: "Afgelopen sessie van de voorjaarseditie.",
          startsAt: ago(150),
          location: "Haarlem",
          teacherId: docentId,
          homeworkDueAt: ago(153),
        })
        .returning();
      const [a] = await db
        .insert(assignments)
        .values({
          cohortId: ac.id,
          sessionId: s!.id,
          title: "Pitchdeck",
          description: "Lever je pitchdeck van drie slides in.",
          createdBy: adminId,
        })
        .returning();
      await db.insert(submissions).values({
        assignmentId: a!.id,
        userId: ids.alumnus,
        text: "Mijn pitch: van idee naar eerste honderd klanten.",
        status: "beoordeeld",
        feedback: "Duidelijk verhaal, sterke opening.",
        reviewedBy: docentId,
        reviewedAt: ago(145),
        submittedAt: ago(154),
      });
      await db.insert(cohortMaterials).values([
        {
          cohortId: ac.id,
          sessionId: s!.id,
          title: "Slides — Financiering voor sociaal ondernemers",
          description:
            "Overzicht van subsidies, fondsen en impactinvesteerders.",
          url: DEMO_PDF,
          fileName: "financiering.pdf",
          mimeType: "application/pdf",
          sizeBytes: 13_264,
          uploadedBy: docentId,
        },
        {
          cohortId: ac.id,
          title: "Literatuurlijst impactmeting",
          description: "Aanbevolen lectuur bij de module impactmeting.",
          url: DEMO_PDF,
          fileName: "literatuur-impactmeting.pdf",
          mimeType: "application/pdf",
          sizeBytes: 13_264,
          uploadedBy: docentId,
        },
      ]);
    },
  );

  const alumniFeedExists = await db
    .select({ id: feedPosts.id })
    .from(feedPosts)
    .where(
      and(
        eq(feedPosts.authorId, ids.alumnus),
        eq(feedPosts.title, "Wie wil samen een subsidieaanvraag schrijven?"),
      ),
    );
  if (alumniFeedExists.length === 0) {
    await db.insert(feedPosts).values([
      {
        cohortId: null,
        authorId: ids.alumnus,
        kind: "hulpvraag",
        title: "Wie wil samen een subsidieaanvraag schrijven?",
        body: "Ik zoek een sparringpartner voor een aanvraag bij een regionaal impactfonds.",
        createdAt: ago(3),
      },
      {
        cohortId: null,
        authorId: docentId,
        kind: "aanbod",
        title: "Alumni-borrel volgende maand",
        body: "We organiseren een informele borrel voor alumni. Laat het weten als je erbij bent.",
        createdAt: ago(1),
      },
      {
        cohortId: null,
        authorId: ids["alumna-zonder-lidmaatschap"],
        kind: "aanbod",
        title: "Ik deel mijn pitchdeck-template",
        body: "Wie wil mijn template voor een impactpitch? Stuur een bericht.",
        createdAt: ago(2),
      },
    ]);
    console.log("✅ Alumnifeed gevuld");
  }

  // Jaarlidmaatschap alleen voor Alex; Anouk heeft er bewust geen.
  await db
    .insert(memberships)
    .values({
      userId: ids.alumnus,
      stripeSubscriptionId: "sub_demo_alumnus",
      status: "active",
      currentPeriodEnd: inDays(300),
      priceCents: 12_000,
      termsAcceptedAt: ago(120),
    })
    .onConflictDoNothing();

  console.log(`\n🎉 Demo-accounts klaar — wachtwoord: ${PASSWORD}`);
  console.table([
    ["Beheerder + manager klas", "v.munster@weareimpact.nl", "alles, /admin"],
    ["Docent", "daan@impactinvest.nl", "sessies, beoordelen, materiaal"],
    ["Facilitator", "facilitator@demo.weareimpact.nl", "klas modereren"],
    ["Cursist (loopt mee)", "sara@circulairmode.nl", "klas, lessen, huiswerk"],
    ["Cursist (laat)", "thomas@groenestad.nl", "te late inlevering"],
    [
      "Alumnus + lidmaatschap",
      "alumnus@demo.weareimpact.nl",
      "kennisbank, alumnifeed",
    ],
    [
      "Alumna zonder lidmaatschap",
      "alumna@demo.weareimpact.nl",
      "kennisbank, geen lidmaatschap",
    ],
    ["Gewoon lid", "lid@demo.weareimpact.nl", "geen klas, geen kennisbank"],
  ]);
}

async function seedOnce(
  label: string,
  exists: () => Promise<unknown>,
  create: () => Promise<unknown>,
) {
  if (await exists()) return;
  await create();
  console.log(`✅ ${label}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
