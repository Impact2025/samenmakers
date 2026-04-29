import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../src/server/db/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });

const DEMO_PASSWORD = "Demo1234!";

function slug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function id() {
  return randomUUID();
}

function rc() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function main() {
  console.log("🌱 Seeding database...");

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ─── USERS ───────────────────────────────────────────────────────────────

  const demoId = id();
  const u1 = id(), u2 = id(), u3 = id(), u4 = id(), u5 = id();
  const u6 = id(), u7 = id(), u8 = id(), u9 = id(), u10 = id();
  const u11 = id(), u12 = id(), u13 = id(), u14 = id(), u15 = id();

  await db.insert(schema.users).values([
    {
      id: demoId,
      name: "Vincent Munster",
      email: "v.munster@weareimpact.nl",
      password: hashed,
      naam: "Vincent Munster",
      bio: "Oprichter van WeAreImpact. Ik verbind sociaal ondernemers met kapitaal, kennis en netwerk om hun impact te vergroten.",
      missie: "Sociaal ondernemerschap toegankelijk maken voor iedereen die impact wil maken.",
      ikZoek: "Ondernemers die willen samenwerken aan schaalbare impactoplossingen.",
      sector: "Social Impact",
      regio: "Amsterdam",
      fase: "scale",
      avatarUrl: "https://i.pravatar.cc/300?img=11",
      expertise: ["Strategie", "Investering", "Netwerk", "Coaching"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 100,
      role: "admin",
      subscriptionStatus: "active",
      isFeatured: true,
      isVerified: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u1,
      name: "Sara Hoogenbosch",
      email: "sara@circulairmode.nl",
      password: hashed,
      naam: "Sara Hoogenbosch",
      bio: "Ik maak mode circulair. Met mijn bedrijf Circulaire Kledingkast haal ik kleding op bij bedrijven en geef het een tweede leven.",
      missie: "Een modeindustrie zonder afval, waar elke kledingstuk telt.",
      ikZoek: "Partners in logistiek en retailers die mee willen doen met circulaire ketens.",
      sector: "Mode & Textiel",
      regio: "Amsterdam",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=47",
      expertise: ["Circulaire economie", "Mode", "B2B", "Duurzaamheid"],
      mentorshipRole: "both",
      profileVisibility: "public",
      profileCompleteness: 95,
      subscriptionStatus: "active",
      isFeatured: true,
      isVerified: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u2,
      name: "Jurre van Dijk",
      email: "jurre@cleantechventures.nl",
      password: hashed,
      naam: "Jurre van Dijk",
      bio: "Technologie-ondernemer in schone energie. Mijn startup zet industriële restwarmte om in elektriciteit voor de wijk.",
      missie: "Energie die niemand gebruikt, nuttig maken voor iedereen.",
      ikZoek: "Gemeenten en woningcorporaties die restwarmte willen benutten.",
      sector: "Schone Energie",
      regio: "Rotterdam",
      fase: "starter",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
      expertise: ["CleanTech", "Hardware", "Energie", "Pilots"],
      mentorshipRole: "mentee",
      profileVisibility: "public",
      profileCompleteness: 80,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u3,
      name: "Amina El Ouazzani",
      email: "amina@voedselverspilling.nl",
      password: hashed,
      naam: "Amina El Ouazzani",
      bio: "Ik verbind supermarkten met voedselbanken via een digitaal platform. Elke dag gered voedsel is een dag minder verspilling.",
      missie: "Nul voedselverspilling in Nederland — dit jaar nog een derde minder.",
      ikZoek: "Tech-partner voor schaalbare app en investeerder voor groei naar 10 steden.",
      sector: "Voedsel & Landbouw",
      regio: "Utrecht",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=48",
      expertise: ["Platform", "Food", "Logistiek", "Impact meten"],
      mentorshipRole: "both",
      profileVisibility: "public",
      profileCompleteness: 90,
      subscriptionStatus: "active",
      isFeatured: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u4,
      name: "Thomas Bakker",
      email: "thomas@groenestad.nl",
      password: hashed,
      naam: "Thomas Bakker",
      bio: "Stedenbouwkundige turned impact-ondernemer. Ik ontwerp groene pleinen in kwetsbare wijken samen met bewoners.",
      missie: "Elke stadswijk een plek waar mensen buiten leven — groen en sociaal.",
      ikZoek: "Gemeenten en bewonersinitiatieven die samen een wijk willen vergroenen.",
      sector: "Bouw & Ruimte",
      regio: "Den Haag",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=15",
      expertise: ["Stedenbouw", "Co-creatie", "Subsidies", "Participatie"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 85,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u5,
      name: "Lisanne Smit",
      email: "lisanne@edtech4good.nl",
      password: hashed,
      naam: "Lisanne Smit",
      bio: "Ik ontwikkel digitale leertools voor kinderen in kansarme wijken. Onze app wordt gratis aangeboden aan scholen via subsidie en giften.",
      missie: "Gelijke kansen in onderwijs voor elk kind, ongeacht postcode.",
      ikZoek: "Scholen, gemeenten en fondsen die kansenongelijkheid willen aanpakken.",
      sector: "Onderwijs",
      regio: "Eindhoven",
      fase: "starter",
      avatarUrl: "https://i.pravatar.cc/300?img=49",
      expertise: ["EdTech", "UX", "Impact", "Fondswerving"],
      mentorshipRole: "mentee",
      profileVisibility: "public",
      profileCompleteness: 75,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u6,
      name: "Daan Frederiks",
      email: "daan@impactinvest.nl",
      password: hashed,
      naam: "Daan Frederiks",
      bio: "Impact investor en ondernemer. Ik financier en coach vroeg-fase impact startups. Eerder oprichter van twee exits.",
      missie: "Impact kapitaal beschikbaar maken voor ondernemers die het echt nodig hebben.",
      ikZoek: "Veelbelovende impact startups in seed-fase met sterke missie.",
      sector: "Financiën & Impact Investing",
      regio: "Amsterdam",
      fase: "scale",
      avatarUrl: "https://i.pravatar.cc/300?img=13",
      expertise: ["Investering", "Strategie", "Finance", "Coaching"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 100,
      subscriptionStatus: "active",
      isFeatured: true,
      isVerified: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u7,
      name: "Nora Willems",
      email: "nora@watertech.nl",
      password: hashed,
      naam: "Nora Willems",
      bio: "Waterbeheerder en ondernemer. Ik bouw slimme sensoren die waterverspilling in de landbouw met 40% verminderen.",
      missie: "Schoon water is een recht. Technologie helpt ons het te bewaken.",
      ikZoek: "Agrarische partners en investeerders voor uitrol in Noord-Afrika.",
      sector: "Water",
      regio: "Groningen",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=50",
      expertise: ["IoT", "Water", "Sensoren", "Internationaal"],
      mentorshipRole: "both",
      profileVisibility: "public",
      profileCompleteness: 88,
      subscriptionStatus: "active",
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u8,
      name: "Pieter Janssen",
      email: "pieter@deelmobiliteit.nl",
      password: hashed,
      naam: "Pieter Janssen",
      bio: "Mobiliteitsondernemer. Ik bouw een platform voor gedeelde elektrische busjes in dorpen zonder OV. Pilotfase in Zeeland.",
      missie: "Iedereen bereikbaar, ook als je op het platteland woont en geen auto hebt.",
      ikZoek: "Gemeenten, zorgverzekeraars en OV-partners voor uitbreiding.",
      sector: "Mobiliteit",
      regio: "Arnhem / Nijmegen",
      fase: "starter",
      avatarUrl: "https://i.pravatar.cc/300?img=14",
      expertise: ["Mobiliteit", "Platform", "OV", "Pilot"],
      mentorshipRole: "mentee",
      profileVisibility: "public",
      profileCompleteness: 70,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u9,
      name: "Fatima Bouchrit",
      email: "fatima@zorgtech.nl",
      password: hashed,
      naam: "Fatima Bouchrit",
      bio: "Verpleegkundige en ondernemer. Ik verbind mantelzorgers via een app zodat ze niet alleen staan. 5.000 gebruikers in een jaar.",
      missie: "Mantelzorg draagbaar houden — niemand mag omvallen van overbelasting.",
      ikZoek: "Zorgverzekeraars en gemeenten voor inkoop en verdere doorontwikkeling.",
      sector: "Gezondheid & Welzijn",
      regio: "Rotterdam",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=51",
      expertise: ["Zorg", "App", "Community", "Inkoop"],
      mentorshipRole: "both",
      profileVisibility: "public",
      profileCompleteness: 92,
      subscriptionStatus: "active",
      isFeatured: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u10,
      name: "Bas Vermeer",
      email: "bas@circulairbouwen.nl",
      password: hashed,
      naam: "Bas Vermeer",
      bio: "Aannemer en impact-ondernemer. Ik bouw woningen van gerecyclede materialen: 30% goedkoper, 50% minder CO₂.",
      missie: "Duurzaam bouwen betaalbaar maken voor iedereen in Nederland.",
      ikZoek: "Woningcorporaties en projectontwikkelaars voor eerste grootschalig project.",
      sector: "Bouw & Ruimte",
      regio: "Utrecht",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=17",
      expertise: ["Bouw", "Circulair", "B2B", "Aanbesteding"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 82,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u11,
      name: "Iris de Vries",
      email: "iris@sociaalondernemen.nl",
      password: hashed,
      naam: "Iris de Vries",
      bio: "Ik train en coach mensen met afstand tot de arbeidsmarkt voor banen in duurzame sectoren. 300 plaatsingen in 3 jaar.",
      missie: "De transitie naar een duurzame economie mag niemand achterlaten.",
      ikZoek: "Bedrijven die diversiteit en inclusie willen koppelen aan hun duurzaamheidsstrategie.",
      sector: "Social Impact",
      regio: "Amsterdam",
      fase: "scale",
      avatarUrl: "https://i.pravatar.cc/300?img=52",
      expertise: ["HR", "Inclusie", "Training", "Impact meten"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 96,
      subscriptionStatus: "active",
      isVerified: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u12,
      name: "Kevin Osei",
      email: "kevin@agritech.nl",
      password: hashed,
      naam: "Kevin Osei",
      bio: "Agrariër en tech-ondernemer. Met mijn startup help ik kleine boeren in Ghana betere prijzen te krijgen via directe handel.",
      missie: "Eerlijke handel voor kleine boeren wereldwijd via technologie.",
      ikZoek: "Impact investeerders en importeurs voor schaalvergroting naar West-Afrika.",
      sector: "Voedsel & Landbouw",
      regio: "Maastricht",
      fase: "starter",
      avatarUrl: "https://i.pravatar.cc/300?img=18",
      expertise: ["Agritech", "Fair Trade", "Internationaal", "App"],
      mentorshipRole: "mentee",
      profileVisibility: "public",
      profileCompleteness: 72,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u13,
      name: "Roos Hendriksen",
      email: "roos@duurzaamefood.nl",
      password: hashed,
      naam: "Roos Hendriksen",
      bio: "Chef-kok en ondernemer. Mijn restaurant gebruikt alleen overschotten van lokale boeren. 100% zero-waste keukens.",
      missie: "Laten zien dat zero-waste lekkerder en goedkoper is dan weggooien.",
      ikZoek: "Horecapartners en foodsystemvernieuwers voor een zero-waste-beweging.",
      sector: "Voedsel & Landbouw",
      regio: "Haarlem",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=53",
      expertise: ["Food", "Duurzaamheid", "Horeca", "Storytelling"],
      mentorshipRole: "both",
      profileVisibility: "public",
      profileCompleteness: 86,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u14,
      name: "Mehmet Yildiz",
      email: "mehmet@solarwijk.nl",
      password: hashed,
      naam: "Mehmet Yildiz",
      bio: "Ik installeer zonnepanelen collectief voor huurders die dat zelf niet kunnen betalen. Eerste wijk live in Rotterdam-Zuid.",
      missie: "Schone energie voor huurders, niet alleen voor huiseigenaren.",
      ikZoek: "Woningcorporaties en subsidiespecialisten voor snellere uitrol.",
      sector: "Schone Energie",
      regio: "Rotterdam",
      fase: "groei",
      avatarUrl: "https://i.pravatar.cc/300?img=19",
      expertise: ["Energie", "Huurders", "Zonnepanelen", "Subsidies"],
      mentorshipRole: "mentee",
      profileVisibility: "public",
      profileCompleteness: 78,
      referralCode: rc(),
      emailVerified: new Date(),
    },
    {
      id: u15,
      name: "Eva Kok",
      email: "eva@techforchange.nl",
      password: hashed,
      naam: "Eva Kok",
      bio: "CTO en mede-oprichter van een open-source platform dat NGOs helpt met data. We hebben al 200 organisaties aan boord.",
      missie: "Data democratiseren zodat kleine nonprofits even slim kunnen werken als grote.",
      ikZoek: "NGO-partners en grant-schrijvers voor verdere uitbreiding van ons team.",
      sector: "Duurzame Tech",
      regio: "Den Haag",
      fase: "scale",
      avatarUrl: "https://i.pravatar.cc/300?img=54",
      expertise: ["Tech", "Open source", "Data", "NGO"],
      mentorshipRole: "mentor",
      profileVisibility: "public",
      profileCompleteness: 93,
      subscriptionStatus: "active",
      isVerified: true,
      referralCode: rc(),
      emailVerified: new Date(),
    },
  ]);

  console.log("✅ Users aangemaakt (16)");

  // ─── EVENTS ──────────────────────────────────────────────────────────────

  const ev1 = id(), ev2 = id(), ev3 = id(), ev4 = id(), ev5 = id(), ev6 = id();

  await db.insert(schema.events).values([
    {
      id: ev1,
      organiserId: demoId,
      title: "Impact Pitch Night Amsterdam",
      slug: "impact-pitch-night-amsterdam",
      description: "Pitch jouw impact startup voor een zaal vol investeerders, ondernemers en potentiële partners. 8 pitches van elk 5 minuten, gevolgd door netwerken en drinks. Aanmelden voor een pitch via e-mail. Toeschouwers welkom.",
      location: "Pakhuis de Zwijger, Amsterdam",
      isOnline: false,
      coverImageUrl: "https://picsum.photos/seed/event1/800/400",
      startAt: new Date("2026-05-15T18:00:00Z"),
      endAt: new Date("2026-05-15T21:30:00Z"),
      maxAttendees: 120,
      isPublished: true,
    },
    {
      id: ev2,
      organiserId: u6,
      title: "Masterclass: Impact Meten voor Sociaal Ondernemers",
      slug: "masterclass-impact-meten",
      description: "Hoe laat je zien wat je doet? In deze hands-on masterclass leer je de SROI-methode, Theory of Change en hoe je investors overtuigt met harde cijfers. Maximaal 20 deelnemers voor intensieve begeleiding.",
      location: "Impact Hub, Rotterdam",
      isOnline: false,
      coverImageUrl: "https://picsum.photos/seed/event2/800/400",
      startAt: new Date("2026-05-22T09:30:00Z"),
      endAt: new Date("2026-05-22T16:00:00Z"),
      maxAttendees: 20,
      isPublished: true,
    },
    {
      id: ev3,
      organiserId: u15,
      title: "Webinar: Data & AI voor NGOs en Social Enterprises",
      slug: "webinar-data-ai-ngo",
      description: "Hoe gebruik je data en AI zonder groot tech-team? In dit webinar delen we praktische tools, open-source alternatieven en echte casussen van organisaties die al versneld werken met data.",
      location: null,
      isOnline: true,
      meetingUrl: "https://meet.google.com/demo-link",
      coverImageUrl: "https://picsum.photos/seed/event3/800/400",
      startAt: new Date("2026-05-28T15:00:00Z"),
      endAt: new Date("2026-05-28T16:30:00Z"),
      maxAttendees: 200,
      isPublished: true,
    },
    {
      id: ev4,
      organiserId: u3,
      title: "Samenmakers Borrel — Utrecht",
      slug: "samenmakers-borrel-utrecht",
      description: "Maandelijkse informele borrel voor impact-ondernemers in de regio Utrecht. Geen agenda, geen pitches — gewoon kennismaken, ervaringen delen en nieuwe ideeën opdoen. Eerste ronde op rekening van Samenmakers.",
      location: "Café de Zaak, Utrecht",
      isOnline: false,
      coverImageUrl: "https://picsum.photos/seed/event4/800/400",
      startAt: new Date("2026-06-05T17:00:00Z"),
      endAt: new Date("2026-06-05T20:00:00Z"),
      maxAttendees: 40,
      isPublished: true,
    },
    {
      id: ev5,
      organiserId: u11,
      title: "Workshop: Van Idee naar Subsidie in 6 Stappen",
      slug: "workshop-subsidie-aanvragen",
      description: "Subsidie aanvragen is een kunst. In deze workshop doorlopen we samen het hele proces: van een sterke projectomschrijving tot een overtuigende begroting. Je gaat naar huis met een kant-en-klaar concept voor jouw eerste aanvraag.",
      location: "Peerby Space, Amsterdam",
      isOnline: false,
      coverImageUrl: "https://picsum.photos/seed/event5/800/400",
      startAt: new Date("2026-06-12T10:00:00Z"),
      endAt: new Date("2026-06-12T13:00:00Z"),
      maxAttendees: 25,
      isPublished: true,
    },
    {
      id: ev6,
      organiserId: u4,
      title: "Circulaire Economie Hackathon — Den Haag",
      slug: "circulaire-economie-hackathon",
      description: "48-uurs hackathon rondom circulaire oplossingen voor de stad. Teams van 4–5 personen werken aan echte opdrachten van gemeenten en bedrijven. Prijzen: €5.000 voor het beste concept, plus begeleiding naar implementatie.",
      location: "The Hague Tech, Den Haag",
      isOnline: false,
      coverImageUrl: "https://picsum.photos/seed/event6/800/400",
      startAt: new Date("2026-06-20T09:00:00Z"),
      endAt: new Date("2026-06-22T17:00:00Z"),
      maxAttendees: 80,
      isPublished: true,
    },
  ]);

  console.log("✅ Events aangemaakt (6)");

  // ─── EVENT ATTENDEES ──────────────────────────────────────────────────────

  await db.insert(schema.eventAttendees).values([
    { id: id(), eventId: ev1, userId: demoId, status: "registered" },
    { id: id(), eventId: ev1, userId: u1, status: "registered" },
    { id: id(), eventId: ev1, userId: u3, status: "registered" },
    { id: id(), eventId: ev1, userId: u6, status: "registered" },
    { id: id(), eventId: ev1, userId: u9, status: "registered" },
    { id: id(), eventId: ev1, userId: u11, status: "checked_in" },
    { id: id(), eventId: ev2, userId: u2, status: "registered" },
    { id: id(), eventId: ev2, userId: u5, status: "registered" },
    { id: id(), eventId: ev2, userId: u7, status: "registered" },
    { id: id(), eventId: ev2, userId: u12, status: "waitlisted" },
    { id: id(), eventId: ev3, userId: demoId, status: "registered" },
    { id: id(), eventId: ev3, userId: u8, status: "registered" },
    { id: id(), eventId: ev3, userId: u10, status: "registered" },
    { id: id(), eventId: ev3, userId: u13, status: "registered" },
    { id: id(), eventId: ev4, userId: u3, status: "registered" },
    { id: id(), eventId: ev4, userId: u4, status: "registered" },
    { id: id(), eventId: ev4, userId: u10, status: "registered" },
    { id: id(), eventId: ev5, userId: demoId, status: "registered" },
    { id: id(), eventId: ev5, userId: u5, status: "registered" },
    { id: id(), eventId: ev5, userId: u14, status: "registered" },
    { id: id(), eventId: ev6, userId: u1, status: "registered" },
    { id: id(), eventId: ev6, userId: u7, status: "registered" },
    { id: id(), eventId: ev6, userId: u15, status: "registered" },
  ]);

  console.log("✅ Event aanmeldingen aangemaakt");

  // ─── POSTS ───────────────────────────────────────────────────────────────

  const publishedAt = new Date("2026-04-10T08:00:00Z");

  await db.insert(schema.posts).values([
    {
      id: id(),
      authorId: demoId,
      title: "Zo bouw je een waardepropositie voor impact-investeerders",
      slug: "waardepropositie-impact-investeerders",
      excerpt: "Investeerders denken anders dan subsidieverstrekkers. Leer hoe je je verhaal aanpast.",
      content: `## Waarom impact-investeerders anders denken\n\nAls je gewend bent aan subsidies, is de stap naar investeerders soms lastig. Subsidieverstrekkers willen maatschappelijke impact zien. Investeerders willen dat ook — maar ze willen ook een rendement.\n\nDat betekent niet dat je je missie moet verdunnen. Het betekent dat je jouw verhaal in twee talen moet kunnen vertellen.\n\n## De drie vragen die elke investeerder stelt\n\n**1. Wat is het probleem?** — Niet vaag ("de wereld is beter"), maar concreet en meetbaar.\n\n**2. Waarom jij?** — Wat maakt jou de juiste persoon of het juiste team voor dit probleem?\n\n**3. Hoe schaal je?** — Impact investeerders willen zien dat je model werkt en kan groeien.\n\n## Praktisch: de impact-canvas\n\nGebruik een impact-canvas naast je business model canvas. Vul in:\n- Outputindicatoren (wat produceer je?)\n- Outcome-indicatoren (wat verandert er bij de doelgroep?)\n- Impact-indicatoren (wat verandert er in de wereld?)\n\n## Conclusie\n\nJe hoeft niet te kiezen tussen missie en geld. Maar je moet leren om beiden te spreken.`,
      category: "blog",
      isPublished: true,
      publishedAt,
    },
    {
      id: id(),
      authorId: u6,
      title: "Gids: Impact Investing in Nederland 2026",
      slug: "gids-impact-investing-nederland-2026",
      excerpt: "Welke fondsen zijn er, wat zijn hun criteria en hoe stap je in? Een compleet overzicht.",
      content: `## Het landschap in 2026\n\nNederland heeft inmiddels een volwassen impact-investing ecosysteem. Van durfkapitaal tot obligaties — de opties groeien snel.\n\n## Belangrijke spelers\n\n**Seed-fase (< €500k)**\n- Doen Foundation\n- Noaber Foundation\n- Impact Hub Investment Fund\n\n**Groei-fase (€500k – €5M)**\n- Pymwymic\n- Triodos Investment Management\n- Rabobank Impact Lending\n\n**Scale-fase (> €5M)**\n- ABN AMRO Impact Finance\n- ASN Impact Investors\n- Europese Investeringsbank\n\n## Criteria die terugkomen\n\n1. Aantoonbare impact (liefst gemeten)\n2. Financieel rendement of break-even perspectief\n3. Sterk team\n4. Schaalbaar model\n\n## Tip\n\nBegin vroeg met relaties bouwen. De meeste fondsen nemen geen koude aanvragen aan.`,
      category: "kennisbank",
      isPublished: true,
      publishedAt: new Date("2026-04-05T08:00:00Z"),
    },
    {
      id: id(),
      authorId: u11,
      title: "Subsidie aanvragen als sociaal ondernemer: de 5 meest gemaakte fouten",
      slug: "subsidie-aanvragen-fouten-sociaal-ondernemer",
      excerpt: "Waarom worden zoveel aanvragen afgewezen en hoe vermijd jij die valkuilen?",
      content: `## Fout 1: Te vaag over resultaten\n\nSubsidieverstrekkers willen weten wat ze precies voor hun geld krijgen. "Meer bewustwording" is geen resultaat. "50 workshops bereiken 1.200 mensen in 6 maanden" wél.\n\n## Fout 2: Budget zonder onderbouwing\n\nElke post in je begroting moet uitlegbaar zijn. €5.000 voor "communicatie" — wat zit daarin? Ontwerp, drukwerk, social media? Wees specifiek.\n\n## Fout 3: De doelgroep niet centraal stellen\n\nJij bent niet de held van het verhaal — je doelgroep is dat. Schrijf vanuit hun perspectief.\n\n## Fout 4: Te laat beginnen\n\nEen goede aanvraag kost 40–80 uur. Plan dat ver van tevoren in.\n\n## Fout 5: Niet vragen om feedback\n\nVeel fondsen geven je de kans om een concept voor te bespreken. Gebruik dat altijd.`,
      category: "kennisbank",
      isPublished: true,
      publishedAt: new Date("2026-04-12T08:00:00Z"),
    },
    {
      id: id(),
      authorId: u15,
      title: "Tool: Gratis open-source alternatieven voor dure SaaS-tools",
      slug: "gratis-opensource-alternatieven-ngo-tools",
      excerpt: "Van CRM tot analytics — deze tools besparen je duizenden euro's per jaar.",
      content: `## CRM\n- **CiviCRM** — volledig gratis, speciaal voor nonprofits\n- **ERPNext** — open source ERP inclusief CRM\n\n## Project Management\n- **Plane** — gratis Jira-alternatief\n- **Nextcloud** — zelf-hosten, alles-in-één\n\n## Analytics\n- **Matomo** — privacy-vriendelijk Google Analytics alternatief\n- **Umami** — nog simpeler, zelf te hosten\n\n## Design\n- **Penpot** — Figma-alternatief, volledig open source\n\n## Formulieren & Surveys\n- **Formbricks** — Typeform-alternatief\n- **LimeSurvey** — voor complexe onderzoeken\n\n## Financiën\n- **GnuCash** — boekhouden voor kleine organisaties\n- **Actual** — budgettering\n\n## Tip\n\nVeel van deze tools draaien op Railway of Fly.io voor €5–10/maand — goedkoper dan elke SaaS.`,
      category: "tool",
      isPublished: true,
      publishedAt: new Date("2026-04-08T08:00:00Z"),
    },
    {
      id: id(),
      authorId: u3,
      title: "Hoe we in één jaar 180 ton voedsel redden — en wat we leerden",
      slug: "180-ton-voedsel-gered-lessen",
      excerpt: "Van twee vrijwilligers en een Excel-sheet naar een actief netwerk van 45 supermarkten.",
      content: `## Het begin\n\nIn april 2025 begonnen we met een simpele vraag: hoeveel voedsel gooit de supermarkt om de hoek weg? Het antwoord: elke dag bakken vol.\n\n## De eerste stap\n\nWe belden 10 supermarktmanagers. Twee reageerden. Met die twee begonnen we.\n\nDe eerste maand redden we 800 kilogram. Elke dinsdag en donderdag, met een eigen auto.\n\n## Wat werkte\n\n1. **Persoonlijk contact** — apps en platforms kwamen later, vertrouwen was eerst\n2. **Eenvoud** — supermarkten willen geen administratie, wij regelen het\n3. **Betrouwbaarheid** — elke afspraak nakomen, ook als het regende\n\n## Wat niet werkte\n\n- Grote retailers aanschrijven zonder introductie\n- Proberen alles tegelijk te schalen\n- Verwachten dat subsidie vanzelf zou komen\n\n## Vandaag\n\n45 supermarkten. 180 ton per jaar. 12 voedselbanken in de regio. En we zijn nog maar net begonnen.`,
      category: "blog",
      isPublished: true,
      publishedAt: new Date("2026-04-15T08:00:00Z"),
    },
    {
      id: id(),
      authorId: u6,
      title: "Funding Overzicht: Grants & Subsidies mei 2026",
      slug: "funding-overzicht-mei-2026",
      excerpt: "Alle open calls en subsidies voor impact startups in mei 2026.",
      content: `## Open Calls — sluit deze maand\n\n**Doen Foundation — Sociale Innovatie Grant**\n- Bedrag: €25.000 – €100.000\n- Deadline: 31 mei 2026\n- Focus: sociale cohesie, onderwijs, gezondheid\n\n**Rabobank Foundation — Lokale Initiatieven**\n- Bedrag: tot €15.000\n- Deadline: 15 mei 2026\n- Focus: voedsel, landbouw, lokale economie\n\n**RVO — Seed Capital**\n- Bedrag: €150.000 – €350.000\n- Deadline: doorlopend\n- Focus: innovatieve tech-startups\n\n## Europese Kansen\n\n**Horizon Europe — Social Innovation**\n- Bedrag: €2M – €5M\n- Partnerschap vereist (min. 3 landen)\n- Volgende ronde: september 2026\n\n## Tip van de maand\n\nBij het Oranje Fonds kun je op elk moment een verkenningsgesprek aanvragen — ook als je deadline al voorbij is.`,
      category: "funding",
      isPublished: true,
      publishedAt: new Date("2026-04-18T08:00:00Z"),
    },
  ]);

  console.log("✅ Posts aangemaakt (6)");

  // ─── MATCHES ─────────────────────────────────────────────────────────────

  const matchDemoU6 = id(); // vaste ID zodat we hem kunnen gebruiken voor berichten

  const matchRows = [
    { id: matchDemoU6, userId: demoId, targetId: u6, status: "matched" as const },
    { id: id(), userId: demoId, targetId: u1,  status: "matched" as const },
    { id: id(), userId: demoId, targetId: u3,  status: "matched" as const },
    { id: id(), userId: demoId, targetId: u9,  status: "matched" as const },
    { id: id(), userId: demoId, targetId: u11, status: "matched" as const },
    { id: id(), userId: u1,    targetId: u3,  status: "matched" as const },
    { id: id(), userId: u1,    targetId: u7,  status: "matched" as const },
    { id: id(), userId: u2,    targetId: u14, status: "matched" as const },
    { id: id(), userId: u3,    targetId: u9,  status: "matched" as const },
    { id: id(), userId: u4,    targetId: u10, status: "matched" as const },
    { id: id(), userId: u5,    targetId: u12, status: "matched" as const },
    { id: id(), userId: u6,    targetId: u11, status: "matched" as const },
    { id: id(), userId: u7,    targetId: u2,  status: "matched" as const },
    { id: id(), userId: u8,    targetId: u13, status: "matched" as const },
    { id: id(), userId: u9,    targetId: u15, status: "matched" as const },
  ];

  await db.insert(schema.matches).values(matchRows);

  console.log("✅ Matches aangemaakt (15)");

  // ─── MESSAGES ────────────────────────────────────────────────────────────

  await db.insert(schema.messages).values([
    {
      id: id(),
      matchId: matchDemoU6,
      senderId: u6,
      content: "Hey Vincent! Zag je profiel en was gelijk onder de indruk van WeAreImpact. Ik ben altijd op zoek naar sterke ondernemers voor mijn portfolio. Zou je een keer willen sparren?",
      createdAt: new Date("2026-04-20T10:00:00Z"),
    },
    {
      id: id(),
      matchId: matchDemoU6,
      senderId: demoId,
      content: "Daan, goed je te spreken! Absoluut, ik sta altijd open voor een gesprek met impact investors. Wanneer schikt het jou? Ik ben volgende week in Amsterdam.",
      createdAt: new Date("2026-04-20T10:45:00Z"),
    },
    {
      id: id(),
      matchId: matchDemoU6,
      senderId: u6,
      content: "Dinsdag 12:00 bij NDSM? Ik trakteer op lunch. Dan kunnen we rustig praten over de projecten in je netwerk.",
      createdAt: new Date("2026-04-20T11:00:00Z"),
    },
    {
      id: id(),
      matchId: matchDemoU6,
      senderId: demoId,
      content: "Perfect, tot dinsdag!",
      createdAt: new Date("2026-04-20T11:05:00Z"),
    },
  ]);

  console.log("✅ Berichten aangemaakt");

  // ─── QUESTIONS ───────────────────────────────────────────────────────────

  const q1 = id(), q2 = id(), q3 = id(), q4 = id();

  await db.insert(schema.questions).values([
    {
      id: q1,
      authorId: u2,
      title: "Hoe financier je een hardware-pilot als early-stage startup?",
      content: "Ik heb een werkend prototype van mijn restwarmte-sensor. De eerste pilot kost €45.000. Subsidie gaat te lang duren. Welke opties heb ik?",
      sector: "Schone Energie",
      isResolved: false,
    },
    {
      id: q2,
      authorId: u8,
      title: "Welke gemeenten zijn het meest open voor mobiliteitsexperimenten?",
      content: "Ik zoek een gemeente die durft te experimenteren met deelmobiliteit op het platteland. Heeft iemand goede ervaringen met een specifieke gemeente?",
      sector: "Mobiliteit",
      isResolved: false,
    },
    {
      id: q3,
      authorId: u12,
      title: "Hoe regel je betalingen voor boeren in Ghana via Nederland?",
      content: "We willen boeren in Ghana direct betalen vanuit Nederlandse importeurs. Welke betaaloplossingen werken daarvoor? SEPA werkt niet, crypto voelt riskant.",
      sector: "Voedsel & Landbouw",
      isResolved: false,
    },
    {
      id: q4,
      authorId: u5,
      title: "Aanvragen bij het Nationaal Groeifonds — ervaringen?",
      content: "We overwegen een aanvraag bij het Nationaal Groeifonds voor onze EdTech-aanpak. Heeft iemand ervaring met dit fonds? Tips voor de aanvraag?",
      sector: "Onderwijs",
      isResolved: true,
    },
  ]);

  await db.insert(schema.questionAnswers).values([
    {
      id: id(),
      questionId: q1,
      authorId: u6,
      content: "Kijk eens naar Innovatiefonds MKB+ van RVO — tot €150K voor pilots. Verder zijn er zogenoemde 'venture debt' constructies waarbij je geen aandelen hoeft te geven. Triodos biedt dit bijvoorbeeld. En vergeet WBSO niet voor de R&D-uren die je al maakt.",
      isAccepted: true,
    },
    {
      id: id(),
      questionId: q1,
      authorId: demoId,
      content: "Vanuit mijn netwerk: Metropoolregio Rotterdam Den Haag heeft een specifiek programma voor energiepilots. Stuur me een DM dan maak ik een introductie.",
      isAccepted: false,
    },
    {
      id: id(),
      questionId: q2,
      authorId: u4,
      content: "Zeeland experimenteert actief, maar ook Drenthe heeft een mooi programma voor plattelands-OV. In Friesland is de gemeente Noardeast-Fryslân erg open — ze hebben al eerder meegedaan aan pilots.",
      isAccepted: false,
    },
    {
      id: id(),
      questionId: q3,
      authorId: u15,
      content: "Probeer Bitpesa (nu AZA Finance) of Chipper Cash — beide zijn specifiek gebouwd voor Afrika. Voor kleine bedragen werkt M-Pesa ook als tussenstap. Geen crypto nodig.",
      isAccepted: true,
    },
    {
      id: id(),
      questionId: q4,
      authorId: u11,
      content: "Wij hebben het geprobeerd. Het vereist een penvoerder (vaak een universiteit of hogeschool), eigen cofinanciering van 50% en een sterk consortium. Tip: begin met een informeel gesprek bij de projectmanager van het fonds — dat bespaart je enorm veel schrijfwerk als het toch niet past.",
      isAccepted: true,
    },
  ]);

  console.log("✅ Vragen & antwoorden aangemaakt");

  // ─── MILESTONES ──────────────────────────────────────────────────────────

  await db.insert(schema.milestones).values([
    { id: id(), userId: demoId, title: "WeAreImpact opgericht", description: "Eerste kantoor geopend in Amsterdam-Noord.", createdAt: new Date("2022-03-01") },
    { id: id(), userId: demoId, title: "100 ondernemers begeleid", description: "Een mijlpaal die we in anderhalf jaar bereikten.", createdAt: new Date("2023-10-15") },
    { id: id(), userId: u3, title: "Platform live gegaan", description: "Onze eerste versie live met 3 supermarkten.", createdAt: new Date("2025-01-10") },
    { id: id(), userId: u3, title: "45 supermarkten aangesloten", description: "In één jaar naar 45 partnerlocaties gegroeid.", createdAt: new Date("2026-01-01") },
    { id: id(), userId: u1, title: "B Corp gecertificeerd", description: "Na 18 maanden werk eindelijk de B Corp status.", createdAt: new Date("2025-06-20") },
    { id: id(), userId: u9, title: "5.000 actieve gebruikers", description: "De mantelzorg-app groeit elke week.", createdAt: new Date("2026-02-01") },
    { id: id(), userId: u6, title: "€10M geïnvesteerd in portfolio", description: "Totaal geïnvesteerd kapitaal via Impact Invest.", createdAt: new Date("2026-04-01") },
  ]);

  console.log("✅ Milestones aangemaakt");

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────

  await db.insert(schema.notifications).values([
    {
      id: id(),
      userId: demoId,
      type: "new_match",
      title: "Nieuwe match met Sara Hoogenbosch",
      body: "Sara wil graag kennismaken. Ze zoekt partners in logistiek.",
      url: "/berichten",
      createdAt: new Date("2026-04-21T09:00:00Z"),
    },
    {
      id: id(),
      userId: demoId,
      type: "new_message",
      title: "Daan Frederiks stuurde je een bericht",
      body: "Hey Vincent! Zag je profiel en was gelijk onder de indruk...",
      url: "/berichten",
      createdAt: new Date("2026-04-20T10:00:00Z"),
    },
    {
      id: id(),
      userId: demoId,
      type: "event_reminder",
      title: "Morgen: Impact Pitch Night Amsterdam",
      body: "Je bent aangemeld voor Impact Pitch Night Amsterdam op 15 mei.",
      url: "/events",
      createdAt: new Date("2026-04-21T08:00:00Z"),
    },
    {
      id: id(),
      userId: demoId,
      type: "profile_view",
      title: "Daan Frederiks bekeek je profiel",
      body: "Impact investor Daan Frederiks heeft je profiel bekeken.",
      url: "/profiel/wie-bekeek-mij",
      createdAt: new Date("2026-04-19T14:00:00Z"),
    },
  ]);

  console.log("✅ Notificaties aangemaakt");

  // ─── PROFILE VIEWS ───────────────────────────────────────────────────────

  await db.insert(schema.profileViews).values([
    { id: id(), viewerId: u6, profileId: demoId, createdAt: new Date("2026-04-19T14:00:00Z") },
    { id: id(), viewerId: u1, profileId: demoId, createdAt: new Date("2026-04-20T09:00:00Z") },
    { id: id(), viewerId: u3, profileId: demoId, createdAt: new Date("2026-04-21T11:00:00Z") },
    { id: id(), viewerId: u11, profileId: demoId, createdAt: new Date("2026-04-21T13:00:00Z") },
    { id: id(), viewerId: demoId, profileId: u6, createdAt: new Date("2026-04-20T12:00:00Z") },
    { id: id(), viewerId: demoId, profileId: u9, createdAt: new Date("2026-04-21T10:00:00Z") },
  ]);

  console.log("✅ Profielbezoeken aangemaakt");

  console.log("\n🎉 Seed voltooid!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo inlog:  v.munster@weareimpact.nl");
  console.log("Wachtwoord:  Demo1234!");
  console.log("Rol:         Admin + Pro");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
