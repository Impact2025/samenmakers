// Rondleiding en veelgestelde vragen per gebruikerstype. Alleen tekst: geen DB, makkelijk te
// beheren. "Beheerder" is geen persona maar een extra tab voor admins.
import type { Persona } from "@/lib/persona";

export type HelpAudience = Persona | "beheerder";

export interface TourStep {
  title: string;
  body: string;
  /** Pagina waar dit onderdeel zit; wordt als knop getoond. */
  href?: string;
  cta?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface HelpSection {
  label: string;
  intro: string;
  tour: TourStep[];
  faq: FaqItem[];
}

const ACCOUNT_FAQ: FaqItem[] = [
  {
    q: "Hoe pas ik mijn profiel aan?",
    a: "Ga naar Mijn profiel in het menu. Daar wijzig je je foto, missie, sector en wat je zoekt. Hoe completer je profiel, hoe beter anderen je kunnen vinden.",
  },
  {
    q: "Hoe stel ik in welke meldingen ik krijg?",
    a: "Open Instellingen in het menu en kies Notificaties. Daar zet je e-mail- en pushmeldingen per onderdeel aan of uit.",
  },
  {
    q: "Ik ben mijn wachtwoord vergeten. Wat nu?",
    a: "Kies op de inlogpagina 'Wachtwoord vergeten' en vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord te kiezen.",
  },
];

export const HELP: Record<HelpAudience, HelpSection> = {
  lid: {
    label: "Lid",
    intro: "Alles over het netwerk, evenementen en je profiel.",
    tour: [
      {
        title: "Welkom bij We Shape the Future",
        body: "Hier vind je andere ondernemers met een missie, deel je kennis en ontmoet je elkaar. In een paar stappen laten we zien waar alles zit.",
      },
      {
        title: "Netwerk en matching",
        body: "Onder Netwerk ontdek je andere makers. Met Matching swipe je door profielen; bij wederzijdse interesse is het een match en kun je chatten.",
        href: "/ontdekken",
        cta: "Naar Netwerk",
      },
      {
        title: "Evenementen",
        body: "Bijeenkomsten, masterclasses en netwerkmomenten. Meld je aan, of zet je op de wachtlijst als een event vol zit.",
        href: "/events",
        cta: "Bekijk evenementen",
      },
      {
        title: "Je profiel",
        body: "Een compleet profiel levert betere matches op. Vertel kort over je missie, sector en waar je naar op zoek bent.",
        href: "/profiel",
        cta: "Naar mijn profiel",
      },
    ],
    faq: [
      {
        q: "Wat is een match?",
        a: "Een match ontstaat als jij en een ander elkaar beiden interessant vinden. Daarna kun je een gesprek starten via Berichten.",
      },
      {
        q: "Hoe meld ik me aan voor een evenement?",
        a: "Open het evenement via Evenementen en kies 'Meld je aan'. Bij betaalde events bestel je tickets. Is het event vol, dan kom je op de wachtlijst en laten we het weten als er een plek vrijkomt.",
      },
      {
        q: "Kan ik me afmelden voor een evenement?",
        a: "Ja. Open het evenement en kies afmelden, of beheer je aanmelding via Mijn evenementen. Je plek gaat dan naar de volgende op de wachtlijst.",
      },
      {
        q: "Wat is de Kennisbank?",
        a: "Een verzameling artikelen en vragen met praktische kennis voor sociaal ondernemers. Je kunt zelf ook een vraag stellen in de Feed.",
      },
      ...ACCOUNT_FAQ,
    ],
  },

  cursist: {
    label: "Cursist",
    intro: "Alles over je leertraject, opdrachten en klasgenoten.",
    tour: [
      {
        title: "Welkom in je leertraject",
        body: "Hier volg je je programma: lessen, opdrachten en sessies. We laten kort zien waar je wat vindt.",
      },
      {
        title: "Leertraject",
        body: "Onder Leertraject staan je modules en lessen. Per les zie je wat er van je verwacht wordt en markeer je wat klaar is.",
        href: "/leren",
        cta: "Naar mijn leertraject",
      },
      {
        title: "Opdrachten en feedback",
        body: "Levert je docent opdrachten uit, dan leg je je antwoord vast en ontvang je feedback. Je voortgang zie je op je startscherm.",
        href: "/dashboard",
        cta: "Naar mijn startscherm",
      },
      {
        title: "Klas en netwerk",
        body: "Je klasgenoten en docenten vind je terug bij je editie. Via Berichten stuur je ze een bericht en bij Netwerk ontmoet je ook anderen buiten je klas.",
        href: "/berichten",
        cta: "Naar Berichten",
      },
    ],
    faq: [
      {
        q: "Waar vind ik mijn lessen en opdrachten?",
        a: "Onder Leertraject in het menu. Kies je editie, dan zie je de modules met lessen en opdrachten.",
      },
      {
        q: "Hoe weet ik of ik op schema lig?",
        a: "Op je startscherm zie je je voortgang. Loop je achter, dan krijg je een seintje en ziet je docent dat ook.",
      },
      {
        q: "Wanneer zijn de sessies?",
        a: "De geplande sessies van je editie staan op je startscherm en onder Leertraject. Je ontvangt vooraf ook een herinnering.",
      },
      {
        q: "Wie kan mijn werk zien?",
        a: "Je antwoorden zijn zichtbaar voor jou en voor de docenten van je editie. Wat je in Berichten of de Feed deelt, zien de ontvangers.",
      },
      {
        q: "Hoe sluit ik mijn editie af?",
        a: "Zodra je de verplichte lessen hebt afgerond, ziet je docent dat. De afronding en eventuele bewijs van deelname regelt je programmaleiding.",
      },
      ...ACCOUNT_FAQ,
    ],
  },

  docent: {
    label: "Docent",
    intro: "Alles over je edities, beoordelen en sessies.",
    tour: [
      {
        title: "Welkom, docent",
        body: "Hier begeleid je je edities. Je ziet in één oogopslag wie aandacht nodig heeft en wat er nog beoordeeld moet worden.",
      },
      {
        title: "Mijn edities",
        body: "Per editie zie je je cursisten, hun voortgang en wie achterloopt. Open een klas voor details per cursist.",
        href: "/leren",
        cta: "Naar mijn edities",
      },
      {
        title: "Beoordelen",
        body: "Ingeleverde opdrachten staan in je beoordelingswachtrij. Beoordeel, geef feedback en cursisten krijgen daar direct bericht van.",
        href: "/leren/beoordelen",
        cta: "Naar beoordelen",
      },
      {
        title: "Sessies en materiaal",
        body: "Bij elke sessie kun je lesmateriaal delen met je klas. Facilitators en managers plannen de sessies en registreren de aanwezigheid.",
        href: "/leren",
        cta: "Bekijk sessies",
      },
    ],
    faq: [
      {
        q: "Hoe zie ik wie mijn aandacht nodig heeft?",
        a: "Op je startscherm staat het blok 'Aandacht nodig' met cursisten die achterlopen of inactief zijn. Open een cursist voor meer details.",
      },
      {
        q: "Waar beoordeel ik opdrachten?",
        a: "Onder Beoordelen in het menu. Daar staat de wachtrij met ingeleverd werk van de edities waar jij docent bent.",
      },
      {
        q: "Hoe deel ik lesmateriaal na een sessie?",
        a: "Open de sessie in je editie en upload het materiaal, zoals presentaties of literatuur. Je klas ziet het direct terug.",
      },
      {
        q: "Ik zie mijn editie niet. Wat nu?",
        a: "Je ziet alleen edities waar je als docent aan gekoppeld bent. Mist er een, vraag dan de beheerder of programmaleiding om je toe te voegen.",
      },
      {
        q: "Kan ik ook zelf deelnemen aan evenementen en het netwerk?",
        a: "Ja. Evenementen, Feed, Kennisbank en Netwerk staan onder 'Meer' in je menu.",
      },
      ...ACCOUNT_FAQ,
    ],
  },

  alumnus: {
    label: "Alumnus",
    intro: "Alles over de community, evenementen en lesmateriaal.",
    tour: [
      {
        title: "Welkom terug",
        body: "Ook na je programma blijf je verbonden. Hier vind je de alumni-community, evenementen en je lesmateriaal.",
      },
      {
        title: "Community en netwerk",
        body: "Ontmoet andere alumni en actuele deelnemers, en vind mensen met wie je kunt sparren of samenwerken.",
        href: "/ontdekken",
        cta: "Naar Netwerk",
      },
      {
        title: "Evenementen",
        body: "Intervisies, verdiepingsdagen en masterclasses voor de community. Alumni met een jaarlidmaatschap komen bij veel events gratis binnen.",
        href: "/events",
        cta: "Bekijk evenementen",
      },
      {
        title: "Lesmateriaal en kennis",
        body: "Je lessen en materiaal blijven beschikbaar, en in de Kennisbank vind je praktische kennis van anderen.",
        href: "/kennis",
        cta: "Naar de Kennisbank",
      },
    ],
    faq: [
      {
        q: "Wat krijg ik als alumnus?",
        a: "Toegang tot de community, evenementen en je lesmateriaal. Alumni met een jaarlidmaatschap komen bij de meeste events gratis binnen.",
      },
      {
        q: "Hoe word ik lid van de alumni-community?",
        a: "Na afronding van je programma word je alumnus. Heb je vragen over een jaarlidmaatschap, neem dan contact op via info@weshapethefuture.nl.",
      },
      {
        q: "Kan ik mijn lesmateriaal terugvinden?",
        a: "Ja, via Leertraject zie je je afgeronde editie en het materiaal dat daarbij hoort.",
      },
      ...ACCOUNT_FAQ,
    ],
  },

  beheerder: {
    label: "Beheerder",
    intro: "Alles over uitnodigen, edities en het beheer van het platform.",
    tour: [],
    faq: [
      {
        q: "Hoe nodig ik een docent uit?",
        a: "Ga in het beheer naar Docenten, vul naam en e-mailadres in, kies de editie en de rol en klik op 'Docent uitnodigen'. Heeft de persoon nog geen account, dan krijgt die automatisch een uitnodiging per e-mail.",
      },
      {
        q: "Hoe nodig ik iemand uit die nog geen lid is?",
        a: "Ga naar Leden en klik op 'Persoon uitnodigen'. Zonder editie wordt de persoon lid van het platform; met een editie krijgt de persoon meteen een rol daarin.",
      },
      {
        q: "Hoe maak ik een nieuwe editie aan?",
        a: "Open onder Onderwijs het programma en kies 'Nieuwe editie'. Daarna voeg je cursisten en docenten toe via e-mail of de uitnodigingscode.",
      },
      {
        q: "Hoe publiceer ik een event?",
        a: "Ga naar Events in het beheer, maak het event aan en zet de status op gepubliceerd. Publieke events verschijnen ook op de website.",
      },
      {
        q: "Waar zie ik wat er is gewijzigd?",
        a: "Onder Audit log staan beheeracties, zoals uitnodigingen en wijzigingen aan edities.",
      },
    ],
  },
};
