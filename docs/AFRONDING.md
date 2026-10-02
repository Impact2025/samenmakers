# Afrondingsplan: offerte WAI-SP-2026-0928 (We Shape The Future)

Peildatum 2 oktober 2026. Doel: testklaar in de week van 12 oktober, oplevering medio oktober,
inloggegevens naar deelnemers rond 18 oktober, start LSI-leergang 28 oktober.

## Stand van zaken

- Code onderwijs-module (sessies, aanwezigheid, huiswerk, lesmateriaal, mails, klasgrenzen,
  alumni-kennisbank, docentdashboard): grotendeels klaar, staat op `feat/docent-dashboard`.
- 38 commits liggen nog niet op `master`. Productie draait dus niet op deze code.
- Kennisbank: het materiaal staat al in één bibliotheek die alleen alumni zien, dus de
  "doorstroom" na afronding werkt via toegangsregels. Geen aparte kopieerstap nodig.
- Huiswerk: maximaal 10 bestanden en 15 MB per bestand zit in de code.
- Dossier-milestones staan deels nog op `todo` terwijl de code er al is.

## Fase 1 — Code samenbrengen (donderdag/vrijdag 2-3 okt)

1. [ ] `npm run type-check`, `npm run lint`, `npm test` op `feat/docent-dashboard`.
2. [ ] Branch mergen naar `master` (CI moet groen zijn).
3. [ ] Dossier-milestones bijwerken voor wat al klaar is (leeromgeving, beheerschermen,
       sessies, huiswerk, lesmateriaal, automatische mails, beveiligde bestanden).
4. [ ] Open gaten in de code controleren: events/tickets met betaling (zie `docs/events-plan.md`),
       leeromgeving (zie `docs/leeromgeving-plan.md`). Alles wat daar nog niet af is, bouwen.

## Fase 2 — Productie inrichten (voor 6 okt, kick-off)

Volgens `docs/LIVEGANG.md`:

1. [ ] Database: `scripts/apply-events-migrations.ts` op productie (eerst de dubbele-coupons-check).
2. [ ] Vercel Blob: **privé** store aanmaken, `BLOB_PRIVATE_READ_WRITE_TOKEN` zetten.
3. [ ] Stripe: live-keys, live-webhook `/api/stripe/webhook`, `STRIPE_CONNECT_WEBHOOK_SECRET`.
4. [ ] Pusher-keys (realtime) en Upstash-token (rate limiting).
5. [ ] Resend: domein verifiëren (SPF, DKIM, DMARC), `RESEND_FROM_EMAIL` op eigen afzender.
6. [ ] `CRON_API_KEY` en overige env-variabelen in Vercel Production; `SKIP_ENV_VALIDATION` uit.
7. [ ] Eigen domein van We Shape The Future koppelen.
8. [ ] Neon: dagelijkse back-ups en retentie controleren; uptime-monitoring aanzetten
       (offerte belooft beide).

## Fase 3 — Testen (week van 12 okt)

1. [ ] Rooktest uit `docs/LIVEGANG.md` (secties 4 en 5).
2. [ ] Betalen uitgebreid testen met testbetalingen: ticket, jaarlidmaatschap 150 euro,
       opzeggen, kortingscode, uitbetaling organisator.
3. [ ] Alle zes rollen doorlopen: beheerder, facilitator, docent, cursist, alumnus, lid.
4. [ ] Docentvenster: toegang vanaf 14 dagen ervoor tot 14 dagen erna.
5. [ ] Mails: briefing 3 weken, voorbereiding 2 weken, openstaande opdrachten 3 dagen vooraf.
6. [ ] Gezamenlijke gebruikersacceptatietest met Nicole + instructiesessie.

## Fase 4 — Oplevering (medio oktober)

1. [ ] Escrow: Deployment & Architecture Runbook schrijven (`docs/RUNBOOK.md`) en deponeren.
2. [ ] Escrow: afgeschermde repository met kopie van de code.
3. [x] Data-export (JSON/CSV) van alle organisatiedata controleren of toevoegen.
4. [ ] Tweede factuur (termijn 2, 1.815 incl. btw) versturen.
5. [ ] Algemene voorwaarden en privacyverklaring afstemmen op de app (Vincent + juridisch).
6. [ ] Naam afstemmen: offerte zegt "ImpactOS – Community", app heet nu "Weave".

## Fase 5 — Livegang (18-28 okt)

1. [ ] Rond 18 okt: studiegids en inloggegevens naar deelnemers (We Shape The Future).
2. [ ] 28 okt: start LSI-leergang op het platform; die dag meekijken.

## Open vragen

- Is de offerte al online bevestigd door Nicole? Zonder akkoord geen eerste factuur.
- Welke naam moet in de app staan: Weave of ImpactOS – Community?
- Bestaat er testdata in productie die bij de overstap naar privé-opslag moet worden verwijderd?
