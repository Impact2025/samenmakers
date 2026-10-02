# Weave Leeromgeving — Projectplan

Status: concept · Referentie: We Shape the Future (leergangen, alumni, community)

## 1. Doel

Weave groeit van netwerkplatform naar een volledige leeromgeving voor sociaal ondernemers. Organisaties (zoals een opleider of hogeschool) draaien hier meerdere programma's, met meerdere edities (cohorten) per programma. De leeromgeving is onderdeel van het **Pro-plan**. Na afloop stromen deelnemers door naar een alumnicommunity.

Succescriteria:

- Een programmabeheerder zet in minder dan een uur een nieuwe editie op (kopie van vorige editie).
- Een docent ziet per cursist in één scherm wat er ingeleverd, beoordeeld en achterstallig is.
- Een cursist weet elke dag wat de volgende stap is (deadline, sessie, les).
- Alumni blijven actief: ≥ 40% logt 6 maanden na afronding nog in.

## 2. Rollen

| Rol                   | Bereik    | Kan                                                                        |
| --------------------- | --------- | -------------------------------------------------------------------------- |
| **Beheerder** (admin) | platform  | programma's, edities, gebruikers, rapportage, certificaten, facturatie     |
| **Programmamanager**  | programma | edities plannen, docenten koppelen, planning, aankondigingen, rapportage   |
| **Docent**            | editie(s) | lesmateriaal, opdrachten, beoordelen, feedback, live sessies, aanwezigheid |
| **Cursist**           | editie    | leren, inleveren, peer-feedback, community, portfolio                      |
| **Alumnus**           | programma | alumni-community, events, mentorrol, materiaal blijft leesbaar             |

Een gebruiker kan meerdere rollen hebben, per editie verschillend (docent in de ene, cursist in de andere). Rollen zitten dus op **inschrijvingsniveau**, niet op het gebruikersaccount. Bestaande `users.role` (`user`/`admin`) blijft voor platformbeheer.

## 3. Structuur

```
Programma (bv. Leergang Sociaal Ondernemen)
 └─ Editie / Cohort (bv. najaar 2026)         ← bestaand `cohorts`, uitbreiden
     ├─ Module (bv. Impactmodel)
     │   └─ Les (tekst, video, bestand, quiz, live sessie)
     │       └─ Opdracht (optioneel, met deadline)
     ├─ Planning (sessies, deadlines, events)
     ├─ Groepen / intervisiegroepen
     └─ Community-ruimte
```

Meerdere programma's tegelijk, elk met eigen branding (kleur, logo, omslag), eigen toelatingsregels en eigen prijs of pakket.

## 4. Functionaliteit per rol

### 4.1 Cursist

- **Mijn leren** (startpagina): volgende actie, aankomende sessies, deadlines, voortgangsbalk per programma.
- **Leerpad**: modules en lessen met status (open, bezig, klaar), vervolgles-knop, notities per les, bladwijzers.
- **Lesvormen**: tekst (rich text), video (embed of upload), PDF/bestanden, quiz, reflectievraag, live sessie met opname achteraf.
- **Opdrachten**:
  - overzicht met status: nog te doen, ingeleverd, beoordeeld, terug voor herkansing
  - inleveren via tekst, bestandsupload (meerdere) of link
  - concept opslaan, versies, opnieuw inleveren tot deadline (of tot docent heropent)
  - feedback en rubric-score zien, per criterium
  - te laat inleveren met duidelijke markering en optionele strafregel
- **Peer-feedback**: opdrachten kunnen aan medecursisten worden toegewezen (anoniem of open) met een korte feedbackrubric.
- **Portfolio**: eindproducten en certificaten bundelen, optioneel delen op het publieke profiel.
- **Communicatie**: vragen bij een les of opdracht, editiefeed, privébericht aan docent, intervisiegroep-chat.
- **Agenda**: alle sessies en deadlines, ICS-koppeling naar Google/Outlook, herinneringen per mail en push.
- **Certificaat**: automatisch bij voldoen aan afrondingsregels, met verificatielink en QR.

### 4.2 Docent

