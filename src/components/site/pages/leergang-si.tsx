/* eslint-disable @next/next/no-img-element */
// Gegenereerd uit social-intrapreneurship-course.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import {
  UserRoundCog,
  Building2,
  Network,
  CalendarClock,
  CalendarDays,
  UsersRound,
  Clock3,
  Wallet,
  GraduationCap,
  Wrench,
  UserRoundCheck,
  Handshake,
  CircleHelp,
} from "lucide-react";
import { ApplyButton } from "@/components/site/popup-buttons";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Programma's | Leergang Social Intrapreneurship",
  description: "",
};

export function LeergangSiContent() {
  return (
    <>
      <section className="course-hero">
        <img
          className="course-hero__image"
          src="/wstf/images/programs/LSI/Groepje%20buiten%20Lisan%20Gina%20Gwen%20en%20Hidde%20LSI%202025.jpeg"
          alt="Leergang Social Intrapreneurship"
        />
        <div className="course-hero__content">
          <div className="course-hero__text">
            <h1 className="course-hero__title">
              Leergang Social Intrapreneurship
            </h1>
            <p className="course-hero__description">
              Voor ambitieuze professionals die van binnenuit verandering willen
              stimuleren en de maatschappelijke impact van hun organisatie
              willen vergroten.
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
                Vier maanden van masterclasses, workshops, business coaching en
                intervisie. Leer met en van andere sociale intrapreneurs die net
                als jij te maken hebben met verschillende belangen, hardnekkige
                organisatiepatronen en de uitdaging om mensen mee te krijgen in
                verandering.
              </p>
              <Link
                href={`${base}/leergang-social-intrapreneurship#program-structure`}
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
                Voor ambitieuze professionals die een impactgedreven innovatie
                binnen hun organisatie ontwikkelen of leiden en klaar zijn om
                die breder toe te passen of op te schalen.
              </p>
              <Link
                href={`${base}/leergang-social-intrapreneurship#program-audience`}
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
                Versterk je leiderschap en invloed en leer hoe je binnen een
                complexe organisatie verschillende belangen bij elkaar brengt,
                constructieve gesprekken en onderhandelingen voert en
                verandering effectief leidt.
              </p>
              <Link
                href={`${base}/leergang-social-intrapreneurship#strengthen-your-skills`}
                className="course-info__link"
              >
                {" "}
                Bekijk leeropbrengsten &rarr;{" "}
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className="quote">
        <div className="quote__container">
          <div className="quote__image-wrapper">
            <img
              className="quote__image"
              src="/wstf/images/programs/LSI/WSTF-LSI-Pieter-van-Osch-quote.png"
              alt="Doelen zonder routines blijven dromen; routines zonder doelen zijn betekenisloos. De meest succesvolle leiders hebben een heldere visie en de routines om deze werkelijkheid te maken."
            />
          </div>
          <div className="quote__content">
            <div className="quote__slider">
              <div className="quote__track">
                <blockquote className="quote__text">
                  “Doelen zonder routines blijven dromen; routines zonder doelen
                  zijn betekenisloos. De meest succesvolle leiders hebben een
                  heldere visie en de routines om deze werkelijkheid te maken.”
                </blockquote>
              </div>
            </div>
            <div className="quote__author">
              <p className="quote__name">– Pieter van Osch</p>
              <p className="quote__role">(Coach & Oprichter Scaleup Impact)</p>
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
                  Als social intrapreneur stimuleer je verandering van binnenuit
                  je organisatie. Je ontwikkelt impactgedreven innovaties die
                  waarde creëren voor zowel de organisatie als de samenleving.
                </p>
                <p className="program-block__subtitle">
                  De uitdaging is om mensen mee te krijgen, invloed op te bouwen
                  en om te gaan met hardnekkige patronen en verschillende
                  belangen binnen de organisatie. Tegelijkertijd vraagt dat om
                  leiderschap: welke rol neem jij en hoe zet je jouw kwaliteiten
                  effectief in?
                </p>
              </div>
              <div id="strengthen-your-skills" className="feature-grid">
                <div className="feature-card feature-card--image">
                  <img
                    src="/wstf/images/programs/LSI/Groepje%202016%20met%20Floris.JPG"
                    alt="Over het programma"
                    className="feature-card__img"
                  />
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <UserRoundCog aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">
                    Versterk je leiderschap
                  </h3>
                  <p className="feature-card__description">
                    Verdiep je leiderschap, scherp de vaardigheden aan die je
                    nodig hebt, en leer hoe je verandering leidt op een manier
                    die past bij jou en je organisatie.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Building2 aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">
                    Bouw invloed op van binnenuit
                  </h3>
                  <p className="feature-card__description">
                    Begrijp jouw rol en invloed binnen de organisatie en leer
                    hoe je die versterkt en inzet in besluitvorming,
                    samenwerking en het creëren van steun voor je innovatie.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Network aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">Versnel je impact</h3>
                  <p className="feature-card__description">
                    Breng in kaart welke ontwikkelingen en belangen buiten je
                    organisatie de verandering beïnvloeden en hoe je daarop kunt
                    inspelen.
                  </p>
                </div>
              </div>
            </div>
            <div id="program-audience" className="program-block">
              <div className="program-block__header">
                <h2 className="program-block__title">
                  Voor wie is dit programma?
                </h2>
                <p className="program-block__subtitle">
                  Primair voor ambitieuze sociale intrapreneurs die
                  maatschappelijke verandering van binnenuit hun organisatie
                  stimuleren, en voor changemakers die met organisaties werken
                  om verandering te versnellen.
                </p>
              </div>
              <div className="audience-grid">
                <div className="audience-image-card">
                  <img
                    src="/wstf/images/programs/LSI/PHOTO-2026-08-11-20-34-42.jpg"
                    alt="Voor wie is dit programma?"
                    className="audience-image-card__img"
                  />
                </div>
                <div className="audience-list">
                  <div className="audience-card">
                    <h3 className="audience-card__title">
                      Sociale Intrapreneurs
                    </h3>
                    <p className="audience-card__description">
                      Je werkt ín een organisatie en ontwikkelt of leidt daar
                      een impactgedreven innovatie. Je wilt sterker worden in
                      het beïnvloeden van beslissingen, het omgaan met weerstand
                      en het meekrijgen van mensen in je initiatief.
                    </p>
                  </div>
                  <div className="audience-card">
                    <h3 className="audience-card__title">Changemakers</h3>
                    <p className="audience-card__description">
                      Je bent een zelfstandige professional, consultant of
                      adviseur die organisaties begeleidt bij maatschappelijke
                      of duurzame verandering. Je wilt effectiever leren
                      handelen binnen complexe organisaties en verschillende
                      belangen bij elkaar brengen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="program-sidebar">
            <div className="details-card">
              <h3 className="details-card__heading">Programmadetails</h3>
              <div className="details-list">
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <CalendarClock aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Duur</span>{" "}
                    <span className="detail-item__value">4 Maanden</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Startdatum</span>{" "}
                    <span className="detail-item__value">Oktober 2026</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Groepsgrootte</span>{" "}
                    <span className="detail-item__value">12–18 deelnemers</span>
                    <p className="detail-item__subtext">
                      Een kleine groep gericht op persoonlijke aandacht, leren
                      van elkaar en verdieping.
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
                      <li>60 uur (inclusief voorbereiding)</li>
                      <li>5 opleidingsdagen</li>
                      <li>Intervisiesessies</li>
                      <li>Business- en persoonlijke coaching</li>
                    </ul>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <Wallet aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Investering</span>{" "}
                    <span className="detail-item__value">€4.490</span>
                    <p className="detail-item__subtext">
                      Inclusief alle studiematerialen, catering en één
                      overnachting.
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
                  alt="Universiteit Utrecht"
                  className="partner-card__logo"
                />
              </div>
              <p className="partner-card__description">
                Academisch partner in strategisch leiderschap en
                maatschappelijke impact.
              </p>
              <Link
                href={`${base}/leergang-social-intrapreneurship#program-structure`}
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
                  Je kennis van transitie, innovatie en organisatieverandering
                  verdiept en toegepast op je eigen praktijk.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">02</span>
                <p className="development-card__text">
                  Meer inzicht gekregen in je positie en invloed binnen je
                  organisatie en het bredere systeem.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">03</span>
                <p className="development-card__text">
                  Je leiderschap verder ontwikkeld en geleerd hoe je het inzet
                  op een manier die past bij jou én de
                  organisatiedoelstellingen.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">04</span>
                <p className="development-card__text">
                  Geleerd hoe je omgaat met verschillende belangen en
                  constructieve gesprekken en onderhandelingen voert met
                  betrokkenen binnen en buiten de organisatie.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">05</span>
                <p className="development-card__text">
                  Meer helderheid gekregen over welke strategische keuzes nodig
                  zijn om je initiatief te realiseren of op te schalen.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">06</span>
                <p className="development-card__text">
                  Een dieper begrip ontwikkeld van de dynamiek en patronen die
                  organisatieverandering kunnen versnellen of vertragen.
                </p>
              </article>
              <article className="development-card">
                <span className="development-card__number">07</span>
                <p className="development-card__text">
                  Concrete stappen gezet richting het realiseren of opschalen
                  van je beoogde maatschappelijke impact.
                </p>
              </article>
            </div>
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
                    <GraduationCap aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">Masterclasses</h3>
                    <p className="experience-card__description">
                      Breng nieuwe inzichten uit wetenschap, overheid en
                      bedrijfsleven samen met je eigen praktijkervaring.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <Wrench aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Praktische workshops
                    </h3>
                    <p className="experience-card__description">
                      Breng uitdagingen uit je eigen organisatie in en bekijk ze
                      vanuit nieuwe kennis en perspectieven.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UserRoundCheck aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Business coaching
                    </h3>
                    <p className="experience-card__description">
                      Werk aan uitdagingen uit je eigen organisatie én aan wat
                      die van jou vragen in je rol en leiderschap.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">Intervisie</h3>
                    <p className="experience-card__description">
                      Breng je eigen uitdagingen in, spar met andere sociale
                      intrapreneurs en leer van elkaars ervaringen en
                      perspectieven.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <Handshake aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">Buddy coaching</h3>
                    <p className="experience-card__description">
                      Werk samen met een mededeelnemer en ondersteun elkaar
                      gedurende het gehele programma.
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <div className="experience-carousel__controls">
              <button
                className="experience-carousel__button experience-carousel__button--prev"
                type="button"
                aria-label="Wat je gaat ervaren"
              >
                {" "}
                <span aria-hidden="true">‹</span>{" "}
              </button>{" "}
              <button
                className="experience-carousel__button experience-carousel__button--next"
                type="button"
                aria-label="Wat je gaat ervaren"
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
              Het programma combineert vijf leermodules, persoonlijke coaching
              en praktijkopdrachten die direct aansluiten op jouw eigen
              organisatie.
            </p>
          </header>
          <div className="program-structure__visual">
            <img
              src="/wstf/images/programs/LSI/WSTF-LSI-program-structure-dutch.png"
              alt="Programma-opbouw"
            />
          </div>
          <p className="program-structure__intro">
            Het programma werkt van binnen naar buiten: van jouw rol als
            transitieleider naar de dynamiek binnen je organisatie en
            uiteindelijk het bredere systeem waarin je verandering wilt
            realiseren.
          </p>
          <div className="program-structure__cards">
            <article className="program-structure__card">
              <h3 className="program-structure__card-title">Persoon</h3>
              <p className="program-structure__card-text">
                Verandering begint bij je eigen rol als social intrapreneur.
                Welk leiderschap vraagt deze verandering van jou, welke
                kwaliteiten zet je al goed in en wat heb je nog nodig om
                effectiever te worden?
              </p>
            </article>
            <article className="program-structure__card">
              <h3 className="program-structure__card-title">Organisatie</h3>
              <p className="program-structure__card-text">
                Vervolgens kijk je naar jouw rol binnen de organisatie: je
                positie en invloed, de belangen die spelen en de patronen die
                verandering ondersteunen of juist blokkeren. Je onderzoekt wat
                er nodig is om mensen mee te krijgen en invloed uit te oefenen
                op de besluitvorming rond je initiatief.
              </p>
            </article>
            <article className="program-structure__card">
              <h3 className="program-structure__card-title">Systeem</h3>
              <p className="program-structure__card-text">
                Tot slot zoom je uit naar het bredere systeem waarin jouw
                organisatie opereert: de partijen, belangen en ontwikkelingen
                die van invloed zijn op de verandering en hoe je daarop kunt
                inspelen.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="intrapreneur-section">
        <div className="intrapreneur-section__container">
          <header className="intrapreneur-section__header">
            <p className="intrapreneur-section__eyebrow">
              Maatschappelijke Impact Opschalen
            </p>
            <h2 className="intrapreneur-section__title">
              Wat is een social intrapreneur?
            </h2>
            <p className="intrapreneur-section__intro">
              Als social intrapreneur neem je het initiatief om maatschappelijke
              en duurzame verandering te creëren van binnenuit een bestaande
              organisatie. Dit vraagt om meer dan een goed idee: je moet mensen
              meekrijgen, invloed opbouwen en kunnen omgaan met bestaande
              structuren en verschillende belangen.
            </p>
          </header>
          <div className="intrapreneur-section__content">
            <div className="intrapreneur-section__main">
              <div className="intrapreneur-section__questions">
                <div className="intrapreneur-section__question">
                  1. Hoe vergroot je je invloed binnen een organisatie waarin je
                  niet alles zelf beslist?
                </div>
                <div className="intrapreneur-section__question">
                  2. Hoe ga je om met weerstand, hardnekkige patronen en
                  tegenstrijdige belangen?
                </div>
                <div className="intrapreneur-section__question">
                  3. Wanneer moet je vernieuwen en wanneer is het slimmer om
                  eerst te versterken wat er al staat? En hoe zet je jouw
                  leiderschap in om die verandering te realiseren?
                </div>
              </div>
              <div className="intrapreneur-section__image">
                <img
                  src="/wstf/images/programs/LSI/what-is.jpeg"
                  alt="Maatschappelijke Impact Opschalen"
                />
              </div>
            </div>
            <div className="intrapreneur-section__highlights">
              <div className="intrapreneur-section__highlight">
                Vier maanden lang werk je samen met andere sociale intrapreneurs
                aan herkenbare uitdagingen uit je eigen organisatie: weerstand,
                botsende belangen, jouw invloed en de vraag hoe je een goed idee
                daadwerkelijk onderdeel maakt van hoe de organisatie werkt.
              </div>
              <div className="intrapreneur-section__highlight">
                Tijdens masterclasses doe je nieuwe kennis en perspectieven op
                van academici en experts uit overheid en bedrijfsleven. In
                workshops, intervisie en coaching verbind je die direct aan
                situaties uit je eigen praktijk.
              </div>
            </div>
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
                      src="/wstf/images/team/WSTF-team-Niels-Bosma.jpg"
                      alt="Niels Bosma"
                    />
                  </div>
                  <h3 className="person-card__name">
                    Professor Dr. Niels Bosma
                  </h3>
                  <p className="person-card__role">
                    Hoogleraar Leergang Sociaal Ondernemen, Universiteit Utrecht
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
                    Docent en coach Persoonlijk Leiderschap, Nyenrode Business
                    Universiteit
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Richard%20Janssen.jpg"
                      alt="Richard Janssen"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Richard Janssen</h3>
                  <p className="person-card__role">
                    Universitair hoofddocent Strategie, Organisatie, Leiderschap
                    en Innovatiemanagement, Nyenrode Business Universiteit
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Coen.jpeg"
                      alt="Dr. Coen Rigtering"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Coen Rigtering</h3>
                  <p className="person-card__role">
                    Universitair docent Strategie en Organisatie, Universiteit
                    Utrecht, Intrapreneurship en Corporate Entrepreneurship
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Karin%20Geuijen.jpeg"
                      alt="Karin Geuijen"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Karin Geuijen</h3>
                  <p className="person-card__role">
                    Universitair hoofddocent Bestuurs- en Organisatiewetenschap,
                    Universiteit Utrecht
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Jacoline.jpeg"
                      alt="Drs. Jacqueline Plomp"
                    />
                  </div>
                  <h3 className="person-card__name">Jacoline Plomp</h3>
                  <p className="person-card__role">
                    Senior impact expert en bestuurslid van Grant Thornton
                  </p>
                </div>
                <div className="person-card">
                  <div className="person-card__image-box">
                    <img
                      src="/wstf/images/team/Mathias.jpeg"
                      alt="Dr. Mathias Boene"
                    />
                  </div>
                  <h3 className="person-card__name">Dr. Mathias Boene</h3>
                  <p className="person-card__role">
                    Universitair hoofddocent Creativiteit & Innovatiemanagement,
                    Universiteit Utrecht
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
                    Trainer / coach Change and Transition Management, partner
                    bij Pawlik
                  </p>
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
              Sluit je aan bij een netwerk van sociale intrapreneurs en
              changemakers die bouwen aan een betere toekomst.
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
