# Reshape the Future — platformspecificaties (LSO / LSI)

Bron: klantgesprek van 28 september 2026 (Nicole en Vincent), aangevuld met het schema "Platformarchitectuur & Rollenstructuur". Bouwt voort op `docs/leeromgeving-plan.md`. Dit document legt vast **wat er besloten is** en **wat daarvan al staat of nog gebouwd moet worden**.

## 1. Planning

| Datum               | Wat                                                   | Wie     |
| ------------------- | ----------------------------------------------------- | ------- |
| 6 oktober (middag)  | Uitwerking platformeisen + uitnodiging vervolgoverleg | Vincent |
| week van 12 oktober | Platform testklaar (interne validatie)                | Vincent |
| rond 18 oktober     | Inloggegevens en studiegids naar deelnemers           | Nicole  |
| 28 oktober          | Officiële start nieuwe LSI-leergang op het platform   | -       |

Overig voor Nicole: informatie AI Hub (Oosterburg) doorsturen, Excel met procesmanagement overdragen, studiegids LSI opstellen, follow-up mail naar workshopdeelnemers (online sessie).

Let op: in de gespreksnotities staat 2024 bij de datums; het gesprek en de start zijn in 2026.

## 2. Rollen

| Rol             | Bereik            | Belangrijkste rechten                                                                                         |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Admin**       | platform          | ledenbeheer, statistieken, gerichte e-mail naar groepen, alles                                                |
| **Facilitator** | editie            | coördinatie met docenten, aanwezigheid registreren, bewaken huiswerk en evaluaties (breder dan manager nu is) |
| **Docent**      | editie, tijdelijk | toegang vanaf 2 weken vóór tot 2 weken na de sessie; communiceren met deelnemers; lesmateriaal uploaden       |
| **Cursist**     | editie            | eigen klas, opdrachten inleveren, algemene community-activiteiten (o.a. events)                               |
| **Alumnus**     | programma         | kennisbank, alumni-feed, events                                                                               |
| **Lid**         | platform          | jaarlidmaatschap €150, community en events, geen cursist                                                      |

## 3. Besluiten per onderdeel

### 3.1 Leergangcyclus (per programmadag, vooraf bekend)

- **T-3 weken**: briefing met docent (facilitator bewaakt).
- **T-2 weken**: deelnemers krijgen per mail huiswerk, introductie docent en schema. Docent krijgt op dit moment platformtoegang.
- **T-3 dagen**: deadline huiswerk. Inleveren gaat via het platform in plaats van e-mail.
- **T+2 weken**: docenttoegang eindigt automatisch.

### 3.2 Docenten