- **Docentdashboard**: te beoordelen inleveringen (wachtrij), achterstallige cursisten, komende sessies, ongelezen vragen.
- **Cursistoverzicht**: per cursist voortgang, inleverstatus, aanwezigheid, laatste activiteit, notities (alleen docenten), risicosignaal ("dreigt uit te vallen").
- **Beoordelen**: split-view (inlevering links, rubric en feedback rechts), snelle feedback-templates, bestandsannotatie in PDF, cijfer of voldoende/onvoldoende, concept-feedback bewaren en gebundeld vrijgeven.
- **Bulkacties**: deadline verlengen voor cursist of groep, herinnering sturen, opdracht heropenen.
- **Lesmateriaal**: eigen modules bewerken (indien toegestaan), materiaal per editie aanpassen zonder de programma-basis te wijzigen.
- **Live sessies**: aanmaken met videolink, aanwezigheid afvinken (of via QR-check-in, bestaande `eventCheckIns`), opname en slides toevoegen.
- **Aankondigingen** aan editie of groep.

### 4.3 Programmamanager en beheerder

- **Programmabeheer**: programma's aanmaken, meerdere edities, sjabloon kopiëren (inclusief modules, opdrachten, rubrics; datums relatief verschuiven).
- **Toelating**: aanmeldformulier per programma, intake-vragen, selectiestatus (aangemeld, uitgenodigd, toegelaten, wachtlijst, afgewezen), uitnodigingscodes (bestaande `inviteCode`).
- **Inschrijvingen en betaling**: betaalde programma's via Stripe (eenmalig of termijnen), coupons hergebruiken (bestaande coupon-suite), factuurgegevens.
- **Planning**: kalender over alle edities, conflictdetectie docent/ruimte.
- **Afrondingsregels** per programma: minimale aanwezigheid, verplichte opdrachten voldoende, eindopdracht.
- **Certificaten**: sjabloon met logo en handtekening, automatisch genereren (PDF), publieke verificatie.
- **Rapportage**: instroom, voortgang, uitval, beoordelingsdoorlooptijd per docent, tevredenheid, export naar CSV. Sluit aan op bestaande management-rapporten.
- **Communicatie**: mailings per editie/groep (bestaande campagnemodule), sjablonen.
- **Audit-log** en AVG-tooling (bestaande admin-onderdelen uitbreiden: inzage, export, verwijderen van inleveringen).
- **Impersonatie** (alleen-lezen) om te zien wat een cursist ziet, met logregel.

### 4.4 Community en alumni

- **Editie-community**: feed, vragen en antwoorden, bijlagen, reacties, pinnen door docent. Bouwt voort op bestaande `posts`, `questions`, `reactions`.
- **Intervisiegroepen**: 4 tot 6 personen, eigen chat, gezamenlijke agenda, docent kan meelezen (met zichtbaar signaal).
- **Alumni-omgeving**: blijvende toegang tot materiaal (alleen-lezen), alumni-feed, alumni-events (bestaand eventsysteem), mentorprogramma dat cursisten aan alumni koppelt (bestaande `mentorshipRole` en matching uitbreiden).
- **Alumni-directory** met programma, jaar en expertise, gekoppeld aan Ontdekken.

## 5. Datamodel (Drizzle, nieuw en uitgebreid)

Bestaand hergebruiken: `users`, `cohorts`, `cohortMembers`, `events`, `eventAttendees`, `eventCheckIns`, `posts`, `questions`, `messages`, `notifications`, `milestones`.

Nieuw:

