# Samenmakers — Volledig Bouwplan

*Platform voor sociaal ondernemers: vinden, delen, ontmoeten*

---

## Pitch

**Verbinding als motor**
Sociaal ondernemers werken aan grote vraagstukken, maar vaak alleen. Dit platform brengt hen samen: om te sparren, kennis te delen en elkaar fysiek te ontmoeten. Geen LinkedIn, geen eventsite — maar een community waar impact centraal staat en samenwerking vanzelf ontstaat.

**Het gat in het ecosysteem**
Er zijn fondsen voor sociaal ondernemers, er zijn programma's en er zijn netwerken. Maar een plek waar je elkaar echt kunt vinden — op thema, op fase, op regio — ontbreekt. Dit platform vult dat gat: een matchingomgeving voor mensen die ondernemen met een missie.

**Van VaarSamen naar impact**
Net zoals VaarSamen zeilers verbindt die anders niet zouden varen, verbindt dit platform sociaal ondernemers die anders langs elkaar heen werken. Hetzelfde principe — vind, deel, ontmoet — toegepast op een sector die juist leeft van samenwerking.

---

## Design Prompt (Google Stitch)

Design a homepage for "Samenmakers" — a platform connecting social entrepreneurs in the Netherlands.

**Visual direction:** Brutally minimal. Lots of white space. Clean like Apple, warm like Airbnb, confident like Uber. No gradients, no decorations. Let space do the work.

**Typography:** Large, bold sans-serif headline (think Neue Haas Grotesk or similar). Small, light body text. Strong typographic hierarchy.

