# Samenmakers

Platform voor sociaal ondernemers — vinden, delen, ontmoeten.

**Stack:** Next.js 15 · Neon PostgreSQL · Drizzle ORM · Auth.js v5 · Pusher · Stripe · Resend · Upstash Redis · Vercel Blob

---

## Lokaal ontwikkelen

```bash
cp .env.local.example .env.local
# Vul .env.local in met je credentials (zie stappen hieronder)

npm install
npm run dev
```

Open http://localhost:3000

---

## Deployment checklist

Doorloop deze stappen éénmalig voor je live gaat.

### 1. GitHub repo aanmaken

```bash
gh repo create samenmakers --private --source=. --push
# of via github.com → New repository → push existing
```

### 2. Neon database

1. Ga naar console.neon.tech → New project → regio `eu-central-1`
2. Kopieer **Connection string** (pooled) → `DATABASE_URL`
3. Kopieer **Direct connection** (unpooled) → `DATABASE_URL_UNPOOLED`
4. Push het schema:
   ```bash
   npx drizzle-kit push
   ```

### 3. Auth.js — OAuth providers

**Google:**
1. console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client
2. Authorized redirect URI: `https://jouwdomein.nl/api/auth/callback/google`
3. Kopieer Client ID → `AUTH_GOOGLE_ID`, Client Secret → `AUTH_GOOGLE_SECRET`

**LinkedIn:**
1. developer.linkedin.com → Create app → Auth tab
2. Redirect URL: `https://jouwdomein.nl/api/auth/callback/linkedin`
3. Kopieer Client ID → `AUTH_LINKEDIN_ID`, Client Secret → `AUTH_LINKEDIN_SECRET`

### 4. Pusher

1. dashboard.pusher.com → New app → regio `eu`, cluster `eu`
2. App Keys tab → kopieer naar `.env.local`:
   - `PUSHER_APP_ID`, `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER=eu`

### 5. Stripe

1. dashboard.stripe.com → Developers → API keys
   - `STRIPE_SECRET_KEY` (sk_live_... of sk_test_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_... of pk_test_...)
2. Products → Add product: "Pro" → €9/maand → kopieer Price ID → `STRIPE_PRO_PRICE_ID`
3. Webhooks → Add endpoint: `https://jouwdomein.nl/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Kopieer Signing secret → `STRIPE_WEBHOOK_SECRET`

### 6. Resend (email)

1. resend.com → API Keys → Create → kopieer → `RESEND_API_KEY`
2. Domains → Add domain: `samenmakers.nl` → voeg DNS records toe
3. Zet `RESEND_FROM_EMAIL=noreply@samenmakers.nl`

### 7. Upstash Redis

1. console.upstash.com → Create database → regio `eu-west-1`, type `Regional`
2. REST API tab → kopieer `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN`

### 8. Vercel deployment

```bash
npm i -g vercel
vercel login
vercel link          # koppel aan Vercel project
vercel env pull      # download env vars van Vercel (na instellen)
```

Of via vercel.com → New Project → Import Git Repository.

Voeg alle env vars toe via **Project Settings → Environment Variables**.

**Vercel Blob** (uploads):
- Vercel dashboard → Storage → Connect Store → Blob → selecteer je project
- `VERCEL_BLOB_READ_WRITE_TOKEN` wordt automatisch toegevoegd

### 9. Eerste admin aanmaken

Na eerste registratie — zet handmatig `role = 'admin'` in de database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'jouw@email.nl';
```

---

## Cron jobs

Geconfigureerd in `vercel.json`. Vercel voert ze automatisch uit op het opgegeven schema. Authenticatie via `CRON_SECRET` header.

| Job | Schema | Functie |
|-----|--------|---------|
| weekly-digest | maandag 08:00 | E-mail digest naar actieve users |
| event-reminders | dagelijks 09:00 | Reminders 24u voor events |
| publish-scheduled | elk uur | Posts publiceren die >7 dagen oud zijn |
| gdpr-cleanup | dagelijks 02:00 | Accounts verwijderen na deletion request |

---

## Database migraties

```bash
# Schema inspecteren (geen DB nodig)
npx drizzle-kit generate

# Schema pushen naar Neon
npx drizzle-kit push

# Drizzle Studio (lokale DB browser)
npx drizzle-kit studio
```

---

## Gegenereerde secrets (al ingevuld in .env.local)

- `AUTH_SECRET` — gegenereerd
- `CRON_SECRET` — gegenereerd
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — gegenereerd