| Tabel                                        | Kernvelden                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `programs`                                   | id, slug, naam, beschrijving, kleur, logo, omslag, status, prijs, toelatingsmodus                                                                            |
| `cohorts` (uitbreiden)                       | + programId, startDate, endDate, capacity, status (concept/open/lopend/afgerond), afrondingsregels (jsonb)                                                   |
| `cohort_members` (uitbreiden)                | + rol (cursist/docent/manager/alumnus), status, aangemeldOp, afgerondOp                                                                                      |
| `modules`                                    | id, programId, positie, titel, beschrijving, relatieve start/einde (dagen t.o.v. editiestart)                                                                |
| `lessons`                                    | id, moduleId, positie, type, titel, inhoud (jsonb), duur, verplicht                                                                                          |
| `lesson_progress`                            | userId, lessonId, cohortId, status, voltooidOp, notitie                                                                                                      |
| `assignments`                                | id, lessonId/moduleId, cohortId (null = sjabloon), titel, opdrachtomschrijving, deadline, type (individueel/groep/peer), rubricId, herkansing, max bestanden |
| `rubrics`, `rubric_criteria`                 | criteria met gewicht en niveaubeschrijvingen                                                                                                                 |
| `submissions`                                | id, assignmentId, userId of groupId, status, ingeleverdOp, versie, tekst, isTeLaat                                                                           |
| `submission_files`                           | submissionId, bestandsurl, naam, grootte, mime                                                                                                               |
| `submission_reviews`                         | submissionId, beoordelaarId, score per criterium, cijfer, feedback, vrijgegevenOp                                                                            |
| `peer_reviews`                               | submissionId, reviewerId, scores, feedback                                                                                                                   |
| `quizzes`, `quiz_questions`, `quiz_attempts` | vraagtypen, punten, pogingen                                                                                                                                 |
| `sessions_live`                              | cohortId, eventId, titel, start, einde, videolink, opnameUrl, slides, docentIds                                                                              |
| `attendance`                                 | sessionId, userId, status (aanwezig/afwezig/geoorloofd), bron                                                                                                |
| `groups`, `group_members`                    | cohortId, naam, type (intervisie/opdracht)                                                                                                                   |
| `announcements`                              | cohortId/groupId, auteur, titel, tekst, vastgepind                                                                                                           |
| `certificates`                               | userId, cohortId, code, uitgegeven, pdfUrl, verlooptOp                                                                                                       |
| `instructor_notes`                           | cohortId, cursistId, auteur, tekst (alleen docenten)                                                                                                         |
| `enrollment_applications`                    | programId, userId, antwoorden (jsonb), status, beoordeeldDoor                                                                                                |

Belangrijk: **sjabloon vs. editie**. Modules en lessen horen bij het programma. Een editie krijgt bij aanmaken een kopie van opdrachten (met eigen deadlines), zodat aanpassingen per editie de basis niet raken.

## 6. Techniek

- **API**: nieuwe tRPC-routers `programs`, `learning`, `assignments`, `grading`, `attendance`, `certificates`, `groups`, `applications`. Autorisatie via nieuwe middleware `cohortRoleProcedure(rol)` die het lidmaatschap van de editie controleert (niet alleen `isPro`).
- **Toegang**: leeromgeving vereist Pro of een betaalde/uitgenodigde inschrijving. `isPro` blijft de poort voor de community en de losse functies. Een cursist met inschrijving heeft altijd toegang tot zijn editie.
- **Bestanden**: uploads naar objectopslag (Vercel Blob of S3/R2) met **ondertekende URL's**, virusscan, maximale grootte per type, opslag per editie zodat verwijderen bij AVG-verzoek eenvoudig is. Video via Mux of Vimeo-embed in plaats van eigen hosting.
- **Realtime**: Pusher (bestaand) voor groepschat, live notificaties en "nieuwe inlevering".
- **Rich text**: TipTap-editor voor lessen, opdrachten en feedback.
- **PDF**: certificaten en exports via server-side rendering (bijv. `@react-pdf/renderer`).
- **Mail**: bestaande `email.ts` en campagnes; herinneringsjobs via Vercel Cron (bestaande `/api/jobs`-patroon).
- **AI (optioneel, fase 4)**: feedbacksuggesties voor docent (altijd docent keurt goed), samenvatting van cursistvoortgang, vragen-beantwoorder over lesmateriaal.
- **Toegankelijkheid**: WCAG 2.2 AA, toetsenbordbediening, ondertitels bij video, hoog contrast.
- **Mobiel**: cursist en docent volledig bruikbaar op telefoon (leren, inleveren met camera/foto, feedback lezen).
- **Meertaligheid**: NL eerst; i18n-structuur voor EN (het voorbeeld heeft NL/EN).
- **Tests**: Vitest voor routers en beoordelingsregels; Playwright voor de kritieke flows (inleveren, beoordelen, afronden).