**Color palette:** White (#FFFFFF) dominant. Near-black (#111111) for text. One single accent: warm forest green (#2D6A4F) for CTAs only. Nothing else.

**Layout — top to bottom:**
1. Sticky nav — logo left, "Inloggen" + "Aanmelden" right. Hairline border bottom.
2. Hero — full-width white. Left-aligned headline (2 lines max): *"Vind je medemissie-ondernemer."* Subline in small gray. One green CTA button: "Maak een profiel". Right side: abstract grid of 4 profile cards (photo, naam, missie, regio).
3. Three-column section — icons + short labels: Vinden / Delen / Ontmoeten.
4. Horizontal scrolling featured profiles — minimal card: photo, name, 1-line mission.
5. Events block — list style, date left, title right. Clean table feel.
6. Footer — minimal, two columns.

**Overall feel:** Professional trust platform. Not a startup. Not a charity. Somewhere between LinkedIn and Airbnb. Every element earns its place.

---

## Tech Stack

| Onderdeel | Keuze |
|-----------|-------|
| Framework | Next.js 15 (App Router) |
| Database | Neon PostgreSQL |
| ORM | Drizzle |
| Auth | Clerk |
| Realtime | Pusher |
| Payments | Stripe |
| Uploads | UploadThing |
| Hosting | Vercel |
| Icons | Lucide React |

---

## Voorbereiding (eenmalig)

```powershell
node --version        # moet 18+ zijn
git --version
vercel --version      # zo niet: npm i -g vercel
```

Accounts aanmaken:
- **GitHub** — repo aanmaken: `samenmakers`
- **Vercel** — koppelen aan GitHub repo
- **Neon** — nieuwe database, connection string kopiëren
- **Clerk** — nieuw project, API keys kopiëren

---

## Stap 1 — Project opzetten

```powershell
npx create-next-app@latest samenmakers `
  --typescript --tailwind --app --src-dir

cd samenmakers

npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npm install @clerk/nextjs
npm install pusher pusher-js
npm install stripe @stripe/stripe-js
npm install lucide-react
npm install @uploadthing/react uploadthing
```

Maak `.env.local` aan:

```
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

```powershell
git init
git remote add origin https://github.com/jouw-naam/samenmakers.git
git add . && git commit -m "init"
git push -u origin main
```

---

## Stap 2 — Database schema

**Claude Code prompt:**

```
Maak een Drizzle ORM schema in /src/db/schema.ts voor een platform 
genaamd Samenmakers met de volgende tabellen:

- users: id, clerkId, naam, bio, missie, sector, regio, fase 
  (starter/groei/scale), avatarUrl, isFeatured, createdAt
- matches: id, userId, targetId, status (pending/matched/declined), createdAt
- messages: id, matchId, senderId, content, createdAt
- posts: id, authorId, title, slug, content, category 
  (blog/kennisbank/tool/funding), publishedAt
- events: id, organiserId, title, description, location, isOnline, 
  startAt, endAt, maxAttendees
- eventAttendees: id, eventId, userId, createdAt

Gebruik Neon serverless driver. Voeg ook drizzle.config.ts toe.
```

```powershell
npx drizzle-kit push
```

---

## Stap 3 — Module voor module bouwen

### Module 1 — Auth & profiel

```
Bouw auth met Clerk in Next.js App Router. Na login wordt de user 
opgeslagen in de users tabel (via clerkId). Maak een /profiel/aanmaken 
pagina met formulier: naam, missie, sector (dropdown), regio, fase. 
Sla op in Neon via Drizzle. Minimalistisch design: veel wit, 
sans-serif, één groen accent (#2D6A4F).
```

### Module 2 — Profieloverzicht & zoeken

```
Maak een /ontdekken pagina die alle users toont als kaarten 
(foto, naam, missie, regio). Voeg filteropties toe: sector, regio, fase. 
Zelfde minimalistisch design als de rest van de app.
```

### Module 3 — Tinder-matching

```
Bouw een /match pagina met swipe-functionaliteit (links = nee, 
rechts = ja). Gebruik de matches tabel. Bij mutual match: toon 
een melding en maak een chatroom aan. Mobile-first.
```

### Module 4 — Chat

```
Bouw real-time chat via Pusher op basis van de messages tabel. 
Alleen zichtbaar bij een matched koppel. Simpele UI: 
berichtenlijst + inputveld onderaan.
```

### Module 5 — Blog & kennisbank

```
Maak /kennis met een overzicht van posts gefilterd op category. 
Admins en Pro-leden kunnen posts aanmaken via /kennis/nieuw 
(markdown editor). Toon datum, auteur, categorie-label.
```

### Module 6 — Events

```
Bouw /events met een overzicht van aankomende events (datum links, 
titel rechts, locatie/online badge). Aanmelden via knop, 
opslaan in eventAttendees. Pro-leden kunnen events aanmaken.
```

### Module 7 — Admin dashboard

```
Maak een /admin route (alleen toegankelijk voor rol admin in Clerk). 
Toon: totaal users, nieuwe registraties, matches, events. 
Mogelijkheid om users te featuren (isFeatured toggle) en 
posts te modereren.
```

### Module 8 — Stripe subscriptions

```
Bouw twee Stripe-abonnementen: Basis (gratis) en Pro (€9/maand). 
Pro geeft toegang tot: onbeperkte matches, events aanmaken, 
kennisbank bijdragen. Gebruik Stripe Checkout + webhook voor 
status-update in de database.
```

---

## Stap 4 — Deployment

```powershell
vercel --prod
```

Stel env-variabelen in via het Vercel dashboard of:

```powershell
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
# etc.
```

---

## Planning

| Week | Focus |
|------|-------|
| 1 | Setup + auth + profielen |
| 2 | Ontdekken + matching |
| 3 | Chat + kennisbank |
| 4 | Events + admin |
| 5 | Stripe + polish |

---

## Kanttekening

Zelfde kip-en-ei-probleem als VaarSamen: zonder gebruikers geen matches. Verschil is dat je het netwerk hebt (Nyenrode, Oranje Fonds) om fase 1 te seeden. Doel: 20–30 profielen live vóór de matching live gaat.

---

*WeAreImpact — Innovatie met een sociaal hart*
