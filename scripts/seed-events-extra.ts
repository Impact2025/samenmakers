/**
 * Extra demo-evenementen (komende weken, met aanmeldingen) en extra feedberichten
 * in de testeditie. Idempotent: bestaande slugs/titels worden overgeslagen.
 *
 * Gebruik: npx tsx --env-file=.env.local scripts/seed-events-extra.ts
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import * as schema from "../src/server/db/schema";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });
const { events, eventAttendees, feedPosts, cohorts } = schema;

const DAY = 86_400_000;
const HOUR = 3_600_000;
/** Dag n vanaf nu, op een vast uur (UTC). */
const at = (days: number, hour: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

type Seed = {
  slug: string;
  title: string;
  description: string;
  format: "in_person" | "online" | "hybrid";
  location: string | null;
  meetingUrl?: string;
  regio?: string;
  thema?: string;
  start: Date;
  hours: number;
  max: number | null;
  attendees: number;
};

const EVENTS: Seed[] = [
  {
    slug: "borrel-impact-ondernemers-utrecht",
    title: "Netwerkborrel voor impactondernemers",
    description:
      "Ongedwongen borrel om andere makers te ontmoeten, ervaringen te delen en samen te werken. Geen programma, wel goede gesprekken.",
    format: "in_person",
    location: "De Fabrique, Utrecht",
    regio: "Utrecht",
    thema: "Netwerken",
    start: at(6, 16),
    hours: 3,
    max: 60,
    attendees: 9,
  },
  {
    slug: "workshop-financiering-subsidies",
    title: "Workshop: financiering en subsidies voor je onderneming",
    description:
      "Welke subsidies, fondsen en investeerders passen bij jouw fase? Je werkt aan je eigen financieringsplan en krijgt direct feedback van een ervaren adviseur.",
    format: "hybrid",
    location: "Impact Hub, Amsterdam",
    meetingUrl: "https://meet.example.com/financiering",
    regio: "Amsterdam",
    thema: "Financiering",
    start: at(10, 9),
    hours: 4,
    max: 25,
    attendees: 25,
  },
  {
    slug: "webinar-storytelling-impact",
    title: "Webinar: storytelling voor je impactverhaal",
    description:
      "Een goed verhaal opent deuren bij klanten, fondsen en pers. In een uur leer je je impact in drie zinnen te vertellen.",
    format: "online",
    location: null,
    meetingUrl: "https://meet.example.com/storytelling",
    thema: "Communicatie",
    start: at(3, 12),
    hours: 1,
    max: null,
    attendees: 14,
  },
  {
    slug: "pitchtraining-rotterdam",
    title: "Pitchtraining met live feedback",
    description:
      "Oefen je pitch van 3 minuten voor een kleine groep en ontvang concrete tips van een jury van ondernemers en investeerders.",
    format: "in_person",
    location: "Codrico, Rotterdam",
    regio: "Rotterdam",
    thema: "Pitchen",
    start: at(17, 13),
    hours: 3,
    max: 16,
    attendees: 6,
  },
  {
    slug: "meetup-circulaire-economie",
    title: "Meetup: circulaire economie in de praktijk",
    description:
      "Drie ondernemers vertellen hoe zij circulair werken, wat het opleverde en waar ze tegenaan liepen. Daarna ruimte voor vragen en netwerken.",
    format: "in_person",
    location: "Het Glazen Huis, Eindhoven",
    regio: "Noord-Brabant",
    thema: "Duurzaamheid",
    start: at(24, 17),
    hours: 3,
    max: 80,
    attendees: 11,
  },
  {
    slug: "online-koffie-alumni",
    title: "Online alumni-koffie",
    description:
      "Een vrijblijvend half uur met alumni uit alle edities: wat houdt je bezig en waar kunnen we elkaar mee helpen?",
    format: "online",
    location: null,
    meetingUrl: "https://meet.example.com/alumni-koffie",
    thema: "Netwerken",
    start: at(1, 8),
    hours: 1,
    max: null,
    attendees: 7,
  },
  {
    slug: "dag-impact-meten-groningen",
    title: "Werkdag: je impact meten en rapporteren",
    description:
      "Bouw in één dag een eenvoudig impactmodel en rapportage voor je eigen organisatie. Neem je eigen cijfers mee.",
    format: "in_person",
    location: "Het Paleis, Groningen",
    regio: "Groningen",
    thema: "Impact meten",
    start: at(35, 8),
    hours: 7,
    max: 24,
    attendees: 5,
  },
];

const FEED: { kind: "hulpvraag" | "aanbod"; title: string; body: string }[] = [
  {
    kind: "hulpvraag",
    title: "Wie heeft ervaring met een BV of stichting oprichten?",
    body: "Ik twijfel tussen een stichting en een BV voor mijn project. Wie wil een halfuurtje meedenken over de voor- en nadelen?",
  },
  {
    kind: "aanbod",
    title: "Ik review graag je website of landingspagina",
    body: "Ik werk als UX-designer en kijk met je mee naar teksten en opbouw. Stuur me een bericht met de link.",
  },
  {
    kind: "hulpvraag",
    title: "Tips voor een eerste subsidieaanvraag?",
    body: "Ik wil een aanvraag doen bij een regionaal fonds en weet niet waar ik moet beginnen. Wie heeft een voorbeeld dat ik mag inzien?",
  },
  {
    kind: "aanbod",
    title: "Gratis hulp bij je boekhouding en btw-aangifte",
    body: "Ik help startende ondernemers met een eenvoudige opzet van hun administratie. Eén sessie van een uur, geheel vrijblijvend.",
  },
  {
    kind: "hulpvraag",
    title: "Zoek een sparringpartner voor mijn pitch",
    body: "Volgende maand pitch ik voor investeerders. Wie wil mijn pitch een keer doornemen en eerlijke feedback geven?",
  },
  {
    kind: "aanbod",
    title: "Ruimte voor workshops in Utrecht",
    body: "Ik heb een ruimte voor 20 personen die ik kan uitlenen voor workshops of intervisie. Laat het weten als je dat nodig hebt.",
  },
];

async function main() {
  const allUsers = await db.query.users.findMany({ limit: 60 });
  if (allUsers.length < 3)
    throw new Error("Te weinig gebruikers: draai eerst seed.ts");

  const organisers = allUsers.filter(
    (u) =>
      u.role === "admin" || u.role === "facilitator" || u.role === "docent",
  );
  const organiserPool = organisers.length ? organisers : allUsers;

  let madeEvents = 0;
  for (const [i, e] of EVENTS.entries()) {
    const exists = await db.query.events.findFirst({
      where: eq(events.slug, e.slug),
    });
    if (exists) continue;

    const id = crypto.randomUUID();
    await db.insert(events).values({
      id,
      organiserId: organiserPool[i % organiserPool.length]!.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      location: e.location,
      isOnline: e.format === "online",
      meetingUrl: e.meetingUrl ?? null,
      coverImageUrl: `https://picsum.photos/seed/${e.slug}/800/400`,
      startAt: e.start,
      endAt: new Date(e.start.getTime() + e.hours * HOUR),
      maxAttendees: e.max,
      isPublished: true,
      status: "published",
      format: e.format,
      visibility: "public",
      regio: e.regio ?? null,
      thema: e.thema ?? null,
      publishedAt: new Date(),
    });

    // Aanmeldingen: verspreid over de gebruikers, nooit meer dan de capaciteit.
    const n = Math.min(e.attendees, allUsers.length);
    const rows = allUsers.slice(i, i + n).map((u) => ({
      id: crypto.randomUUID(),
      eventId: id,
      userId: u.id,
      status: "registered" as const,
    }));
    if (rows.length) await db.insert(eventAttendees).values(rows);
    madeEvents++;
  }
  console.log(`✅ ${madeEvents} nieuwe evenementen`);

  // Bestaande demo-evenementen uit seed.ts stonden nog op concept: publiceer ze.
  await db
    .update(events)
    .set({ status: "published", publishedAt: new Date() })
    .where(and(eq(events.isPublished, true), eq(events.status, "draft")));

  // Extra feedberichten in de testeditie.
  const cohort = await db.query.cohorts.findFirst({
    where: eq(cohorts.name, "Cohort najaar 2026"),
  });
  if (!cohort) {
    console.log("ℹ️ Testeditie niet gevonden, feedberichten overgeslagen");
    return;
  }
  let madePosts = 0;
  for (const [i, p] of FEED.entries()) {
    const exists = await db.query.feedPosts.findFirst({
      where: and(
        eq(feedPosts.cohortId, cohort.id),
        eq(feedPosts.title, p.title),
      ),
    });
    if (exists) continue;
    await db.insert(feedPosts).values({
      cohortId: cohort.id,
      authorId: allUsers[(i * 3) % allUsers.length]!.id,
      kind: p.kind,
      title: p.title,
      body: p.body,
      createdAt: new Date(Date.now() - (i + 1) * 9 * HOUR),
    });
    madePosts++;
  }
  console.log(`✅ ${madePosts} nieuwe feedberichten`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