## 7. Navigatie

- **Cursist en docent**: nieuw item "LEREN" in de sidebar, met Mijn leren, Agenda, Opdrachten, Community. Docenten zien er "Beoordelen" en "Mijn edities" bij.
- **Admin**: nieuw blok "Onderwijs" in `(admin)`: Programma's, Edities, Aanmeldingen, Docenten, Certificaten, Rapportage.
- **Publiek (marketing)**: programmapagina's per leergang met aanmeldknop, alumnipagina, SEO via bestaande seo-kit.

## 8. Pro-plan en prijsmodel

|                                                       | Gratis    | Pro                | Programma          |
| ----------------------------------------------------- | --------- | ------------------ | ------------------ |
| Netwerk, matching, berichten                          | beperkt   | volledig           | volledig           |
| Kennisbank en Q&A                                     | lezen     | lezen en schrijven | volledig           |
| Events                                                | deelnemen | organiseren        | volledig           |
| Community-groepen en alumni                           | -         | ja                 | ja                 |
| Leeromgeving (zelfstudiemateriaal)                    | -         | ja                 | ja                 |
| Begeleide editie met docent, beoordeling, certificaat | -         | -                  | per editie betaald |
| Eigen programma's aanbieden (organisatie)             | -         | -                  | Organisatieplan    |

Open keuze: verkoop je programma's zelf, of huurt een opleider (zoals de referentie) een eigen "school" op het platform? Het datamodel ondersteunt beide als je een `organizations`-laag toevoegt (zie risico's).

## 9. Fasering

| Fase                   | Inhoud                                                                                                     | Duur (indicatief) |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| **1. Fundament**       | programma's, edities, rollen, inschrijving, modules en lessen, voortgang, cursist-startpagina, adminbeheer | 4 weken           |
| **2. Opdrachten**      | inleveren met uploads, rubrics, beoordelen, feedback, deadlines, herinneringen, docentdashboard            | 4 weken           |
| **3. Samen leren**     | live sessies, aanwezigheid, agenda en ICS, groepen, aankondigingen, editiefeed, peer-feedback              | 3 weken           |
| **4. Afronden**        | afrondingsregels, certificaten met verificatie, portfolio, rapportage, quizzen                             | 3 weken           |
| **5. Alumni en groei** | alumni-omgeving, mentorkoppeling, betaalde edities en termijnen, aanmeldstraject, AI-hulp, EN-vertaling    | 4 weken           |

Elke fase is los uit te rollen achter een feature flag en bij een pilotgroep te testen. Aanbeveling: pilot met één programma en één docent na fase 2.

## 10. Risico's en open vragen

1. **Organisaties**: één platform-eigenaar, of meerdere opleiders met eigen "school"? Beïnvloedt rechten, facturatie en branding sterk. Beslissen vóór fase 1.
2. **Persoonsgegevens en beoordelingen**: cijfers en feedback zijn gevoelig; bewaartermijnen, inzagerecht en verwijdering in ontwerp opnemen.
3. **Eigen LMS vs. koppeling**: bouwen is passend voor de gewenste community-integratie; wel bewust beperken tot wat docenten dagelijks nodig hebben (geen SCORM, geen tentamensurveillance).
4. **Videokosten**: streaming en opslag groeien snel; kies vroeg tussen embed (goedkoop) en eigen hosting.
5. **Docentadoptie**: een trage of onhandige beoordelingsflow doodt het product. Tijdens de pilot de beoordelingstijd per inlevering meten.
6. **Omvang**: dit is groter dan het huidige platform. Fase 1 en 2 samen vormen de minimale bruikbare versie.

## 11. Volgende stappen

1. Keuzes bevestigen: organisatiemodel, prijsmodel, welke programma's als eerste (bijv. Sociaal Ondernemen).
2. Klikbare schetsen voor cursist-startpagina, beoordelingsscherm en programmabeheer.
3. Schema-migratie en routers voor fase 1 opzetten op een aparte branch.
