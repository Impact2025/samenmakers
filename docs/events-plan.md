# Samenmakers Eventsysteem — Projectplan

Status: fase 1 gebouwd (migratie nog toe te passen) · Bouwt voort op het bestaande eventsysteem en sluit aan op [leeromgeving-plan.md](leeromgeving-plan.md)

> **Fase 1 — stand van zaken (2026-09-25)**
>
> - Race-vrije boeking: `src/server/events/booking.ts` (advisory lock per event in één `db.batch`-transactie; neon-http kent geen interactieve transacties). Check-in en openstaande aanbiedingen tellen mee als bezette plek.
> - Statussen: opgeslagen `draft | published | cancelled`; `open`, `vol`, `gaande`, `afgelopen` afgeleid in `status.ts`. Expliciete publicatieflow (concept → publiceren → annuleren met melding).
> - Publieke pagina's `/events` en `/events/[slug]` zonder login (route-groep `(events)`), Event- en Breadcrumb-JSON-LD, OG-kaart per event, sitemap en robots.
> - ICS per event, Google/Outlook-links, persoonlijke webcal-feed (`/api/calendar/<token>`).
> - Wachtlijst 2.0: aanbod met bedenktijd (instelbaar, max. tot 1 uur voor start; binnen 3 uur direct inschrijven), uurlijkse job laat aanbiedingen verlopen.
> - Herinneringen 1 week / 1 dag / 1 uur per mail + in-app, idempotent (`reminders_sent`); wijzigings- en annuleringsmails met .ics.
> - Eventlijst met keyset-cursor en tellers als subquery; filters zoeken, vorm, regio, thema, "in mijn buurt" (PDOK-geocoding + haversine).
> - Nog niet: kaartweergave van het overzicht (MapLibre), feature flag (fase 1 vervangt bestaande functionaliteit), Playwright-tests.
> - Migratie: zie fase 2 (één script voor beide).
>
> **Fase 2 — stand van zaken (2026-09-26)** · keuze: betalen via Stripe, doorbetalen via Stripe Connect (Express, destination charges)
>
> - Tickettypes: gratis, betaald, "betaal wat je kunt" (minimum), met aantal, verkoopvenster (vroegboek), max. per bestelling, verbergen, btw 0/9/21%. Betaalde tickets = Pro.
> - Bestellen in één scherm (ook als gast) → Stripe Checkout (iDEAL/kaart, promotiecodes uit de coupon-suite) → bevestigingsmail met ticketlinks en .ics. Plekken 30 min gereserveerd; reserveren is race-vrij (zelfde lock als RSVP) en telt mee in één capaciteitsdefinitie (`capacity.ts`).
> - Webhook idempotent: `checkout.session.completed/async_payment_succeeded` → tickets, `expired/async_payment_failed` → reservering vrij, `charge.refunded`, `account.updated`.
> - Terugbetalen per ticket of bestelling (organisator), zelf annuleren binnen de termijn, automatisch bij annuleren van het event; kortingen naar rato, Connect-transfer en fee worden teruggedraaid.
> - Ticket doorgeven (nieuwe code, oude link vervalt), ticketpagina met QR, handmatige check-in van tickethouders.
> - Aanmeldvragen per event; antwoorden in bestellingen en CSV-export.
> - Wachtlijst bij ticketed events: aanbod houdt de plek vast en gaat bij bestellen over in de reservering.
> - Platformfee configureerbaar (`EVENT_PLATFORM_FEE_BPS`, `EVENT_PLATFORM_FEE_FIXED_CENTS`), standaard 0. Let op: bij destination charges betaalt het platform de Stripe-kosten.
> - Achter feature flag `NEXT_PUBLIC_FEATURE_EVENT_TICKETS` (buiten productie standaard aan).
> - Nog niet: aanmeldvragen per tickettype, facturen als pdf (nu Stripe-betaalbewijs), groepstickets met namen per ticket bij bestellen.
> - Migratie (fase 1 + 2, idempotent): `npx tsx --env-file=.env.local scripts/apply-events-migrations.ts`.

## 1. Huidige stand (uitgangspunt)

Aanwezig: event aanmaken (Pro), fysiek of online, `meetingUrl`, cover, maximum aantal deelnemers, RSVP met wachtlijst en automatische doorschuiving, check-in (`eventCheckIns`, API-route, `EventCheckinPanel`), admin-eventbeheer, `event_reminder`-notificaties.