- Tijdelijke toegang: `sessiedatum - 14 dagen` t/m `sessiedatum + 14 dagen`.
- Binnen dat venster: berichten met deelnemers, presentaties en literatuur uploaden (komt daarna in de kennisbank).
- Cursisten uploaden opdrachten (bijv. foto's van canvassen) ter review.

### 3.3 Aanwezigheid

Registratie per sessie, beheerd door de facilitator.

### 3.4 Community en rechten

- LSO- en LSI-cursisten zitten tijdens de opleiding in een **eigen afgeschermde klasgroep** en zien alleen klasgenoten.
- Per groep (LSO, LSI, alumni) een aparte feed met hulpvragen en aanbiedingen.
- **Geen voormoderatie**; de beheerder krijgt wel een notificatie bij nieuwe posts.
- Cursisten hebben wel toegang tot algemene community-activiteiten (events) om kennis te maken met het alumninetwerk.
- **Kennisbank (alle presentaties en lesmateriaal) alleen voor alumni**, pas na afronding van de opleiding.
- **Alle leden kunnen elkaar 1-op-1 berichten sturen.** Uitzondering (besloten 29 september): cursisten berichten tijdens de opleiding alleen hun eigen klas en docenten, en zijn zelf ook alleen daardoor bereikbaar.

### 3.5 Ledenbeheer en betalingen

- Aanmeldproces voor nieuwe communityleden (niet-cursisten) via de website: uitlegpagina, algemene voorwaarden, betaalmodule.
- **Jaarlidmaatschap €150**: gratis toegang tot de meeste events.
- **Niet-leden en cursisten: €50 per los event**, behalve meerdaagse programma's met eigen prijs.
- Algemene voorwaarden en privacyverklaring afstemmen op gebruik van de app (juridisch, buiten de code).
- **Admin-dashboard**: aantal leden, logins, activiteit; e-mail naar specifieke groepen (docenten, facilitators, cursisten, alumni). Coaches krijgen voorlopig geen eigen rol (besloten 29 september).

## 4. Status tegenover de codebase

Bijgewerkt op 29 september 2026.

| Onderdeel                                            | Status                                                                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Programma's, edities, modules, lessen, voortgang     | gebouwd (fase 1)                                                                                                                         |
| Docentdashboard met signalering                      | gebouwd                                                                                                                                  |
| Rol facilitator                                      | gebouwd (per editie, in alle schermen en het beheer)                                                                                     |
| Docenttoegang met tijdvenster                        | gebouwd (2 weken voor tot 2 weken na de sessie, automatisch bij koppelen aan sessie)                                                     |
| Sessies plannen                                      | gebouwd (`/leren/[editie]/sessies`)                                                                                                      |
| Aanwezigheidsregistratie                             | gebouwd (facilitator en manager registreren, docent kijkt mee)                                                                           |
| Opdrachten inleveren met bestanden                   | gebouwd (`/leren/[editie]/opdrachten`, te-laat-markering, feedback)                                                                      |
| Lesmateriaal uploaden door docenten                  | gebouwd (`/leren/[editie]/materiaal`)                                                                                                    |
| Kennisbank alleen voor alumni                        | gebouwd (`/kennis/materiaal`; ook cursisten na afronding)                                                                                |
| Klasfeed en alumni-feed met adminmelding             | gebouwd (`/leren/[editie]/klas`, `/alumni`; geen voormoderatie)                                                                          |
| 1-op-1 berichten voor alle leden                     | gebouwd, cursisten tijdens de opleiding alleen naar de eigen klas en docenten                                                            |
| Tijdgestuurde mails briefing (T-3w), huiswerk (T-2w) | gebouwd (dagelijkse cron `/api/jobs/session-mailings`)                                                                                   |
| Admin: aantallen, logins en activiteit               | gebouwd (analytics-pagina; logins tellen vanaf livegang)                                                                                 |
| Admin: e-mail naar groepen (docenten, coaches)       | gebouwd (segment op rol en leergang in het mailscherm); coach is geen eigen rol                                                          |
| Lidmaatschap €150 (alumni) en €50 per event          | gebouwd: `/lidmaatschap`, Stripe-jaarabonnement, leden gratis bij events met 'gratis voor leden'; prijzen door admin op `/admin/prijzen` |
| Aanmelden en betalen met voorwaarden                 | gebouwd: akkoord met voorwaarden en privacyverklaring vóór betalen; losse events kopen kan zonder account                                |
| Algemene voorwaarden en privacyverklaring            | juridisch, buiten de code (Nicole/Vincent)                                                                                               |

### Technische keuzes en beperkingen

- **Migratie:** `drizzle/onderwijs-fase2.sql` moet op de database worden toegepast (`scripts/apply-events-migrations.ts`). Tot dan werken de nieuwe schermen niet.
- **Bestanden:** huiswerk en lesmateriaal gaan standaard in privé-opslag (Vercel Blob, `access: private`) en zijn alleen te downloaden via `/api/bestanden/inlevering/[id]` en `/api/bestanden/materiaal/[id]`. Elk verzoek controleert sessie en rol (`src/lib/file-access.ts`): een inlevering zien de cursist zelf, de staf van de editie (docenten binnen hun toegangsvenster) en beheerders; lesmateriaal de staf, alumni en beheerders. De API geeft geen blob-URL's meer terug. Oudere bestanden op publieke opslag lopen via dezelfde route, maar blijven publiek bereikbaar op hun oude URL tot ze zijn overgezet.
- **Berichten:** een direct bericht maakt intern een gespreksrij aan (`matches` met status matched), zodat de bestaande chat en meldingen blijven werken.
- **Docenten in een gekopieerde editie:** worden niet meegekopieerd, omdat hun toegang bij hun sessies hoort.
- **Lidmaatschap (besloten 29 september):** alleen voor alumni, €150 per jaar (door admin aan te passen). Bezoekers en cursisten kopen per event een ticket (standaard €50). Leden komen gratis binnen bij events met de vlag 'gratis voor leden' (aan voor de meeste events, uit voor meerdaagse programma's met eigen prijs; alleen admins zetten die om). Bestaande leden houden de prijs waarvoor ze zijn ingestapt.
- **Alumnus:** iemand die de leergang heeft afgerond (status afgerond) of expliciet alumnus is. Zet een editie op afgerond en de cursisten op afgerond om de kennisbank te openen.

## 5. Open vragen en besluiten

1. ~~Facilitator~~ Besloten (29 september): eigen rol per editie.
2. ~~Coach~~ Besloten (29 september): geen eigen rol, voorlopig buiten scope.
3. ~~Klasgrenzen bij 1-op-1 berichten~~ Besloten (29 september): cursisten berichten tijdens de opleiding alleen hun eigen klas en docenten; alle andere leden kunnen elkaar vrij berichten.
4. ~~Looptijd lidmaatschap~~ Besloten (29 september): 12 maanden vanaf betaling, verlengt automatisch, opzeggen via de betaalportal (loopt door tot einde periode).
5. ~~Alumni en lidmaatschap~~ Besloten (29 september): het lidmaatschap is juist voor alumni en kost €150; bezoekers kopen los een event.
6. ~~Prijzen~~ Besloten (29 september): de admin bepaalt de prijzen (lidmaatschap, standaard eventprijs, en per event via de ticketinstellingen).
7. ~~Inleveringen aanpassen~~ Besloten (29 september): cursisten zien hun inlevering altijd en kunnen die aanpassen tot de deadline. Een eerste inlevering na de deadline kan nog wel (met "te laat"-markering).
