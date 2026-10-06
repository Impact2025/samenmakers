import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, GraduationCap, Medal, UsersRound } from "lucide-react";
import { HeroSlider } from "@/components/site/hero-slider";
import { siteHref } from "@/components/site/site-config";
import { api } from "@/trpc/server";
import { DEFAULT_EVENT_TZ, eventDateParts } from "@/lib/event-format";

export const metadata: Metadata = {
  title: "We Shape the Future",
  description:
    "We Shape the Future ontwikkelt sociaal ondernemers, intrapreneurs en changemakers door middel van executive education, leiderschapsontwikkeling, praktische bedrijfskennis en een levenslange leercommunity.",
};

const HERO = [
  {
    image: "/wstf/images/home/WSTF-home-hero-slide1.jpg",
    title: (
      <>
        Shaping Future Leaders.
        <br />
        Shaping Future Business.
      </>
    ),
    description:
      "Kies het programma dat past bij jouw rol en de impact die je wilt maken.",
  },
  {
    image: "/wstf/images/home/WSTF-home-hero-slide2.jpg",
    title: "Verdiep je kennis",
    description: "Leer van ervaren trainers, academici en collega-ondernemers.",
  },
  {
    image: "/wstf/images/home/WSTF-home-hero-slide3.jpg",
    title: (
      <>
        Van inzicht
        <br />
        naar actie
      </>
    ),
    description:
      "Pas nieuwe kennis en perspectieven direct toe op je eigen organisatie.",
  },
  {
    image: "/wstf/images/home/WSTF-home-hero-slide4.jpg",
    title: "Vergroot je impact",
    description:
      "Versterk je leiderschap, verbreed je kennis en laat jezelf én je organisatie groeien.",
  },
];

const PROGRAM_CARDS = [
  {
    href: "/leergang-sociaal-ondernemen",
    title: "Leergang Sociaal Ondernemen",
    description: "Voor ambieuze sociaal ondernemers met groeiambitie.",
  },
  {
    href: "/leergang-social-intrapreneurship",
    title: (
      <>
        Leergang
        <br />
        Social
        <br />
        Intrapreneurship
      </>
    ),
    description:
      "Voor impactpioniers die verandering leiden binnen organisaties.",
  },
  {
    href: "/reshaping-your-future",
    title: (
      <>
        Reshaping
        <br />
        Your
        <br />
        Future
      </>
    ),
    description: "Voor ervaren oprichters die opnieuw richting willen bepalen.",
  },
  {
    href: "/community",
    title: (
      <>
        We Shape The Future
        <br />
        Community
      </>
    ),
    description: "Samen groeien met ondernemers en professionals.",
  },
];

const STATS = [
  {
    value: "300+",
    description: "Sociaal ondernemers en professionals gingen je voor.",
    Icon: UsersRound,
  },
  {
    value: "8/10",
    description:
      "Al 15 jaar worden alle opleidingsdagen gemiddeld met een 8 of hoger beoordeeld.",
    Icon: Medal,
  },
  {
    value: "Sinds 2010",
    description:
      "Het langstlopende executive programma voor sociaal ondernemers in Nederland.",
    Icon: CalendarDays,
  },
  {
    value: (
      <>
        Academisch
        <br />
        programma
      </>
    ),
    description: (
      <>
        met UU-certificaat
        <br />
        Ontwikkeld en uitgevoerd in samenwerking met de Universiteit Utrecht.
      </>
    ),
    Icon: GraduationCap,
  },
];

const WHY = [
  {
    icon: "icon-15+years-experience.png",
    title: "15+ jaar ervaring",
    description:
      "Sinds 2010 ontwikkelen we programma's voor sociaal ondernemers en professionals die werken aan maatschappelijke verandering.",
  },
  {
    icon: "icon-tailored-programs.png",
    title: "Praktijkgericht leren",
    description:
      "Uitdagingen uit je eigen praktijk en je individuele ambities vormen het vertrekpunt voor de ontwikkeling van jezelf én je organisatie.",
  },
  {
    icon: "icon-leadership-and-network.png",
    title: "Leiderschap & community",
    description:
      "Versterk je leiderschap en leer met en van anderen. Ook na het programma blijf je elkaar via de community ontmoeten, versterken en de verdieping opzoeken.",
  },
  {
    icon: "icon-academic-foundation.png",
    title: "Academische basis",
    description:
      "Actuele academische inzichten, ontwikkeld en toegepast in samenwerking met de Universiteit Utrecht en de Leerstoel Leergang Sociaal Ondernemen.",
  },
];