Ontbreekt: tickets en betaling, terugkerende events, programma en sprekers, ICS/agenda, deelnemerscommunicatie, materialen en opnames, evaluaties, rapportage, publieke eventpagina's, hybride en meerdaagse events.

## 2. Doel en succescriteria

Een organisator zet een event van sociaal-ondernemersbijeenkomst tot meerdaags congres op in één flow, verkoopt tickets, communiceert met deelnemers, checkt ze in en meet de opbrengst. Deelnemers vinden, boeken en beleven events zonder frictie, ook na afloop.

- Een event aanmaken kost minder dan 10 minuten (met sjabloon minder dan 3).
- Boeken in ≤ 3 stappen, ook zonder account (gast-checkout).
- No-showpercentage daalt met 30% door herinneringen en annuleringsflow.
- Check-in van 100 mensen in < 5 minuten met QR.
- Elk event levert automatisch een evaluatie en impactrapport op.

## 3. Rollen

| Rol                   | Kan                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Deelnemer**         | ontdekken, boeken, betalen, programma samenstellen, ticket in wallet, netwerken, materialen en opnames terugzien, evalueren |
| **Organisator** (Pro) | events beheren, tickets, deelnemers, communicatie, check-in, rapport                                                        |
| **Teamlid / host**    | check-in en deelnemerslijst, zonder toegang tot financiën                                                                   |
| **Spreker**           | eigen sessie, materiaal uploaden, vragen en polls zien                                                                      |
| **Beheerder**         | alle events, moderatie, uitbetalingen, uitgelicht, platformrapportage                                                       |

Teamleden en sprekers per event, dus los van het platformaccount (zelfde patroon als rollen per editie in de leeromgeving).

## 4. Functionaliteit

### 4.1 Ontdekken en publieke pagina's

- Eventoverzicht met filters (datum, regio, thema/sector, online/fysiek/hybride, prijs, taal, toegankelijkheid), kaartweergave, kalenderweergave en "in mijn buurt".
- **Publieke eventpagina** (SEO, deelbaar): sterke hero, programma, sprekers, locatie met kaart, ticketkeuze, veelgestelde vragen, gerelateerde events. Structured data (`Event` schema.org) via de bestaande seo-kit en sitemap.
- Aanbevelingen op basis van profiel (sector, regio, fase) en eerdere events, gekoppeld aan matching: "3 mensen die je zou moeten ontmoeten, komen ook".
- Zoeken, opslaan (bestaande `bookmarks`), "ik ga" delen met een Open Graph-kaart.

### 4.2 Aanmaken en beheren (organisator)

- **Wizard**: basis → tijd en plek → tickets → programma → aanmeldvragen → communicatie → publiceren, met concept, voorbeeldweergave en checklist.
- **Formaten**: fysiek, online, hybride, meerdaags, met meerdere locaties of zalen.
- **Terugkerend**: wekelijks, maandelijks of aangepaste reeks, met wijziging van één of alle exemplaren.
- **Sjablonen en dupliceren** van eerdere events (datums verschuiven).
- **Statussen**: concept, gepland, open voor aanmelding, uitverkocht, gaande, afgelopen, geannuleerd (met automatische melding en terugbetaling).
- **Team**: medeorganisatoren, hosts en sprekers uitnodigen met eigen rechten.
- **Privé en besloten events**: alleen op uitnodiging, met wachtwoord of voor een cohort/programma/alumnigroep.

### 4.3 Tickets en betaling

- **Tickettypen**: gratis, betaald, vroegboek (met einddatum of aantal), donatie ("betaal wat je kunt"), sociaal tarief, groepsticket, VIP.
- **Betaling via Stripe** (Checkout, iDEAL, kaart), btw-instellingen, factuur of betaalbewijs per mail, coupons (bestaande coupon-suite hergebruiken).
- **Doorbetaling aan organisator** via Stripe Connect, met optionele platformfee.
- **Wachtlijst 2.0**: automatisch aanbieden met vervaltijd (bijv. 24 uur), volgorde en melding per mail en push. Vervangt de huidige eenvoudige doorschuiving.
- **Annuleren en terugbetalen**: regels per event (tot X dagen voor start), ticket doorgeven aan een ander.
- **Aanmeldvragen**: eigen velden (dieet, toegankelijkheid, motivatie), verplicht of optioneel, per tickettype.
- **Gastcheckout**: boeken zonder account met e-mailbevestiging en een uitnodiging om een profiel te maken (groeimotor).

