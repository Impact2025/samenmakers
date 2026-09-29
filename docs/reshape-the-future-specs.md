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
- **Alle leden kunnen elkaar 1-op-1 berichten sturen.**

### 3.5 Ledenbeheer en betalingen

- Aanmeldproces voor nieuwe communityleden (niet-cursisten) via de website: uitlegpagina, algemene voorwaarden, betaalmodule.
- **Jaarlidmaatschap €150**: gratis toegang tot de meeste events.
- **Niet-leden en cursisten: €50 per los event**, behalve meerdaagse programma's met eigen prijs.
- Algemene voorwaarden en privacyverklaring afstemmen op gebruik van de app (juridisch, buiten de code).
- **Admin-dashboard**: aantal leden, logins, activiteit; e-mail naar specifieke groepen (docenten, coaches).

## 4. Status tegenover de codebase

| Onderdeel                                        | Status                                             |
| ------------------------------------------------ | -------------------------------------------------- |
| Programma's, edities, modules, lessen, voortgang | gebouwd (fase 1)                                   |
| Docentdashboard met signalering                  | gebouwd                                            |
| Rol facilitator                                  | nieuw                                              |
| Docenttoegang met tijdvenster                    | nieuw                                              |
| Opdrachten inleveren met bestanden               | nieuw                                              |
| Aanwezigheidsregistratie                         | nieuw                                              |
| Klasgroepen + feeds per groep + adminmelding     | nieuw                                              |
| Kennisbank alleen voor alumni                    | nieuw (bestaande kennisbank is publiek/Pro)        |
| 1-op-1 berichten voor alle leden                 | aanpassen (nu alleen na wederzijdse match)         |
| Lidmaatschap €150 en eventprijs €50              | nieuw (bestaand: Pro-abonnement en ticketsysteem)  |
| Admin: statistieken en groepsmail                | uitbreiden (bestaande campagnemodule en segmenten) |
| Tijdgestuurde mails T-3w / T-2w / T-3d           | nieuw (Vercel Cron)                                |

## 5. Open vragen voor het vervolgoverleg

1. Is "facilitator" een eigen rol per editie (aanbevolen) of moet die ook platformbreed werken?
2. Wat is het verschil tussen "coach" (genoemd bij groepsmail) en docent? Aparte rol of label?
3. Kan een cursist 1-op-1 berichten sturen naar iedereen, ook buiten de eigen klas, of gelden klasgrenzen tijdens de opleiding?
4. Gaat het lidmaatschap €150 per kalenderjaar of per 12 maanden vanaf betaling? Wat gebeurt er bij opzeggen?
5. Krijgen alumni automatisch lidmaatschap, of betalen zij ook €150?
6. Prijs van de meerdaagse programma's en wie stelt die in (admin per event)?
7. Moeten cursisten hun ingeleverde opdracht kunnen zien en aanpassen tot de deadline?