/** Beschrijvingen zijn markdown; hier willen we platte tekst. */
function plain(md: string | null, max = 220) {
  if (!md) return "";
  const t = md
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

function Quote({
  image,
  text,
  name,
  role,
}: {
  image: string;
  text: string;
  name: string;
  role: React.ReactNode;
}) {
  return (
    <section className="quote">
      <div className="quote__container">
        <div className="quote__image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="quote__image" src={image} alt={text} />
        </div>
        <div className="quote__content">
          <div className="quote__slider">
            <div className="quote__track">
              <blockquote className="quote__text">“{text}”</blockquote>
            </div>
          </div>
          <div className="quote__author">
            <p className="quote__name">– {name}</p>
            <p className="quote__role">{role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export default async function WstfHomePage() {
  const events = await api.events
    .list({ upcoming: true, limit: 4 })
    .then((r) => r.items)
    .catch(() => []);

  return (
    <>
      <HeroSlider slides={HERO} />

      <section className="programs">
        <div className="programs__grid">
          {PROGRAM_CARDS.map((p) => (
            <Link key={p.href} className="program-card" href={siteHref(p.href)}>
              <h2 className="program-card__title">{p.title}</h2>
              <p className="program-card__description">{p.description}</p>
            </Link>
          ))}
        </div>
        <p className="programs__note">
          Werk áán de organisatie in plaats van erin, verdiep je in wat jouw rol
          als leider van je vraagt, pas academische inzichten toe op je eigen
          praktijk en leer in kleine groepen van en mét ervaren ondernemers en
          professionals.
        </p>
      </section>

      <Quote
        image="/wstf/images/home/WSTF-home-quote1.png"
        text="Onze grootste maatschappelijke uitdagingen vragen om mensen die verder durven dromen, denken én doen. Geef hen de ruimte om te groeien — in kennis, vaardigheden en netwerk — en hun ideeën en organisaties groeien met hen mee."
        name="Nicole Verhoeven"
        role="(Oprichter & Directeur)"
      />

      <section className="about">
        <div className="about__container">
          <div className="about__content">
            <div className="about__header">
              <p className="about__eyebrow">Wie we zijn</p>
              <h2 className="about__title">
                Shaping Future Leaders. Shaping Future Business.
              </h2>
            </div>
            <div className="about__partnership">
              <div className="about__partner-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="about__partner-logo"
                  src="/wstf/images/partners/WSTF-academic-partner.png"
                  alt="Universiteit Utrecht"
                />
              </div>
              <span className="about__partnership-divider" aria-hidden="true" />
              <p className="about__partnership-text">
                Academische programma’s in samenwerking met de Universiteit
                Utrecht
              </p>
            </div>
            <div className="about__body">
              <p className="about__text">
                Al meer dan 15 jaar helpen we ondernemers en professionals om
                hun leiderschap te ontwikkelen, hun organisatie te laten groeien
                en hun maatschappelijke impact te vergroten. In samenwerking met
                de Universiteit Utrecht verbinden we academische inzichten met
                actuele vraagstukken uit de praktijk en de kennis en ervaring
                van deelnemers. Daarbij is er naast kennis en vaardigheden
                bewust ruimte voor persoonlijke verdieping: reflecteren op wat
                er werkelijk speelt, ervaringen delen en met nieuwe
                perspectieven naar jezelf en je leiderschap kijken.
              </p>
              <p className="about__text about__text--closing">
                <strong>
                  Academische inzichten. Echte vraagstukken. Persoonlijke
                  verdieping.
                </strong>
              </p>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about__image"
            src="/wstf/images/home/WSTF-home-about.jpg"
            alt="Shaping Future Leaders. Shaping Future Business."
          />
        </div>
      </section>

      <section className="stats">
        <div className="stats__container">
          {STATS.map(({ value, description, Icon }, i) => (
            <article key={i} className="stats__card">
              <div className="stats__content">
                <p className="stats__value">{value}</p>
                <p className="stats__description">{description}</p>
              </div>
              <div className="stats__icon" aria-hidden="true">
                <Icon />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="expectations">
        <div className="expectations__container">
          <div className="expectations__header">
            <h2 className="expectations__title">Wat je kunt verwachten</h2>
            <p className="expectations__subtitle">
              Je brengt vraagstukken uit je eigen organisatie in, bekijkt ze
              vanuit verschillende perspectieven en verrijkt je aanpak met
              nieuwe kennis en inzichten.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="expectations__image"
            src="/wstf/images/home/WSTF-home-what-to-expect.png"
            alt="Wat je kunt verwachten"
          />
          <p className="expectations__description">
            In intervisie, coaching en persoonlijke verdieping kijk je verder
            dan het zakelijke: er is ruimte om te delen, met anderen te sparren
            en te onderzoeken wat nieuwe inzichten betekenen voor jou en je
            leiderschap, in een omgeving waarin vertrouwen centraal staat.
          </p>
        </div>
      </section>

      <section className="why">
        <div className="why__container">
          <div className="why__heading">
            <div className="why__heading-title">
              <span className="why__heading-text">Waarom</span>
              <span className="why__heading-highlight">
                We Shape the Future
              </span>
            </div>
            <p className="why__heading-description">
              Maatschappelijke ambities worden niet gerealiseerd met alleen
              goede ideeën. Het vergt sterk ondernemerschap, een gezond
              businessmodel en leiders die bereid zijn hun eigen keuzes en
              aannames te blijven onderzoeken.
            </p>
            <p className="why__heading-description">
              Daarom brengen we in onze programma’s academici, experts, coaches
              en deelnemers bij elkaar voor de ultieme leerervaring. Iedereen
              brengt eigen kennis, ervaring en perspectieven mee.
            </p>
            <p className="why__heading-description">
              Dat is waar We Shape the Future voor staat: de moed om te leiden,
              de ambitie om te blijven leren en de kracht om samen de toekomst
              vorm te geven.
            </p>
          </div>

          <div className="why__quote">
            <p className="why__quote-text">
              “True leaders are those who know the way, go the way and show the
              way.”
            </p>
            <p className="why__quote-author">— H. Reginald Buckler</p>
          </div>

          <div className="why__grid">
            {WHY.map((w) => (
              <article key={w.title} className="why-card">
                <div className="why-card__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/wstf/images/icons/${w.icon}`} alt={w.title} />
                </div>
                <div className="why-card__content">
                  <h3 className="why-card__title">{w.title}</h3>
                  <p className="why-card__description">{w.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="community">
        <div className="community__container">
          <div className="community__card">
            <div className="community__content">
              <div className="community__header">
                <h2 className="community__title">
                  We Shape The Future Community
                </h2>
                <p className="community__description">
                  Sociaal ondernemen is topsport. Daarom blijft de We Shape the
                  Future Community ook na je programma een plek om te leren,
                  sparren en samen de verdieping op te zoeken. Via intervisies,
                  verdiepingsdagen, leiderschapsweekenden, masterclasses en
                  events blijf je met elkaar verbonden.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="community__image"
                src="/wstf/images/home/WSTF-home-community-november-reunion.jpeg"
                alt="We Shape The Future Community"
              />
            </div>
            <div id="community-events" className="community__events">
              {events.map((e) => {
                const { day, month } = eventDateParts(
                  e.startAt,
                  e.timezone || DEFAULT_EVENT_TZ,
                );
                return (
                  <article key={e.id} className="community__event">
                    <Link
                      className="community__event-link"
                      href={siteHref(`/events/${e.slug}`)}
                    >
                      <div className="community__date">
                        <p className="community__date-text">
                          {day}
                          <br />
                          {month}
                        </p>
                      </div>
                      <div className="community__event-content">
                        <h3 className="community__event-title">{e.title}</h3>
                        <p className="community__event-description">
                          {plain(e.description)}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Quote
        image="/wstf/images/home/WSTF-home-quote2.png"
        text="De combinatie van kennis verzamelen, ervaringen delen en werken aan persoonlijke vaardigheden leidt tot een (groei)strategie die past bij de organisatie en de persoonlijkheid van de ondernemer. Het geeft ondernemers en belanghebbenden een stevige basis voor de toekomst."
        name="Niels Bosma"
        role={
          <>
            (Academisch Directeur We Shape the Future,
            <br />
            Hoogleraar Sociaal Ondernemerschap, Universiteit Utrecht)
          </>
        }
      />

      <section className="cta">
        <div className="cta__container">
          <h2 className="cta__title">Klaar voor je volgende stap?</h2>
          <p className="cta__description">
            Vind het programma dat past bij jouw ambities en start jouw
            leiderschapsreis.
          </p>
          <Link
            className="cta__button"
            href={siteHref("/leergang-sociaal-ondernemen")}
          >
            <span className="cta__button-text">Ontdek programma&apos;s</span>
          </Link>
        </div>
      </section>
    </>
  );
}
