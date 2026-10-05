# Deployment & Architecture Runbook

Continuïteitsdocument voor We Shape The Future (escrow, offerte WAI-SP-2026-0928, sectie 8).
Bevat geen geheimen. Waarden van variabelen staan in Vercel (Production) en worden bij
deponering apart en versleuteld overhandigd.

Laatst bijgewerkt: oktober 2026. Bij elke release met wijzigingen in infrastructuur bijwerken.

## 1. Architectuur in het kort

| Onderdeel      | Keuze                                 | Doel                                                      |
| -------------- | ------------------------------------- | --------------------------------------------------------- |
| App            | Next.js 16 (App Router), React 19, TS | Web-applicatie en API                                     |
| API            | tRPC v11 (`src/server/trpc`)          | Typeveilige server-aanroepen, routers per domein          |
| Database       | Neon PostgreSQL + Drizzle ORM         | Alle gegevens (50+ tabellen, `src/server/db`)             |
| Hosting        | Vercel                                | Build, serverless runtime, cron                           |
| Betalingen     | Stripe (+ Connect voor uitbetaling)   | Lidmaatschap, tickets, kortingscodes                      |
| Realtime       | Pusher                                | Chat en meldingen                                         |
| E-mail         | Resend                                | Transactionele mail en geplande mailings                  |
| Bestandsopslag | Vercel Blob                           | Publiek: profielfoto's. **Privé**: huiswerk, lesmateriaal |
| Rate limiting  | Upstash Redis                         | Beperkt misbruik over alle instanties                     |
| AI (optioneel) | OpenRouter                            | Redactionele ondersteuning                                |

Documenten (huiswerk, lesmateriaal) hebben geen publieke URL. Download loopt via
`/api/bestanden/[type]/[id]` en controleert bij elke aanvraag de ingelogde gebruiker.

## 2. Vereisten

- Node.js 20, npm
- Accounts: GitHub (repo `Impact2025/samenmakers`), Vercel, Neon, Stripe, Pusher, Resend,
  Upstash, domeinregistrar/DNS van We Shape The Future

## 3. Omgevingsvariabelen

Volledige lijst en uitleg: `.env.example`. Productie (Vercel → Settings → Environment Variables):

- Database: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- Auth: `AUTH_SECRET` (+ optioneel `AUTH_GOOGLE_*`, `AUTH_LINKEDIN_*`)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`,
  `STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `EVENT_PLATFORM_FEE_*`,
  `NEXT_PUBLIC_FEATURE_EVENT_TICKETS`
- Pusher: `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
- Mail: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Rate limiting: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Cron: `CRON_SECRET`
- Opslag: `BLOB_READ_WRITE_TOKEN` (publiek), `BLOB_PRIVATE_READ_WRITE_TOKEN` (privé)
- Overig: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `MANAGEMENT_EMAIL`
- `SKIP_ENV_VALIDATION` mag in productie **niet** gezet zijn.
- `BLOB_DOCUMENT_ACCESS` mag in productie niet `public` zijn.

## 4. Nieuwe omgeving opzetten

1. Repo clonen, `npm ci`.
2. Neon-database aanmaken, `DATABASE_URL` en `DATABASE_URL_UNPOOLED` zetten.
3. Schema aanbrengen: `npm run db:push` (verse database), of de SQL-bestanden in `drizzle/`
   via `scripts/apply-sql.ts` / `scripts/apply-events-migrations.ts`.
4. Vercel-project koppelen aan de repo, alle variabelen uit sectie 3 zetten, branch `master`
   als productie.
5. Domein koppelen in Vercel en DNS bijwerken.
6. Resend: domein verifiëren (SPF, DKIM, DMARC).
7. Stripe: twee webhooks naar hetzelfde endpoint `/api/stripe/webhook` (een voor het account,
   een voor Connect), elk met eigen secret (`STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`).
8. Eerste beheerder aanmaken en rooktest uitvoeren (`docs/LIVEGANG.md`).

## 5. Release

- Werk op feature-branch, PR naar `master`. CI (`.github/workflows`) draait type-check,
  lint en tests; Vercel maakt per PR een preview.
- Merge naar `master` deployt productie automatisch.
- Rollback: in Vercel → Deployments een eerdere deployment "Promote to Production".
  Databasewijzigingen zijn niet automatisch terug te draaien, maak daarvoor eerst een Neon-branch
  of back-up.

## 6. Geplande taken (`vercel.json`)

| Pad                                      | Schema                          | Doel                                                                                   |
| ---------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| `/api/jobs/session-mailings`             | dagelijks 06:30                 | Briefing docent (3 wk), voorbereiding cursist (2 wk), openstaande opdrachten (3 dagen) |
| `/api/jobs/event-reminders`              | elk uur :15                     | Eventherinneringen                                                                     |
| `/api/jobs/publish-scheduled`            | elk uur                         | Geplande publicaties                                                                   |
| `/api/jobs/gdpr-cleanup`                 | dagelijks 02:00                 | AVG-retentie en verwijderverzoeken                                                     |
| `/api/jobs/weekly-digest`                | maandag 08:00                   | Weekoverzicht                                                                          |
| `/api/jobs/management-daily` / `-weekly` | dagelijks 07:00 / maandag 07:30 | KPI-mails beheer, incl. systeemstatus                                                  |
| `/api/jobs/system-watch`                 | dagelijks 08:00                 | Alertmail alleen als een taak mislukte of niet draaide                                 |

Taken verwachten `CRON_SECRET` als bearer-token (Vercel stuurt dit mee).

## 7. Back-up en herstel

- Neon: automatische back-ups en point-in-time restore volgens het gekozen plan. Herstel via
  Neon-console door een branch op een eerder tijdstip te maken en `DATABASE_URL` om te zetten.
- Vercel Blob: geen automatische versiegeschiedenis. Bestanden zijn hier opnieuw aan te
  leveren door cursisten/docenten; overweeg periodieke export als dit onvoldoende is.
- Data-export voor de opdrachtgever: tabellen als JSON/CSV exporteerbaar (per gebruiker via
  `/api/gdpr/export`; volledige organisatie-export voor beheerders via `/api/admin/export`).

## 8. Monitoring en incidenten

Alle meldingen gaan per e-mail naar `MANAGEMENT_EMAIL` (standaard v.munster@weareimpact.nl).
Stilte betekent dat alles draait.

| Laag                | Wat                                                                              | Waar                                |
| ------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| Beschikbaarheid     | `GET /api/health` (200 = app + database ok, 503 = database antwoordt niet)       | Externe uptime-check, zie hieronder |
| Fouten              | Sentry (`NEXT_PUBLIC_SENTRY_DSN`), zonder persoonsgegevens, mail bij nieuwe fout | sentry.io                           |
| Geplande taken      | Elke run staat in `job_runs`; bij een fout meteen een alertmail                  | `src/server/monitoring/job-run.ts`  |
| Taak blijft weg     | `/api/jobs/system-watch` (dagelijks 08:00) mailt alleen bij mislukt/te laat      | `src/lib/job-health.ts` (schema's)  |
| Dagelijks overzicht | Blok "Systeemstatus" in de dagelijkse managementmail (07:00)                     | `management-daily`                  |
| Afhankelijkheden    | Dependabot (maandag) + `npm audit` in CI; productie-audit moet op 0 staan        | `.github/dependabot.yml`, CI        |

**Eenmalig instellen (accounts, gratis tier):**

1. Sentry: project "Next.js" aanmaken, DSN in Vercel zetten als `NEXT_PUBLIC_SENTRY_DSN`
   (Production + Preview). Alerts → "Send a notification for new issues" naar e-mail.
2. Uptime: UptimeRobot of Better Stack, monitor op `https://<domein>/api/health` (elke
   5 min, alert per e-mail) en een op `/inloggen`.