### 4.4 Programma, sprekers en deelnemersbeleving

- **Programma**: sessies met tijd, zaal/track, spreker, beschrijving en niveau; parallelle sessies; pauzes.
- **Mijn programma**: deelnemer stelt een eigen agenda samen en exporteert die (ICS, Google, Outlook).
- **Sprekerspagina's** en sprekersportaal: bio, foto, sessies, materiaal uploaden, aanwezigheid van hun sessie.
- **Live-elementen**: vragen stellen aan de zaal, polls, upvoten, moderatie door de host. Realtime met Pusher (bestaand).
- **Netwerken**: deelnemerslijst met opt-in, "wie is er ook", matching tijdens het event, 1-op-1 gesprekken plannen (speeddate-rondes met tafelindeling), verbinden via bestaande berichten.
- **Online en hybride**: geïntegreerde videosessie (Zoom, Google Meet, of embed), aanwezigheid automatisch registreren, opname na afloop.
- **Materialen**: slides, opnames en handouts per sessie, alleen voor deelnemers of publiek, blijvend beschikbaar in de eventomgeving.
- **Toegankelijkheid**: rolstoeltoegang, gebarentolk, ondertiteling, stiltezone als vaste velden, zichtbaar en filterbaar.

### 4.5 Communicatie

- Automatische mails: bevestiging, herinnering (1 week, 1 dag, 1 uur), wijziging, annulering, "bedankt en evaluatie", opname beschikbaar.
- **Berichten aan deelnemers** (alle, per tickettype, per status, aangemeld maar niet ingecheckt) via de bestaande campagnemodule.
- **Pushmelding en in-app** (`notifications`) voor wachtlijst, programmawijziging en start van jouw sessie.
- **Eventfeed**: prikbord per event voor deelnemers en organisator, ook vóór en na het event (bouwt op bestaande `posts`).

### 4.6 Check-in op locatie

- **Ticket met QR** in de app en als wallet-pass (Apple/Google Wallet).
- **Scanmodus** voor hosts: camera-scan op telefoon, werkt offline en synchroniseert later, dubbele scan waarschuwt.
- Handmatig zoeken en inchecken, snelle walk-in registratie, naamkaartjes printen.
- Live teller (binnen / verwacht / no-show) voor de organisator.
- Per sessie inchecken voor zalen met beperkte capaciteit.
- Koppeling aan leeromgeving: check-in telt als aanwezigheid bij een live sessie.

### 4.7 Na het event

- **Evaluatie**: korte enquête per event en per sessie (NPS, open vraag), automatisch verstuurd, resultaten per spreker.
- **Impactrapport** voor organisator en financier: aantallen, doelgroep, tevredenheid, groei van het netwerk, koppelingen die zijn ontstaan.
- **Foto's en verslag** delen in de eventomgeving, met toestemming en opt-out per persoon.
- **Certificaat van deelname** (hergebruik certificaatmodule uit de leeromgeving).
- **Opvolging**: deelnemers verbinden, uitnodiging voor volgend event, aanbeveling voor programma of mentor.

### 4.8 Beheer en rapportage (admin)

- Overzicht van alle events met moderatie (goedkeuren, uitgelicht, verbergen), rapportage van misbruik.
- Dashboard: aanmeldingen over tijd, conversie van paginabezoek naar boeking, bezetting, omzet, no-show, herkomst (campagne, referral), tevredenheid.
- Export naar CSV, boekhoudkoppeling (Moneybird/Exact, later), uitbetalingsoverzicht.
- Audit-log en AVG: bewaartermijn deelnemersgegevens, inzage, verwijderen, minimale gegevensverzameling.
- Uitbreiding bestaande management-rapporten (dagelijks en wekelijks) met eventcijfers.

## 5. Datamodel (Drizzle)

Bestaand uitbreiden: `events` (+ type, status, tijdzone, meerdaags, herhalingsregel, seriesId, zichtbaarheid, cohortId/programId, waitlistPolicy, refundPolicy, toegankelijkheid jsonb, organizationId), `eventAttendees` (+ ticketId, orderId, aanmeldantwoorden jsonb, aanbiedingVerlooptOp), `eventCheckIns` (+ sessieId, methode, offline-sync).

