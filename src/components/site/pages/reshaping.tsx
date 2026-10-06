/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit reshaping-your-future.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import {
  MapPin,
  Focus,
  Compass,
  CalendarClock,
  UsersRound,
  MoonStar,
  BadgeCheck,
  Wallet,
  Brain,
  Search,
  UserRoundCheck,
  Handshake,
} from "lucide-react";
import { ApplyButton } from "@/components/site/popup-buttons";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Programma's | Reshaping Your Future",
  description: "",
};

export function ReshapingContent() {
  return (
    <>
      <section className="course-hero">
        <img
          className="course-hero__image"
          src="/wstf/images/programs/RYF/ryf-hero.png"
          alt="Reshaping Your Future"
        />
        <div className="course-hero__content">
          <div className="course-hero__text">
            <h1 className="course-hero__title">Reshaping Your Future</h1>
            <p className="course-hero__description">
              Je hebt veel opgebouwd, geleerd en bereikt. Nu is het tijd om uit
              te zoomen, stil te staan bij wat voor jou belangrijk is en nieuwe
              perspectieven en mogelijkheden te verkennen.
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
                Een driedaagse intensieve training voor ervaren oprichters, met
                ruimte voor reflectie en verdieping via groepswerk, 1-op-1
                coaching en avondsessies.
              </p>
              <Link
                href={`${base}/reshaping-your-future#program-details`}
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
                Voor ervaren oprichters die veel hebben opgebouwd en voor nieuwe
                keuzes staan rond hun rol, onderneming of volgende ambitie.
              </p>
              <Link
                href={`${base}/reshaping-your-future#program-audience`}
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
                Bekijk vertrouwde patronen vanuit nieuwe perspectieven en krijg
                scherper zicht op de mogelijkheden die voor je liggen en de
                keuzes die daarbij passen.
              </p>
              <Link
                href={`${base}/reshaping-your-future#renew-your-focus`}
                className="course-info__link"
              >
                {" "}
                Bekijk leeropbrengsten &rarr;{" "}
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className="program-section">
        <div className="program-section__container">
          <div className="program-section__main">
            <div id="program-overview" className="program-block">
              <div className="program-block__header">
                <h2 className="program-block__title">Over het programma</h2>
                <p className="program-block__subtitle">
                  Als ervaren oprichter heb je jarenlange ervaring met het
                  bouwen en leiden van een organisatie en het nemen van
                  moeilijke beslissingen. Maar als je gewend bent altijd vooruit
                  te kijken, is er weinig ruimte om uit te zoomen en opnieuw
                  naar het grotere geheel te kijken.
                </p>
                <p className="program-block__subtitle">
                  Tijdens Reshaping Your Future kijk je drie dagen naar wat jou
                  als mens en ondernemer tot hier heeft gebracht. Naar wat echt
                  bij je past, welke patronen je keuzes beïnvloeden en welke
                  kwaliteiten of ambities je meer ruimte wilt geven.
                </p>
                <p className="program-block__subtitle">
                  Welke keuzes passen nog bij wat je wilt? En welke
                  mogelijkheden zie je als je opnieuw naar jezelf en je toekomst
                  kijkt?
                </p>
                <p className="program-block__subtitle">
                  Samen met een kleine groep mede-oprichters leg je ideeën en
                  dilemma’s naast verschillende ervaringen en perspectieven,
                  zodat je vertrekt met nieuwe inzichten en een scherper beeld
                  van waar jouw nieuwe focus ligt.
                </p>
              </div>
              <div id="renew-your-focus" className="feature-grid">
                <div className="feature-card feature-card--image">
                  <img
                    src="/wstf/images/programs/RYF/This%20is%20Benyamin.png"
                    alt="Hernieuw je focus"
                    className="feature-card__img"
                  />
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <MapPin aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">Hernieuw je focus</h3>
                  <p className="feature-card__description">
                    Zoom uit van de dagelijkse beslissingen en verplichtingen en
                    kijk opnieuw naar het grotere geheel. Wat verdient nu echt
                    prioriteit?
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Focus aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">Verdiep je inzichten</h3>
                  <p className="feature-card__description">
                    Kijk vanuit een ander perspectief naar wat je keuzes
                    beïnvloedt en wat tot nu toe buiten beeld bleef.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <Compass aria-hidden="true" />
                  </div>
                  <h3 className="feature-card__title">Vorm de toekomst</h3>
                  <p className="feature-card__description">
                    Verken nieuwe mogelijkheden voor je rol, onderneming of
                    volgende ambitie en vertaal ze naar welke richting daarbij
                    past.
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
                  Reshaping Your Future is voor ervaren oprichters die een
                  organisatie hebben opgebouwd en geleid en opnieuw willen
                  bepalen waar ze hun ervaring, tijd en energie voor willen
                  inzetten, passend bij hun rol, onderneming en ambities.
                </p>
              </div>
              <div className="audience-grid">
                <div className="audience-image-card">
                  <img
                    src="/wstf/images/programs/RYF/group-discussion.png"
                    alt="Ervaren oprichters"
                    className="audience-image-card__img"
                  />
                </div>
                <div className="audience-list">
                  <div className="audience-card">
                    <h3 className="audience-card__title">Ervaren oprichters</h3>
                    <p className="audience-card__description">
                      Je bent een koploper in je vakgebied en staat open voor
                      nieuwe perspectieven op jezelf en je organisatie. Je wilt
                      onderzoeken welke richting bij je past en wat jouw keuzes
                      daarin bepaalt.
                    </p>
                  </div>
                  <div className="audience-card">
                    <h3 className="audience-card__title">Op een keerpunt</h3>
                    <p className="audience-card__description">
                      Je overweegt misschien een nieuwe rol, richting of
                      onderneming, of vraagt je gewoon af waar je je energie
                      vervolgens in wilt steken. Je hoeft het antwoord nog niet
                      te hebben — maar je bent klaar om de vraag te onderzoeken.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="program-sidebar">
            <div id="program-details" className="details-card">
              <h3 className="details-card__heading">Programmadetails</h3>
              <div className="details-list">
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <CalendarClock aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Duur</span>{" "}
                    <span className="detail-item__value">
                      {" "}
                      3 dagen, inclusief avondsessies{" "}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Deelnemers</span>{" "}
                    <span className="detail-item__value">
                      {" "}
                      8–12 oprichters{" "}
                    </span>
                    <p className="detail-item__subtext">
                      Een kleine groep met ruimte voor persoonlijke aandacht,
                      reflectie en verdiepende uitwisseling.
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <MoonStar aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Vorm</span>
                    <ul className="detail-item__bullet-list">
                      <li>Persoonlijke reflectie</li>
                      <li>1-op-1 coaching</li>
                      <li>Systemisch groepswerk</li>
                      <li>Avondprogramma</li>
                      <li>2 overnachtingen</li>
                    </ul>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <BadgeCheck aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Intake</span>{" "}
                    <span className="detail-item__value">
                      {" "}
                      Een persoonlijke intake met een van de coaches maakt deel
                      uit van de aanmeldprocedure.{" "}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-item__icon">
                    <Wallet aria-hidden="true" />
                  </div>
                  <div className="detail-item__content">
                    <span className="detail-item__label">Investering</span>{" "}
                    <span className="detail-item__value">
                      {" "}
                      €2.895 excl. btw{" "}
                    </span>
                    <p className="detail-item__subtext">
                      Inclusief alle materialen, twee overnachtingen en
                      volledige catering.
                    </p>
                  </div>
                </div>
              </div>
              <ApplyButton className="submit-btn">Meld je nu aan</ApplyButton>
            </div>
          </aside>
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
                    <Brain aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Individuele reflectie
                    </h3>
                    <p className="experience-card__description">
                      Kijk met volle aandacht naar keuzes, ambities of vragen
                      die in de dagelijkse operatie steeds naar de achtergrond
                      verdwijnen.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <Search aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Verdiepende oefeningen
                    </h3>
                    <p className="experience-card__description">
                      Maak zichtbaar welke patronen je keuzes beïnvloeden en
                      bekijk vertrouwde situaties vanuit een ander perspectief.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UsersRound aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Systemisch groepswerk
                    </h3>
                    <p className="experience-card__description">
                      Onderzoek welke dynamieken rond jou en je organisatie een
                      rol spelen en maak patronen zichtbaar die je zelf niet
                      altijd ziet.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <UserRoundCheck aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">Ervaren coaching</h3>
                    <p className="experience-card__description">
                      Werk met ervaren coaches die je helpen nieuwe inzichten te
                      vertalen naar heldere keuzes en focus.
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <div className="feature-card__icon">
                    <Handshake aria-hidden="true" />
                  </div>
                  <div className="experience-card__content">
                    <h3 className="experience-card__title">
                      Leren met gelijkgestemden
                    </h3>
                    <p className="experience-card__description">
                      Toets je ideeën aan mede-oprichters die de
                      verantwoordelijkheid en dilemma's van ondernemerschap uit
                      eigen ervaring kennen.
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
      <section className="program-outcomes">
        <div className="program-outcomes__container">
          <h2 className="program-outcomes__title">
            Aan het einde van dit programma heb je:
          </h2>
          <div className="program-outcomes__content">
            <div className="program-outcomes__list">
              <div className="program-outcomes__item">
                <p>
                  <strong>
                    Meer helderheid over welke richting je in de volgende fase
                    wilt verkennen:
                  </strong>{" "}
                  je huidige bedrijf verder uitbouwen, iets nieuws starten, een
                  exit verkennen of ruimte maken voor een heel ander avontuur.
                </p>
              </div>
              <div className="program-outcomes__item">
                <p>
                  <strong>
                    Een nieuwe blik op je onderneming en jouw rol daarin
                  </strong>
                  , door zakelijke inzichten te verbinden met persoonlijke
                  reflectie en te onderzoeken welke patronen en ervaringen jouw
                  keuzes beïnvloeden.
                </p>
              </div>
              <div className="program-outcomes__item">
                <p>
                  <strong>
                    Scherper zicht op waar je je tijd en energie in wilt steken
                  </strong>
                  , en wat je niet langer zelf hoeft te dragen.
                </p>
              </div>
              <div className="program-outcomes__item">
                <p>
                  <strong>
                    Ideeën en mogelijkheden om verder te verkennen
                  </strong>
                  , vanuit perspectieven die je anders laten kijken naar wat je
                  hebt opgebouwd en waar je in de toekomst ruimte aan wilt
                  geven.
                </p>
              </div>
              <div className="program-outcomes__item">
                <p>
                  <strong>Een vertrouwde groep mede-oprichters</strong> die de
                  realiteit van het bouwen en leiden van een bedrijf begrijpen
                  en je kunnen blijven uitdagen en inspireren.
                </p>
              </div>
            </div>
            <div className="program-outcomes__images">
              <img
                src="/wstf/images/team/oscar%20westra%20van%20holthe.jpg"
                alt=""
                className="program-outcomes__image"
              />{" "}
              <img
                src="/wstf/images/team/Nicole%20Verhoeven.png"
                alt=""
                className="program-outcomes__image"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="next-step-section">
        <div className="next-step-section__container">
          <div className="next-step-section__header">
            <h2 className="next-step-section__title">
              Klaar om te zien wat je nog niet zag?
            </h2>
            <p className="next-step-section__description">
              Drie dagen om uit te zoomen, nieuwe perspectieven op te doen en
              opnieuw richting te geven aan wat voor je ligt.
            </p>
          </div>
          <div className="next-step-section__cards">
            <a href="javascript:void(0)" className="next-step-card">
              <h3 className="next-step-card__title">Meld je aan</h3>
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
