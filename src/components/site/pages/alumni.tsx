/* eslint-disable @next/next/no-img-element */
// Gegenereerd uit alumni.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { YoutubePlayer } from "@/components/site/youtube-player";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Alumni | We Shape The Future",
  description: "",
};

export function AlumniContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Alumni</h1>
            <h2 className="page-hero__subtitle">
              De impact van 15 jaar We Shape the Future
            </h2>
          </div>
          <p className="page-hero__description">
            Al meer dan 15 jaar komen bij We Shape the Future ondernemers,
            professionals en organisaties samen vanuit een gedeelde ambitie:
            maatschappelijke impact creëren en vergroten door ondernemerschap,
            leiderschap en innovatie.
          </p>
        </div>
      </section>
      <section className="featured-stories">
        <div className="featured-stories__container">
          <div className="featured-stories__header">
            <h2 className="featured-stories__title">Uitgelichte verhalen</h2>
            <div className="featured-stories__intro">
              <h3 className="featured-stories__heading">
                Elke verandering begint met een besluit.
              </h3>
              <p className="featured-stories__description">
                Maak kennis met de mensen die de stap hebben gezet om
                gestructureerd op te schalen en blijvende maatschappelijke
                impact te creëren
              </p>
            </div>
          </div>
          <div className="featured-stories__grid">
            <article className="story-card">
              <img
                className="story-card__image"
                src="/wstf/images/alumni/Laura%20and%20Freddie.png"
                alt="Laura Kistemaker and Freddie Krullaars"
              />
              <div className="story-card__overlay">
                <div className="story-card__content">
                  <div className="story-card__body">
                    <p className="story-card__author">
                      Laura Kistemaker and Freddie Krullaars
                    </p>
                    <h3 className="story-card__quote">
                      “Opschalen vraagt om een sterke basis: lessen uit de
                      Leergang Sociaal Ondernemen”
                    </h3>
                  </div>
                  <Link
                    href={`${base}/interview/laura-kistemaker-and-freddi-krullaars`}
                    className="story-card__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </div>
            </article>
            <article className="story-card">
              <img
                className="story-card__image"
                src="/wstf/images/alumni/marleen-en-daniel.png"
                alt="Marleen van der Kolk and Daniël Klijn"
              />
              <div className="story-card__overlay">
                <div className="story-card__content">
                  <div className="story-card__body">
                    <p className="story-card__author">
                      Marleen van der Kolk and Daniël Klijn
                    </p>
                    <h3 className="story-card__quote">
                      “Financiële zelfstandigheid betekent dat je zelf aan het
                      roer blijft van je eigen organisatie.”
                    </h3>
                  </div>
                  <Link
                    href={`${base}/interview/marleen-en-daniel`}
                    className="story-card__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </div>
            </article>
            <article className="story-card">
              <img
                className="story-card__image"
                src="/wstf/images/alumni/Otto-Reuchlin-oprichter-van-Peer-Accountants.jpg"
                alt="Otto Reuchlin, founder of Peer Accountants"
              />
              <div className="story-card__overlay">
                <div className="story-card__content">
                  <div className="story-card__body">
                    <p className="story-card__author">
                      Otto Reuchlin, Peer Accountants
                    </p>
                    <h3 className="story-card__quote">
                      “Meer rust als ondernemer door de Leergang Sociaal
                      Ondernemen”
                    </h3>
                  </div>
                  <Link
                    href={`${base}/interview/otto`}
                    className="story-card__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="more-stories">
        <div className="more-stories__container">
          <h2 className="more-stories__title">Meer alumni-verhalen</h2>
          <div className="more-stories__content">
            <div className="more-stories__grid">
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Erwin-van-Asselt.png"
                  alt="Erwin van Asselt, founder of BuurtMaaltijden"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Erwin van Asselt – Neighborhood meals
                  </p>
                  <h3 className="story-card-small__quote">
                    “Structuur gaf me de rust om niet constant van het een naar
                    het ander te rennen.”
                  </h3>
                  <Link
                    href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/stephanie-van-gerven-en-michiel-van-rijn-van-alkemade.png"
                  alt="Stéphanie van Gerven and Michiel van Rijn van Alkemade"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Stéphanie van Gerven and Michiel van Rijn van Alkemade
                  </p>
                  <h3 className="story-card-small__quote">
                    “Wat voor vier mensen werkt, werkt niet altijd voor 35.”
                  </h3>
                  <Link
                    href={`${base}/interview/stephanie-van-gerven-en-michiel-van-rijn-van-alkemade`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/esther-en-steffie.png"
                  alt="Esther Smit and Steffie van den Bosch"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Esther Smit and Steffie van den Bosch
                  </p>
                  <h3 className="story-card-small__quote">
                    “Het kan dus wél: commercieel succesvol zijn én
                    maatschappelijke impact maken.”
                  </h3>
                  <Link
                    href={`${base}/interview/esther-en-steffie`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Iris-van-Beers-en-jan-willem-1-pink.jpg"
                  alt="Esther Smit and Steffie van den Bosch"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Iris van Beers and Jan Willem van Bokhorst
                  </p>
                  <h3 className="story-card-small__quote">
                    “Aan je sociale onderneming werken in plaats van erin, geeft
                    nieuw inzicht en perspectief”
                  </h3>
                  <Link
                    href={`${base}/interview/iris-van-beers-jan-willem-van-bokhorst`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/LSO-Stefanie-Caton.jpg"
                  alt="Stefanie Caton"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Stefanie Caton</p>
                  <h3 className="story-card-small__quote">
                    “Van ‘opschalen is niets voor ons’ naar plannen voor een
                    tweede locatie.”
                  </h3>
                  <Link
                    href={`${base}/interview/stefanie-caton`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/EllenRoseKambel.jpg"
                  alt="Ellen-Rose Kambel"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Ellen-Rose Kambel</p>
                  <h3 className="story-card-small__quote">
                    “Winst maken is geen schande, maar een noodzaak”
                  </h3>
                  <Link
                    href={`${base}/interview/ellen-rose-kambel`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/JorydeGroot.jpg"
                  alt="Jory de Groot"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Jory de Groot</p>
                  <h3 className="story-card-small__quote">
                    “In één jaar creëerden we 60 banen voor mensen met een
                    afstand tot de arbeidsmarkt.”
                  </h3>
                  <Link
                    href={`${base}/interview/jory-de-groot`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Fabian-profiel.jpg"
                  alt="Fabian Leijten"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Fabian Leijten</p>
                  <h3 className="story-card-small__quote">
                    “Iedereen weet waar we mee bezig zijn. En dat geeft rust.”
                  </h3>
                  <Link
                    href={`${base}/interview/fabian-leijten`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/IngeHoogestegerg.jpg"
                  alt="Inge Hoogesteger"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Inge Hoogesteger</p>
                  <h3 className="story-card-small__quote">
                    “Dankzij de leergang durfde ik beslissingen te nemen die ik
                    daarvoor niet had genomen”
                  </h3>
                  <Link
                    href={`${base}/interview/inge-hoogesteger`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Hidde-Blom.jpg"
                  alt="Hidde Blom"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Hidde Blom</p>
                  <h3 className="story-card-small__quote">
                    “Succesvolle arbeidsparticipatie begint met
                    gelijkwaardigheid”
                  </h3>
                  <Link
                    href={`${base}/interview/hidde-blom`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/maris-portretfoto.jpg"
                  alt="Mariska Komproe"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Mariska Komproe</p>
                  <h3 className="story-card-small__quote">
                    “Ik kreeg weer zin om door te gaan met mijn bedrijf.”
                  </h3>
                  <Link
                    href={`${base}/interview/mariska-komproe`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/arie_en_thijs_thumb.jpg"
                  alt="Arie van der Vlies and Thijs Postma"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Arie van der Vlies and Thijs Postma
                  </p>
                  <h3 className="story-card-small__quote">
                    “Ondernemen met hoofd, hart en handen: winst is geen vies
                    woord”
                  </h3>
                  <Link
                    href={`${base}/interview/arie-van-der-vlies-and-thijs-postma`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Nelly%20Wisse.jpg"
                  alt="Nelly Wisse"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Nelly Wisse</p>
                  <h3 className="story-card-small__quote">
                    “Een goed idee is weinig waard als er binnen de organisatie
                    niets mee gebeurt.”
                  </h3>
                  <Link
                    href={`${base}/interview/nelly-wisse`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Laurens%20Cramer.png"
                  alt="Laurens Cramer"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">Laurens Cramer</p>
                  <h3 className="story-card-small__quote">
                    “Soms moet je zakelijk maken wat je doet om vertrouwen te
                    winnen.”
                  </h3>
                  <Link
                    href={`${base}/interview/laurens-cramer`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/antoinette-opstelten-and-claartje-aarts.png"
                  alt="Antoinette Opstelten and Claartje Aarts"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Antoinette Opstelten and Claartje Aarts
                  </p>
                  <h3 className="story-card-small__quote">
                    “Je krijgt mensen niet mee met alleen feiten en tabellen.”
                  </h3>
                  <Link
                    href={`${base}/interview/antoinette-opstelten-and-claartje-aarts`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
              <article className="story-card-small">
                <img
                  className="story-card-small__image"
                  src="/wstf/images/alumni/Marieke-Kamphuis-en-Machteld.png"
                  alt="Marieke Kamphuis and Machteld Rijnten"
                />
                <div className="story-card-small__content">
                  <p className="story-card-small__author">
                    Marieke Kamphuis and Machteld Rijnten
                  </p>
                  <h3 className="story-card-small__quote">
                    “Hoe beïnvloeden mijn onbewuste patronen mijn werk als
                    sociaal ondernemer?”
                  </h3>
                  <Link
                    href={`${base}/interview/marieke-kamphuis-en-machteld-rijnten`}
                    className="story-card-small__link"
                  >
                    {" "}
                    Lees het volledige interview hier →{" "}
                  </Link>
                </div>
              </article>
            </div>
            <div className="more-stories__navigation">
              <button
                className="more-stories__button more-stories__button--prev"
                aria-label="Previous"
              >
                {" "}
                <ChevronLeft aria-hidden="true" />{" "}
              </button>{" "}
              <button
                className="more-stories__button more-stories__button--next"
                aria-label="Next"
              >
                {" "}
                <ChevronRight aria-hidden="true" />{" "}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="community-gallery">
        <div className="community-gallery__container">
          <div className="community-gallery__header">
            <h2 className="community-gallery__title">Community-momenten</h2>
          </div>
          <div className="community-gallery__grid">
            <figure className="gallery-item gallery-item--tall">
              <img
                src="/wstf/images/community/moments/PHOTO-2026-08-11-19-22-12.jpg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--small">
              <img
                src="/wstf/images/community/moments/PHOTO-2026-08-04-20-15-58.jpg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--small">
              <img
                src="/wstf/images/community/moments/LSO%20zomer%202024%205%20copy.jpeg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--tall">
              <img
                src="/wstf/images/community/moments/Aniek%20LSO%202025%20copy.jpeg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--large">
              <img
                src="/wstf/images/community/moments/Groepsfoto%20deelnemers-geslaagd!%20LSO%202012%20copy.jpg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--tall">
              <img
                src="/wstf/images/community/moments/LSO%20zomer%202024%203%20copy.jpeg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--small">
              <img
                src="/wstf/images/community/moments/LSO%20Advanced%20Nyenrode%20certificaat%202018%20copy.jpeg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--small">
              <img
                src="/wstf/images/community/moments/Iris%2C%20Jan%20Willem%20%26%20Eveline%20copy.jpeg"
                alt=""
              />
            </figure>
            <figure className="gallery-item gallery-item--wide">
              <img
                src="/wstf/images/community/moments/PHOTO-2026-08-12-10-27-49.jpg"
                alt=""
              />
            </figure>
          </div>
        </div>
      </section>
      <section className="video-grid-section">
        <div className="video-grid-section__container">
          <div className="video-grid-section__header">
            <h2 className="video-grid-section__title">
              Verhalen uit de community
            </h2>
            <p className="video-grid-section__intro">
              Ontdek ervaringen, perspectieven en inzichten uit onze community.
            </p>
          </div>
          <div className="video-grid">
            <article className="video-card">
              <div className="video-card__media">
                <YoutubePlayer
                  videoId="5YXs5TMR3OY"
                  poster="https://img.youtube.com/vi/5YXs5TMR3OY/maxresdefault.jpg"
                />
              </div>
              <div className="video-card__content">
                <p className="video-card__description">
                  “Van afvalvrije steden tot gelijke kansen voor jongeren: vijf
                  sociaal ondernemers over ondernemen met maatschappelijke
                  impact”
                </p>
              </div>
            </article>
            <article className="video-card">
              <div className="video-card__media">
                <YoutubePlayer
                  videoId="JEscOGvo2eg"
                  poster="https://img.youtube.com/vi/JEscOGvo2eg/maxresdefault.jpg"
                />
              </div>
              <div className="video-card__content">
                <p className="video-card__description">
                  Loth van Veen: “De opleiding was een soort APK voor mijn
                  bedrijf.”
                </p>
              </div>
            </article>
            <article className="video-card">
              <div className="video-card__media">
                <YoutubePlayer
                  videoId="T2GYKUvbNdU"
                  poster="https://img.youtube.com/vi/T2GYKUvbNdU/maxresdefault.jpg"
                />
              </div>
              <div className="video-card__content">
                <p className="video-card__description">
                  Laura van Holk: “De verbondenheid in de groep is veel meer dan
                  ik van tevoren had verwacht.”
                </p>
              </div>
            </article>
            <article className="video-card">
              <div className="video-card__media">
                <YoutubePlayer
                  videoId="L72vxL_UM-Q"
                  poster="https://img.youtube.com/vi/L72vxL_UM-Q/maxresdefault.jpg"
                />
              </div>
              <div className="video-card__content">
                <p className="video-card__description">
                  Tjeerd van Raalte: “Veel ondernemers werken ín hun onderneming
                  in plaats van áán hun onderneming.”
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="cta">
        <div className="cta__container">
          <h2 className="cta__title">Word deel van de community.</h2>
          <p className="cta__description">
            Ook na afloop van je programma blijf je elkaar vinden: om ervaringen
            te delen, van en met elkaar te leren en de verdieping op te zoeken
            tijdens events, masterclasses en alumnibijeenkomsten.
          </p>
          <Link className="cta__button" href={`${base}/community`}>
            {" "}
            <span className="cta__button-text"> Sluit je nu aan </span>{" "}
          </Link>
        </div>
      </section>
    </>
  );
}
