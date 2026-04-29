export const SECTOREN = [
  "Circulaire Economie",
  "Duurzame Tech",
  "Social Impact",
  "Schone Energie",
  "Voedsel & Landbouw",
  "Gezondheid & Welzijn",
  "Onderwijs",
  "Mobiliteit",
  "Bouw & Ruimte",
  "Financiën & Impact Investing",
  "Mode & Textiel",
  "Water",
  "Overig",
] as const;

export type Sector = (typeof SECTOREN)[number];

export const REGIO_S = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Maastricht",
  "Arnhem / Nijmegen",
  "Den Bosch",
  "Breda",
  "Tilburg",
  "Haarlem",
  "Leiden",
  "Delft",
  "Heel Nederland",
  "Internationaal",
] as const;

export type Regio = (typeof REGIO_S)[number];

export const FASEN = [
  { value: "starter", label: "Starter (0–2 jaar)" },
  { value: "groei", label: "Groei (2–5 jaar)" },
  { value: "scale", label: "Scale-up (5+ jaar)" },
] as const;

export type Fase = (typeof FASEN)[number]["value"];

export const POST_CATEGORIES = [
  { value: "blog", label: "Blog" },
  { value: "kennisbank", label: "Kennisbank" },
  { value: "tool", label: "Tool" },
  { value: "funding", label: "Funding" },
] as const;

export const MENTORSHIP_ROLES = [
  { value: "mentor", label: "Mentor" },
  { value: "mentee", label: "Mentee" },
  { value: "both", label: "Beiden" },
  { value: "none", label: "Geen voorkeur" },
] as const;

export const ZOEKT_NAAR_OPTIONS = [
  { value: "co-founder", label: "Co-founder" },
  { value: "mentor", label: "Mentor" },
  { value: "mentee", label: "Mentee (coaching geven)" },
  { value: "investeerder", label: "Investeerder" },
  { value: "klant", label: "Klanten / gebruikers" },
  { value: "leverancier", label: "Leverancier / partner" },
  { value: "team-lid", label: "Team lid" },
  { value: "leerpartner", label: "Leerpartner" },
] as const;

export type ZoektNaar = (typeof ZOEKT_NAAR_OPTIONS)[number]["value"];

export const PRO_FEATURES = [
  "Onbeperkt swipen",
  "Wie bekeek mijn profiel",
  "Posts en events aanmaken",
  "Q&A antwoorden",
  "Prioriteit in zoekresultaten",
  "Mentorschap-modus",
  "Geavanceerde filters",
] as const;

export const FREE_SWIPES_PER_DAY = 20;