| Nieuwe tabel                                         | Kernvelden                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `event_series`                                       | herhalingsregel, uitzonderingen                                                               |
| `event_tickets`                                      | eventId, naam, type, prijs, btw, aantal, verkoopstart/-einde, zichtbaarheid, maxPerBestelling |
| `event_orders`                                       | userId of gastEmail, totaal, status, stripeSessionId, couponId, factuurgegevens               |
| `event_order_items`                                  | orderId, ticketId, aantal, prijs                                                              |
| `event_tickets_issued`                               | orderItemId, attendeeId, qrCode, wallet-pass, doorgegevenAan                                  |
| `event_form_fields`                                  | eventId, label, type, verplicht, opties, tickettypes                                          |
| `event_sessions`                                     | eventId, titel, start, einde, zaal, track, capaciteit, niveau, opnameUrl                      |
| `event_speakers`, `event_session_speakers`           | profiel of gast, bio, foto                                                                    |
| `event_team`                                         | eventId, userId, rol                                                                          |
| `event_materials`                                    | eventId/sessieId, bestand, zichtbaarheid                                                      |
| `event_session_registrations`                        | sessieId, userId                                                                              |
| `event_polls`, `event_poll_votes`, `event_questions` | live interactie                                                                               |
| `event_meetings`                                     | rondes en tafelindeling voor 1-op-1                                                           |
| `event_waitlist_offers`                              | attendeeId, aangebodenOp, verlooptOp, status                                                  |
| `event_feedback`                                     | eventId/sessieId, userId, score, tekst                                                        |
| `event_payouts`                                      | organisatie, bedrag, fee, Stripe Connect-id                                                   |

## 6. Techniek

- **Routers**: `events` uitbreiden en opsplitsen in `events`, `tickets`, `orders`, `eventSessions`, `checkin`, `eventComms`, `eventReports`. Autorisatie via `eventRoleProcedure` (organisator/team/spreker), naast `proProcedure`.
- **Betalingen**: Stripe Checkout + webhooks (idempotent), Stripe Connect voor uitbetaling. Reservering van tickets tijdens checkout met verloop (10 minuten) tegen overboeken. Boekingen en voorraad in één databasetransactie.
- **Capaciteit**: per ticket en per event, met atomair verhogen (voorkomt dat twee gelijktijdige boekingen de laatste plek krijgen; het huidige `rsvp` telt eerst en schrijft daarna, wat een race is).
- **Tijdzones en herhaling**: opslaan in UTC met eventtijdzone, herhaling via RRULE (`rrule`-library).
- **ICS en wallet**: server-side ICS-feeds per gebruiker (abonneerbare agenda) en per event; wallet-passes via `passkit-generator` en Google Wallet API.
- **QR en offline**: ondertekende QR-tokens (kort JWT), scan-PWA met service worker en lokale wachtrij.
- **Realtime**: Pusher voor polls, vragen, live tellers en programma-updates.
- **Zoeken**: Postgres full-text en geo-filter (PostGIS of eenvoudige afstandsberekening op coördinaten), kaart met MapLibre.
- **Jobs**: herinneringen, wachtlijstaanbod-verloop, evaluaties versturen, no-show markeren via Vercel Cron (bestaande `/api/jobs`).
- **Bestanden**: gedeelde objectopslag met leeromgeving; ondertekende URL's.
- **Prestaties**: eventlijst gepagineerd met cursor en zonder alle deelnemers te laden (nu `with: { attendees: true }` in `list`); tellers als aparte query.
- **Kwaliteit**: Vitest voor prijs-, capaciteits- en terugbetaalregels; Playwright voor boeken, betalen, annuleren, inchecken. Toegankelijkheid WCAG 2.2 AA, mobiel eerst.

## 7. Navigatie en schermen

- **Deelnemer**: Events (ontdekken, mijn tickets, mijn programma, opgeslagen), eventpagina, ticketpagina met QR, eventomgeving (feed, programma, materialen, netwerken).
- **Organisator**: Mijn events → per event tabs Overzicht, Tickets, Deelnemers, Programma, Communicatie, Check-in, Rapport, Instellingen.
- **Host**: scanmodus als losse mobiele PWA-route.
- **Admin**: blok "Events": alle events, moderatie, uitbetalingen, rapportage.
- **Publiek**: `/events` en `/events/[slug]` zonder login, geïndexeerd.

