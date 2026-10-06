/* eslint-disable @next/next/no-img-element */
// Gegenereerd uit social-entrepreneurship-course.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import {
  UserRound,
  Building2,
  Globe2,
  CalendarClock,
  CalendarDays,
  UsersRound,
  Clock3,
  Wallet,
  BookOpen,
  MessagesSquare,
  UserRoundCheck,
  BriefcaseBusiness,
  Brain,
  CircleHelp,
} from "lucide-react";
import { ApplyButton } from "@/components/site/popup-buttons";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Programma's | Leergang Sociaal Ondernemen",
  description: "",
};

export function LeergangSoContent() {
  return (
    <>
      <section className="course-hero">
        <img
          className="course-hero__image"
          src="/wstf/images/programs/LSO/Certificaatuitreiking%20LSO%202021.jpg"
          alt="Leergang Sociaal Ondernemen"
        />
        <div className="course-hero__content">
          <div className="course-hero__text">
            <h1 className="course-hero__title">Leergang Sociaal Ondernemen</h1>
            <p className="course-hero__description">
              Versterk je organisatie, groei als leider en vergroot je
              maatschappelijke impact. Voor ervaren sociaal ondernemers voorbij
              de opstartfase.
            </p>
          </div>
        </div>
      </section>
      <section className="course-info">
        <div className="course-info__container">
          <article className="course-info__card">
            <div className="course-info__content">
              <div className="course-info__heading">
                <img
                  src="/wstf/images/icons/course-info-duration.png"
                  alt=""
                  className="course-info__icon"
                />
                <h2 className="course-info__title">Duur & vorm</h2>
              </div>
              <p className="course-info__description">
                10 maanden met masterclasses, workshops, intervisie, coaching en
                verdiepende sessies waarin zakelijke ontwikkeling en persoonlijk
                leiderschap samenkomen.
              </p>
              <Link
                href={`${base}/leergang-sociaal-ondernemen#program-structure`}
                className="course-info__link"
              >
                {" "}
                Bekijk programma-opbouw &rarr;{" "}
              </Link>
            </div>
          </article>
          <article className="course-info__card">
            <div className="course-info__content">
              <div className="course-info__heading">
                <img
                  src="/wstf/images/icons/course-info-audiance.png"
                  alt=""
                  className="course-info__icon"
                />
                <h2 className="course-info__title">Voor wie</h2>
              </div>
              <p className="course-info__description">
                Voor ervaren sociaal ondernemers die hun onderneming verder
                willen ontwikkelen en tegelijk willen groeien in hun rol als
                leider.
              </p>
              <Link
                href={`${base}/leergang-sociaal-ondernemen#program-audience`}
                className="course-info__link"
              >
                {" "}
                Is dit voor mij? &rarr;{" "}
              </Link>
            </div>
          </article>
          <article className="course-info__card">
            <div className="course-info__content">
              <div className="course-info__heading">
                <img
                  src="/wstf/images/icons/course-info-output.png"
                  alt=""
                  className="course-info__icon"
                />
                <h2 className="course-info__title">Wat je leert</h2>
              </div>
              <p className="course-info__description">
                Versterk je verdienmodel en strategie, ontwikkel je leiderschap
                en onderzoek wat groei en verandering van jou én je organisatie
                vragen.
              </p>
              <Link
                href={`${base}/leergang-sociaal-ondernemen#strengthen-your-leadership`}
                className="course-info__link"
              >
                {" "}
                Bekijk leeropbrengsten &rarr;{" "}
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className="alumni-story">
        <div className="alumni-story__container">
          <header className="alumni-story__header">
            <p className="alumni-story__eyebrow">
              Cathelijne Lania — A Beautiful Story
            </p>
            <p className="alumni-story__intro">
              Sinds Cathelijne Lania in 2012 deelnam aan de Leergang Sociaal
              Ondernemen, is A Beautiful Story uitgegroeid van een ambitieuze
              sociale onderneming tot een internationaal B Corp sieradenmerk met
              €5 miljoen jaaromzet, 1.000 verkooppunten in Europa en een eerlijk
              inkomen voor meer dan 600 ambachtslieden in Nepal en India.
            </p>
          </header>
          <div className="alumni-story__content">
            <div className="alumni-story__main">
              <div className="alumni-story__person">
                <img
                  className="alumni-story__image"
                  src="/wstf/images/programs/LSO/WSTF-LSO-Cathelijne-Lania-quote.png"
                  alt="Cathelijne Lania"
                />
                <p className="alumni-story__person-info">
                  Cathelijne Lania
                  <br />
                  Oprichter A Beautiful Story
                  <br />
                  Leergang Sociaal Ondernemen, 2012
                </p>
              </div>
              <div className="alumni-story__text">
                <blockquote className="alumni-story__quote">
                  “Het programma hielp me richting te geven aan mijn bedrijf en
                  bood een kader om te groeien als ondernemer. Het daagde me uit
                  om keuzes te maken en in actie te komen. Samen leren met
                  andere ondernemers was ontzettend waardevol — sommige van die
                  contacten maken nog steeds deel uit van mijn netwerk.”
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="program-section">
        <div className="program-section__container">
          <div className="program-section__main">
            <div id="program-overview" className="program-block">
              <div className="program-block__header">
                <h2 className="program-block__title">Over het programma</h2>
                <p className="program-block__subtitle">
                  Als sociaal ondernemer bouw je tegelijk aan een gezonde
                  organisatie en aan maatschappelijke impact. Naarmate je
                  onderneming groeit, vraagt dat steeds opnieuw om keuzes rond
                  je verdienmodel, financiering en governance. Tegelijk
                  verandert wat er van jou als leider wordt gevraagd. Daarom is
                  er naast zakelijke kennis en vaardigheden ook ruimte om stil
                  te staan bij jezelf als ondernemer: hoe je leidt, welke
                  patronen je meeneemt en wat groei van jou persoonlijk vraagt.
                </p>
                <p className="program-block__subtitle">
                  Wanneer focus je op stabiliteit en wanneer is het tijd om te
                  innoveren? Welk business- en schaalmodel past bij jouw
                  ambities? Hoe pak je financiering en governance aan? En wat
                  heeft je onderneming nodig om verder te groeien zonder haar
                  maatschappelijke missie uit het oog te verliezen?
                </p>
              </div>
              <div id="strengthen-your-leadership" className="feature-grid">
                <div className="feature-card feature-card--image">
                  <img
                    src="/wstf/images/programs/LSO/PHOTO-2026-08-12-11-08-07.jpg"
                    alt="Versterk je leiderschap"
                    className="feature-card__img"
                  />
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <UserRound aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">
                    Versterk je leiderschap
                  </h3>
                  <p className="feature-card__description">
                    Ontwikkel je leiderschap en de vaardigheden die je nodig
                    hebt om je organisatie en team te leiden tijdens groei en
                    verandering.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Building2 aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">
                    Bouw aan een duurzame organisatie
                  </h3>
                  <p className="feature-card__description">
                    Versterk je strategie, verdienmodel en financiële basis en
                    richt je organisatie in voor duurzame groei.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Globe2 aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">
                    Schaal je maatschappelijke impact
                  </h3>
                  <p className="feature-card__description">
                    Leer hoe je de maatschappelijke waarde van je organisatie
                    meet, zichtbaar maakt en vergroot.
                  </p>
                </div>
              </div>
            </div>
            <div id="program-audience" className="program-block">
              <div className="program-block__header">
                <h2 className="program-block__title">
                  Voor wie is dit programma?
                </h2>
              </div>
              <div className="audience-grid">
                <div className="audience-image-card">
                  <img
                    src="/wstf/images/programs/LSO/PHOTO-2026-08-12-11-08-22.jpg"
                    alt="Sprekers op het podium"
                    className="audience-image-card__img"
                  />
                </div>
                <div className="audience-list">
                  <div className="audience-card">
                    <h3 className="audience-card__title">
                      Sociaal Ondernemers
                    </h3>
                    <p className="audience-card__description">
                      Sociaal ondernemers met een duidelijke maatschappelijke of
                      ecologische missie, die de opstartfase voorbij zijn en hun
                      organisatie verder willen ontwikkelen.
                    </p>
                    <ul className="key-points-list">
                      <li>
                        <span className="point-title">
                          Voorbij de opstartfase
                        </span>{" "}
                        <span className="point-desc">
                          Je sociale onderneming is de eerste fase ruimschoots
                          ontgroeid en je bent klaar om de organisatie verder te
                          ontwikkelen.
                        </span>
                      </li>
                      <li>
                        <span className="point-title">
                          Klaar voor verdere groei
                        </span>{" "}
                        <span className="point-desc">
                          Je wilt je verdienmodel en financiële basis versterken
                          en scherp krijgen welke strategische keuzes daarbij
                          passen.
                        </span>
                      </li>
                      <li>
                        <span className="point-title">
                          Met concrete uitdagingen aan tafel
                        </span>{" "}
                        <span className="point-desc">
                          Je brengt keuzes, uitdagingen en ambities uit je eigen
                          organisatie mee en gebruikt nieuwe kennis, reflectie
                          en feedback om ermee aan de slag te gaan.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="program-sidebar">
            <div className="details-card">
              <h3 className="details-card__heading">Programma details</h3>
              <div className="details-list">
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <CalendarClock aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Duur</span>{" "}
                    <span className="detail-item__value">10 Maanden</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Startdatum</span>{" "}
                    <span className="detail-item__value">Februari 2027</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Groepsgrootte</span>{" "}
                    <span className="detail-item__value">
                      Maximaal 20 deelnemers
                    </span>
                    <p className="detail-item__subtext">
                      Een kleine groep met ruimte voor persoonlijke aandacht,
                      leren van elkaar en verdieping.
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <Clock3 aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Tijdsinvestering</span>
                    <ul className="detail-item__bullet-list">
                      <li>180 uur, inclusief voorbereiding en opdrachten</li>
                      <li>15 bijeenkomsten / opleidingsdagen</li>
                      <li>Maandelijkse intervisiesessies</li>
                      <li>Business- en buddycoaching</li>
                    </ul>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <Wallet aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Investering</span>{" "}
                    <span className="detail-item__value">€7.695</span>
                    <p className="detail-item__subtext">
                      Inclusief alle studiematerialen, twee overnachtingen en
                      volledige verzorging.
                    </p>
                  </div>
                </div>
              </div>
              <ApplyButton className="submit-btn">Meld je nu aan</ApplyButton>
            </div>
            <div className="partner-card">
              <h4 className="partner-card__title">In samenwerking met</h4>
              <div className="partner-card__logo-container">
                <img
                  src="/wstf/images/partners/WSTF-academic-partner.png"
                  alt="Universiteit Utrecht."
                  className="partner-card__logo"
                />
              </div>
              <p className="partner-card__description">
                Academisch partner in strategisch leiderschap en
                maatschappelijke impact.
              </p>
              <Link
                href={`${base}/leergang-sociaal-ondernemen#program-structure`}
                className="partner-card__link"
              >
                Bekijk programma-opbouw &rarr;
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <section className="development-section">
        <img
          className="development-section__image"
          src="/wstf/images/programs/LSO/what-you-will-develop-bg.png"
          alt=""
          aria-hidden="true"
        />
        <div className="development-section__container">
          <div className="development-section__container">
            <header className="development-section__header">
              <h2 className="development-section__title">Wat je ontwikkelt</h2>
              <p className="development-section__description">
                Aan het einde van het programma heb je
              </p>
            </header>
            <div className="development-section__grid">
              <article className="development-card">
                <span className="development-card__number">01</span>
                <p className="development-card__text">
                  Je kennis van groei, innovatie en het schalen van
                  maatschappelijke impact verdiept en toegepast op je eigen
                  organisatie.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">02</span>
                <p className="development-card__text">
                  Scherper voor ogen welke strategie, businessmodellen en
                  verdienmodellen passen bij jouw organisatie en ambities.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">03</span>
                <p className="development-card__text">
                  Gewerkt aan een sterkere financiële en organisatorische basis
                  voor verdere groei.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">04</span>
                <p className="development-card__text">
                  Meer inzicht in governance, rechtsvormen en juridische
                  vraagstukken die relevant zijn voor jouw sociale onderneming.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">05</span>
                <p className="development-card__text">
                  Je positionering en marketingstrategie aangescherpt.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">06</span>
                <p className="development-card__text">
                  Je leiderschap verder ontwikkeld en meer inzicht gekregen in
                  hoe je dit inzet tijdens groei en verandering.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">07</span>
                <p className="development-card__text">
                  Concrete strategische keuzes gemaakt om zowel je organisatie
                  als je maatschappelijke impact vooruit te helpen.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="funding-section">
        <div className="funding-section__container">
          <div className="funding-section__badge">
            <span className="funding-section__title"> Financiering </span>
          </div>
          <div className="funding-section__content">
            <p className="funding-section__text">
              Om het programma toegankelijk te maken voor sociale ondernemingen,
              bieden Achmea Foundation, Stichting DOEN, Rabo Foundation, ING
              Nederland Fonds en Goldschmeding Foundation beurzen van{" "}
              <strong>€3.000</strong> tot <strong>€5.000</strong>.
            </p>
          </div>
        </div>
      </section>
      <section className="experience-section">
        <div className="experience-section__container">
          <h2 className="experience-section__title">Wat je gaat ervaren</h2>
          <div className="experience-carousel">
            <div className="experience-carousel__viewport">
              <div className="experience-carousel__track">
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <BookOpen aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Academische kennis
                    </h3>
                    <p className="experience-card__description">
                      Leer van actueel onderzoek, beproefde methoden en
                      academische modellen die relevant zijn voor je eigen
                      organisatie.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <MessagesSquare aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Interactieve workshops
                    </h3>
                    <p className="experience-card__description">
                      Onderzoek tijdens workshops, discussies en
                      praktijkopdrachten nieuwe ideeën en wat ze betekenen voor
                      jouw organisatie.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UserRoundCheck aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Persoonlijke coaching
                    </h3>
                    <p className="experience-card__description">
                      Werk één-op-één met een coach aan je persoonlijke
                      ontwikkeling en leiderschap, met ruimte voor reflectie en
                      verdieping.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Leren met en van elkaar
                    </h3>
                    <p className="experience-card__description">
                      Deel open wat er speelt, spar met andere sociaal
                      ondernemers en leer van elkaars ervaringen.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <BriefcaseBusiness aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Praktische toepassing
                    </h3>
                    <p className="experience-card__description">
                      Pas wat je leert direct toe op situaties en keuzes binnen
                      je eigen organisatie.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <Brain aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Nieuwe perspectieven
                    </h3>
                    <p className="experience-card__description">
                      Open gesprekken en uitwisseling met anderen laten je
                      anders kijken naar je eigen organisatie en leiderschap.
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <div className="experience-carousel__controls">
              <button
                className="experience-carousel__button experience-carousel__button--prev"
                type="button"
                aria-label="Vorige ervaring"
              >
                {" "}
                <span aria-hidden="true">‹</span>{" "}
              </button>{" "}
              <button
                className="experience-carousel__button experience-carousel__button--next"
                type="button"
                aria-label="Volgende ervaring"
              >
                {" "}
                <span aria-hidden="true">›</span>{" "}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="program-structure">
        <div id="program-structure" className="program-structure__container">
          <header className="program-structure__header">
            <h2 className="program-structure__title">Programma-opbouw</h2>
            <p className="program-structure__description">
              Tijdens acht leermodules, persoonlijke coaching, intervisie en
              praktijkopdrachten werk je steeds vanuit je eigen organisatie en
              de uitdagingen die daar spelen.
            </p>
          </header>
          <div className="program-structure__visual">
            <img
              src="/wstf/images/programs/LSO/WSTF-LSO-program-structure-dutch.png"
              alt="Programma-opbouw"
            />
          </div>
        </div>
      </section>
      <section className="team-section">
        <div className="team-section__container">
          <div className="team-section__main">
            <h1 className="team-section__title">
              Maak kennis met de mensen
              <br />
              die je begeleiden
            </h1>
            <div className="team-block">
              <div className="team-block__header">
                <h2 className="team-block__title">Docenten & Experts</h2>
                <p className="team-block__subtitle">
                  Leer van ervaren praktijkdeskundigen en academici.
                </p>
              </div>
              <div className="team-grid">
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Karin%20Geuijen.jpeg"
                      alt="Karin Geuijen"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Karin Geuijen</h3>
                  <p className="person-card__role">
                    Management van publieke waardecreatie aan de Universiteit
                    Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Leendert%20de%20Bell.jpg"
                      alt="Leendert de Bell"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Leendert de Bell</h3>
                  <p className="person-card__role">
                    Ondernemerschap en internationaal zakendoen aan de
                    Universiteit Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Prof.-mr.-dr.-Manuel.jpg"
                      alt="Manuel Lokin"
                    />
                  </div>
                  <h3 className="person-card__name">
                    Prof. mr. dr. Manuel Lokin
                  </h3>
                  <p className="person-card__role">
                    Ondernemingsrecht en Corporate Governance aan de
                    Universiteit Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Abdulkader%20Kaakeh.jpeg"
                      alt="Abdulkader Kaakeh"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Abdulkader Kaakeb</h3>
                  <p className="person-card__role">
                    Entrepreneurial Finance en besluitvorming in het MKB aan de
                    Universiteit Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Margit%20Sleeuwenhoek.jpg"
                      alt="Margit Sleeuwenhoek"
                    />
                  </div>
                  <h3 className="person-card__name">Margit Sleeuwenhoek</h3>
                  <p className="person-card__role">
                    Docent en leiderschapscoach Nyenrode Business Universiteit
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Helen-Toxopeus_0069%20kleur.jpg"
                      alt="Helen Toxopeus"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Helen Toxopeus</h3>
                  <p className="person-card__role">
                    Financiering van duurzame innovatie aan de Universiteit
                    Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Pjotr-Anthoni-Treasurer-LSO.png"
                      alt="Pjotr Anthoni"
                    />
                  </div>
                  <h3 className="person-card__name">Mr. Pjotr Anthoni</h3>
                  <p className="person-card__role">
                    Senior Tax Manager PwC Kenniscentrum & bestuurslid
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Jacoline.jpeg"
                      alt="Drs. Jacqueline Plomp"
                    />
                  </div>
                  <h3 className="person-card__name">Drs. Jacqueline Plomp</h3>
                  <p className="person-card__role">
                    Managing Director Impact House
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/oscar%20westra%20van%20holthe.jpg"
                      alt="Oscar Westra van Holthe"
                    />
                  </div>
                  <h3 className="person-card__name">Oscar Westra van Holthe</h3>
                  <p className="person-card__role">
                    Systeemcoach Zuidas en expert organisatieopstellingen
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Jeroen%20de%20Jong.jpg"
                      alt="Jeroen de Jong"
                    />
                  </div>
                  <h3 className="person-card__name">Jeroen de Jong</h3>
                  <p className="person-card__role">
                    Sales & Harvard onderhandelingstrainer & coach, partner bij
                    Pawlik
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Carolien-van-Wersch.jpg"
                      alt="Carolien van Wersch"
                    />
                  </div>
                  <h3 className="person-card__name">Carolien van Wersch</h3>
                  <p className="person-card__role">
                    Directeur For Good, oprichter Double Purpose
                  </p>
                </div>
              </div>
            </div>
            <div className="team-block">
              <div className="team-block__header">
                <h2 className="team-block__title">Business Coaches</h2>
                <p className="team-block__subtitle">
                  Persoonlijke begeleiding tijdens je gehele traject.
                </p>
              </div>
              <div className="team-grid">
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Enver%20Loke.jpg"
                      alt="Enver Loke"
                    />
                  </div>
                  <h3 className="person-card__name">Enver Loke</h3>
                  <p className="person-card__role">
                    Chocolatemakers / Changemakers
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Doesje%20Fransen.jpeg"
                      alt="Doesje Fransen"
                    />
                  </div>
                  <h3 className="person-card__name">Doesje Fransen</h3>
                  <p className="person-card__role">Oprichter Social Dream</p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Harvey%20Lansdorf.jpeg"
                      alt="Harvey Lansdorf"
                    />
                  </div>
                  <h3 className="person-card__name">Harvey Lansdorf</h3>
                  <p className="person-card__role">
                    Business Coaching & Consulting
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Bartel%20Geleijnse.png"
                      alt="Bartel Geleijnse"
                    />
                  </div>
                  <h3 className="person-card__name">Bartel Geleijnse</h3>
                  <p className="person-card__role">
                    Mede-oprichter The Colour Kitchen (opschaling en
                    ketensamenwerking)
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Roeland%20Weebers.jpg"
                      alt="Roeland Weebers"
                    />
                  </div>
                  <h3 className="person-card__name">Roeland Weebers</h3>
                  <p className="person-card__role">Pawlik</p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Monique%20Zandbergen.png"
                      alt="Monique Zandbergen"
                    />
                  </div>
                  <h3 className="person-card__name">Monique Zandbergen</h3>
                  <p className="person-card__role">Pawlik</p>
                </div>
              </div>
            </div>
          </div>
          <aside className="team-section__sidebar">
            <div className="support-card">
              <div className="support-card__illustration">
                <CircleHelp aria-hidden="true" />
              </div>
              <h3 className="support-card__title">
                Heb je een vraag over het programma of wil je weten of het bij
                je past?
              </h3>
              <p className="support-card__subtitle">
                We denken graag met je mee.
              </p>
              <div className="support-card__contact">
                <a
                  href="mailto:info@weshapethefuture.nl"
                  className="contact-item"
                >
                  {" "}
                  <svg
                    className="contact-item__icon"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {" "}
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />{" "}
                    <polyline points="22,6 12,13 2,6" />{" "}
                  </svg>{" "}
                  <span>info@weshapethefuture.nl</span>{" "}
                </a>{" "}
                <a href="tel:+310851301176" className="contact-item">
                  {" "}
                  <svg
                    className="contact-item__icon"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {" "}
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />{" "}
                  </svg>{" "}
                  <span>+31 (0)85 13 01 17 6</span>{" "}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section className="next-step-section">
        <div className="next-step-section__container">
          <div className="next-step-section__header">
            <h2 className="next-step-section__title">
              Klaar om de volgende stap te zetten?
            </h2>
            <p className="next-step-section__description">
              Sluit je aan bij een netwerk van ervaren sociaal ondernemers die
              bouwen aan een betere toekomst.
            </p>
          </div>
          <div className="next-step-section__cards">
            <a href="javascript:void(0)" className="next-step-card">
              <h3 className="next-step-card__title">
                Meld je aan voor een programma
              </h3>
              <p className="next-step-card__description">
                Inclusief een intakegesprek met de programmaleiding
              </p>
            </a>{" "}
            <a
              href="mailto:event@weshapethefuture.nl"
              className="next-step-card"
              data-community-email
            >
              <h3 className="next-step-card__title">
                Word lid van de community
              </h3>
              <p className="next-step-card__description">
                Exclusief voor alumni. €150/jaar toegang tot alle events
              </p>
            </a>{" "}
            <Link href={`${base}#community-events`} className="next-step-card">
              <h3 className="next-step-card__title">Een event bijwonen</h3>
              <p className="next-step-card__description">
                Open voor alle bezoekers
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
