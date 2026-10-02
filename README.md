# Weave

Het platform waar purpose-driven ondernemers elkaar vinden en versterken.

**Stack:** Next.js 16 · React 19 · TypeScript · tRPC v11 · Drizzle ORM · Neon · Tailwind 4 · Stripe · Pusher · Resend

---

## 🚀 Snel starten

```bash
# 1. Clone & installeer
git clone https://github.com/Impact2025/samenmakers.git
cd samenmakers
npm install

# 2. Kopieer env en vul in
cp .env.example .env.local
# — vul alle variabelen in (zie .env.example voor documentatie)

# 3. Push database schema
npm run db:push

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📋 Beschikbare scripts

| Commando                | Doel                                    |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Dev server (turbopack, 4 GB heap)       |
| `npm run build`         | Productiebuild                          |
| `npm start`             | Start productieserver                   |
| `npm run type-check`    | TypeScript controleren (`tsc --noEmit`) |
| `npm run lint`          | ESLint                                  |
| `npm test`              | Unit tests (Vitest)                     |
| `npm run test:watch`    | Tests in watch-modus                    |
| `npm run test:coverage` | Tests met coverage-rapport              |
| `npm run db:push`       | Schema naar database pushen             |
| `npm run db:studio`     | Drizzle Studio openen                   |
| `npm run db:generate`   | Migratie genereren                      |
| `npm run db:migrate`    | Migratie uitvoeren                      |

---

## 🏛️ Projectstructuur

```
src/
├── app/
│   ├── (admin)/admin/    — Admin suite
│   ├── (app)/            — Gebruikersapp (dashboard, makers, matching, etc.)
│   ├── (auth)/           — Login/registratie
│   └── api/              — API routes (Stripe, cron, auth, push)
├── components/
│   ├── layout/           — Sidebar, TopBar, BottomNav
│   ├── providers/        — TRPCProvider, SW-register
│   └── ui/               — Herbruikbare componenten + ErrorBoundary
├── hooks/                — React hooks
├── lib/                  — Utility's (SEO, markdown, ratelimit, AI, email, push)
└── server/
    ├── admin/            — Metrics, segment-resolver
    ├── auth/             — NextAuth config
    ├── db/               — Drizzle schema + client
    └── trpc/             — tRPC routers (15x), root, init
```

---

## 🔐 Omgevingsvariabelen

Zie [`.env.example`](.env.example) voor de volledige lijst met documentatie per variabele.

Benodigde externe services:

- **Neon** — PostgreSQL (DATABASE_URL)
- **Google Cloud** — OAuth client (inloggen met Google)
- **LinkedIn** — OAuth client (inloggen met LinkedIn)
- **Pusher** — Real-time chat
- **Stripe** — Abonnementen + coupons
- **Resend** — E-mail (transacties + campagnes)
- **Upstash** — Redis rate limiting
- **OpenRouter** — AI blog- en e-mailgeneratie
- **Vercel Blob** — Bestandsuploads
- **Web Push** — Browser notificaties (VAPID)

---

## 🧪 Tests

```bash
npm test                  # Alle tests
npm run test:watch        # Watch-modus
npm run test:coverage     # Coverage rapport
```

Tests staan naast de bronbestanden (`*.test.ts`). Zie `vitest.config.mts` voor configuratie.

---

## 🔄 CI/CD

Bij elke push/PR naar `master` of `feat/*` draait GitHub Actions:

1. `npm ci`
2. TypeScript check (`tsc --noEmit`)
3. ESLint
4. Unit tests (Vitest)
5. Build (`next build`)

Zie [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 🪝 Pre-commit hooks (Husky + lint-staged)

Bij elke commit worden automatisch:

- TS/TSX bestanden: ESLint gefixt + Prettier formatted
- JSON/CSS/MD: Prettier formatted

Dit wordt afgedwongen via `.husky/pre-commit`.

---

## 🏗️ Database

Gebruikt **Drizzle ORM** met **Neon PostgreSQL**.

Belangrijkste tabellen: `users`, `matches`, `messages`, `posts`, `events`, `notifications`, `cohorts`, `coupons`, `crm_activities`, `email_campaigns`, `audit_log`.

```bash
npm run db:push          # Push schema direct naar DB
npm run db:generate      # Genereer migraties
npm run db:migrate       # Voer migraties uit
npm run db:studio        # Drizzle Studio (GUI)
```

---

## 📄 License

Private — Impact2025