## 8. Pro-plan

|                                              | Gratis         | Pro              | Organisatieplan          |
| -------------------------------------------- | -------------- | ---------------- | ------------------------ |
| Events ontdekken en boeken                   | ja             | ja               | ja                       |
| Eigen gratis events organiseren              | 1 per kwartaal | onbeperkt        | onbeperkt                |
| Betaalde tickets                             | -              | ja (platformfee) | ja (lagere fee)          |
| Terugkerende events, sjablonen               | -              | ja               | ja                       |
| Team, sprekersportaal, polls en vragen       | -              | ja               | ja                       |
| Check-in scanmodus offline                   | basis          | ja               | ja                       |
| Impactrapport en export                      | -              | basis            | volledig, eigen branding |
| Meerdere organisatoren en eigen domeinpagina | -              | -                | ja                       |

Aanpassing van de huidige situatie: nu is _alleen aanmaken_ Pro. Voorstel is dat elk lid één gratis event per kwartaal kan organiseren, zodat het aanbod groeit; Pro ontgrendelt tickets en tools.

## 9. Fasering

| Fase                     | Inhoud                                                                                                                                                | Duur (indicatief) |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **1. Fundament**         | race-vrije boeking, statussen, publieke eventpagina + SEO + ICS, wachtlijst 2.0, herinneringsmails, eventlijst zonder zware queries, filters en kaart | 3 weken           |
| **2. Tickets**           | tickettypen, Stripe Checkout, coupons, gastcheckout, terugbetalen en doorgeven, aanmeldvragen, facturen                                               | 4 weken           |
| **3. Programma en team** | sessies en zalen, sprekers en portaal, teamrollen, materialen, mijn programma, eventfeed                                                              | 3 weken           |
| **4. Op locatie**        | QR-tickets, wallet, offline scanmodus, live tellers, walk-ins, naamkaartjes, per-sessie check-in                                                      | 3 weken           |
| **5. Live en netwerken** | polls, vragen, hybride/streaming, deelnemerslijst met opt-in, 1-op-1 rondes, matching-integratie                                                      | 3 weken           |
| **6. Inzicht en groei**  | evaluaties, impactrapport, dashboards, herhalende events, Stripe Connect en uitbetaling, organisatieplan                                              | 4 weken           |

Fase 1 en 2 vormen de eerste bruikbare versie. Elke fase achter een feature flag; pilot met een echt event van WeAreImpact vóór fase 4.

## 10. Risico's en open vragen

1. **Geld**: betaalde tickets en doorbetaling brengen btw, refunds, chargebacks en (via Connect) KYC-verplichtingen met zich mee. Beslissen: zelf innen of alleen tickets doorverwijzen.
2. **Platformfee**: wel of geen percentage, en wie draagt de betaalkosten?
3. **Privacy**: deelnemerslijsten en foto's alleen met opt-in; heldere bewaartermijn. Gastcheckout betekent gegevens van mensen zonder account.
4. **Offline check-in**: synchronisatieconflicten (dubbele scan op twee apparaten) vragen om een duidelijke regel.
5. **Reikwijdte**: streaming en 1-op-1 rondes zijn groot; eerst koppelen aan bestaande videotools en pas later zelf bouwen.
6. **Bestaande data**: `events` en `eventAttendees` hebben live rijen; migraties moeten achterwaarts compatibel zijn (statussen van bestaande RSVP's omzetten naar gratis tickets).
7. **Publiceren**: `create` zet nu `isPublished: false`; de publicatieflow moet in fase 1 expliciet worden gemaakt.

## 11. Samenhang met de leeromgeving

- Live sessies in een editie zijn events met een `cohortId`; aanwezigheid wordt via check-in vastgelegd.
- Alumni-events en besloten events voor een programma gebruiken dezelfde zichtbaarheid en ticketlogica.
- Certificaten, materiaalopslag, mailings en rapportages worden gedeeld, dus gezamenlijk bouwen scheelt werk.

## 12. Volgende stappen

1. Keuzes bevestigen: betalingsmodel (Connect of niet), platformfee, gratis-eventregel voor gewone leden.
2. Schetsen voor eventpagina, organisatordashboard en scanmodus.
3. Fase 1 op een aparte branch: race-vrije `rsvp`, statussen, ICS en publieke pagina.
