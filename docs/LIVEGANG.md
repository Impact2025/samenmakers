# Livegang-checklist

Wat er vóór productie nog handmatig moet gebeuren. De code-kant (security-review sept 2026) is afgerond.

## 1. Database

```bash
# Controleer eerst op dubbele coupon-inwisselingen (moet 0 rijen geven):
#   SELECT stripe_session_id, count(*) FROM coupon_redemptions
#   WHERE stripe_session_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
npx tsx --env-file=.env.local scripts/apply-events-migrations.ts
```

Past `drizzle/security-fase1.sql` toe (unieke index op coupon-inwisselingen, index op `lower(email)`).
Optioneel: bestaande e-mailadressen met hoofdletters normaliseren naar kleine letters
(inloggen werkt ook zonder, want er wordt hoofdletterongevoelig gezocht).

## 2. Omgevingsvariabelen (Vercel → Production)

| Variabele                                                  | Status lokaal | Nodig voor                                                       |
| ---------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | test-keys     | **live**-keys zetten                                             |
| `STRIPE_WEBHOOK_SECRET`                                    | gezet         | live-webhook op `/api/stripe/webhook`                            |
| `STRIPE_CONNECT_WEBHOOK_SECRET`                            | ontbreekt     | ticketverkoop (account.updated)                                  |
| `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY` | leeg          | realtime chat                                                    |
| `UPSTASH_REDIS_REST_TOKEN`                                 | leeg          | rate limiting over alle instanties                               |
| `BLOB_READ_WRITE_TOKEN`                                    | leeg          | uploads van profielfoto's en eventbeelden (publieke store)       |
| `BLOB_PRIVATE_READ_WRITE_TOKEN`                            | ontbreekt     | **huiswerk en lesmateriaal**: token van een **privé** Blob-store |
| `AUTH_GOOGLE_*`, `AUTH_LINKEDIN_*`                         | leeg          | optioneel; knoppen verschijnen alleen als ze gezet zijn          |
| `OPENROUTER_API_KEY`, `MANAGEMENT_EMAIL`                   | ontbreekt     | optioneel (AI-blog, KPI-mails)                                   |
| `SKIP_ENV_VALIDATION`                                      | `true`        | **niet** zetten in productie                                     |

## 3. E-mail (Resend)

- Domein verifiëren (SPF, DKIM, DMARC) voor het adres in `RESEND_FROM_EMAIL`.
- Testen: registreren (welkomstmail) en wachtwoord vergeten (resetlink, 1 uur geldig).

## 4. Rooktest na deploy

- Registreren, uitloggen, inloggen met hoofdletters in het e-mailadres.
- Wachtwoord vergeten → mail → nieuw wachtwoord → inloggen.
- Match maken en chatten tussen twee accounts (realtime).
- Pro-abonnement afsluiten met een testkaart, daarna opzeggen: Pro verdwijnt binnen 5 minuten.
- Admin: gebruiker schorsen → die wordt binnen 5 minuten uitgelogd en kan niet meer inloggen.
- Profielfoto uploaden (JPG/PNG/WebP), een .html of .svg moet geweigerd worden.
- Account verwijderen aanvragen → uitgelogd; opnieuw inloggen annuleert de aanvraag.

## 5. Beveiligde bestanden (huiswerk en lesmateriaal)

- Maak in Vercel een Blob-store met **privé**-toegang en zet het token als `BLOB_PRIVATE_READ_WRITE_TOKEN`. Zonder dat token gebruikt de app `BLOB_READ_WRITE_TOKEN` voor privé-uploads, en dat werkt alleen als die store privé is.
- Zet `BLOB_DOCUMENT_ACCESS` **niet** op `public` in productie.
- Rooktest: upload huiswerk als cursist, open het als die cursist (werkt), open dezelfde link uitgelogd of als andere cursist (404), open het als docent van de editie (werkt) en als docent buiten zijn toegangsvenster (404).
- Bestanden die vóór deze wijziging op publieke opslag zijn gezet, blijven op hun oude URL bereikbaar. Op een verse productie-omgeving speelt dat niet; bestaat er testdata, verwijder of migreer die dan.