3. Tabel `job_runs` aanbrengen: `npx tsx --env-file=.env.local scripts/apply-sql.ts drizzle/monitoring-fase1.sql`.

**Beheer en veiligheid**

- `/admin/systeem` toont per geplande taak de laatste run, recente fouten en wat op actie wacht;
  het beheerdashboard zet dit bovenaan als "vraagt actie".
- Elke beheerhandeling (mutation via `adminProcedure`) komt automatisch in de audit log. Procedures
  die zelf met meer detail loggen staan in `MANUALLY_AUDITED` (`src/server/trpc/init.ts`); een nieuwe
  procedure die zelf logt moet daar bij.
- Een beheerder kan zichzelf niet schorsen, blokkeren of de eigen beheerdersrol intrekken, en de laatste
  actieve beheerder kan niet worden uitgeschakeld (`src/lib/admin-guards.ts`).
- Ondersteuning bij een gebruiker (menu "Opties"): wachtwoord-reset sturen, e-mail als bevestigd markeren.
  Editie beheren: cursisten in bulk koppelen via een geplakte lijst met e-mailadressen.
- Cron-routes weigeren altijd als `CRON_SECRET` ontbreekt of korter is dan 32 tekens (`src/lib/cron-auth.ts`).
- Content-Security-Policy staat in `Report-Only`: de browser meldt schendingen in de console zonder iets te
  blokkeren. Na een schone periode omzetten naar `Content-Security-Policy` in `next.config.ts`.

**Nieuwe cron toevoegen:** wikkel de handler in `withJobRun("naam", ...)`, voeg de taak met de
maximale leeftijd van een run toe aan `JOBS` in `src/lib/job-health.ts` en zet hem in `vercel.json`.

**Bij een melding:** taak mislukt of te laat → Vercel → Logs (filter op de taaknaam), daarna de
route handmatig aanroepen met `Authorization: Bearer $CRON_SECRET`. Stripe-webhookfouten: Stripe-dashboard →
Webhooks. Mailaflevering: Resend-dashboard. Rollback: sectie 5.

**Maandelijks:** een Neon-back-up terugzetten naar een testbranch om te bewijzen dat herstel werkt.

## 9. Overdracht bij noodlicentie

Bij ingang van de noodlicentie krijgt We Shape The Future: (1) de code uit de escrow-repository,
(2) dit document, (3) de versleutelde set sleutels/tokens van sectie 3, (4) toegang tot Vercel,
Neon, Stripe en Resend via eigen accounts. Volg daarna sectie 4.
