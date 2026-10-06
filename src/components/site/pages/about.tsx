/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit about.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { X } from "lucide-react";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Over We Shape the Future",
  description: "",
};

export function AboutContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Over ons</h1>
            <h2 className="page-hero__subtitle">We Shape the Future</h2>
          </div>
          <p className="page-hero__description">
            Sinds 2010 begeleiden we sociaal ondernemers, intrapreneurs en
            changemakers bij het opschalen van hun onderneming en het vergroten
            van hun maatschappelijke impact. Wat begon met de eerste academische
            opleiding voor sociaal ondernemers in Nederland, groeide uit tot
            meerdere academische programma’s en een community van impactmakers
            in alle fasen van ondernemen.
          </p>
        </div>
      </section>
      <section className="founder-message">
        <div className="founder-message__container">
          <div className="founder-message__content">
            <div className="founder-message__card">
              <img
                src="/wstf/images/team/Nicole%20Verhoeven.png"
                alt="Nicole Verhoeven"
                className="founder-message__avatar"
              />
              <blockquote className="founder-message__quote">
                “Met elke groep beginnen we opnieuw aan een bijzondere reis. We
                nemen deelnemers mee in een programma dat richting en structuur
                geeft, uitdaagt en nieuwe perspectieven opent. Het zijn mensen
                met lef en ambitie, die bereid zijn echte keuzes te maken. Als
                team begeleiden we dat proces intensief — en het blijft
                inspirerend om te zien waar het ieder van hen brengt.”
              </blockquote>
              <div className="founder-message__author">
                <h3 className="founder-message__name">– Nicole Verhoeven</h3>
                <p className="founder-message__role">(Oprichter & Directeur)</p>
              </div>
            </div>
            <div className="founder-message__image-wrapper">
              <img
                src="/wstf/images/about/WSTF-LSO-start-groep-2025.jpeg"
                alt="Oprichter & Directeur"
                className="founder-message__image"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="team">
        <div className="team__container">
          <div className="team__header">
            <div className="team__heading">
              <h2 className="team__title">
                De mensen achter We Shape the Future
              </h2>
            </div>
            <div className="team__intro">
              <p className="team__description">
                Onze programma's brengen academici, ervaren praktijkmensen,
                trainers en coaches met verschillende expertises en
                perspectieven samen. Samen dagen zij deelnemers uit om nieuwe
                kennis toe te passen, andere perspectieven te verkennen en
                kritisch te kijken naar hun eigen leiderschap en organisatie.
              </p>
              <br />
              <p className="team__description">
                Maak kennis met de mensen die We Shape the Future, de
                programma’s en de community mede vormgeven.
              </p>
            </div>
          </div>
          <div className="team__content">
            <nav className="team-filter">
              <button
                className="team-filter__button team-filter__button--active"
                data-filter="program-guide"
              >
                {" "}
                Programmaleiding{" "}
              </button>{" "}
              <button
                className="team-filter__button"
                data-filter="alumni-board"
              >
                {" "}
                Alumni Board{" "}
              </button>{" "}
              <button
                className="team-filter__button"
                data-filter="strategic-council"
              >
                {" "}
                Strategische Raad{" "}
              </button>{" "}
              <button className="team-filter__button" data-filter="board-wstf">
                {" "}
                Bestuur WSTF{" "}
              </button>{" "}
              <button className="team-filter__button" data-filter="coaches">
                {" "}
                Coaches{" "}
              </button>{" "}
              <button className="team-filter__button" data-filter="faculty">
                {" "}
                Faculty{" "}
              </button>
            </nav>
            <div className="team__grid">
              <article
                className="team-card team-card--bio"
                data-category="program-guide"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-controls="nicoleBioPopup"
              >
                <img
                  src="/wstf/images/team/Nicole%20Verhoeven.png"
                  alt="Nicole Verhoeven"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Nicole Verhoeven</h3>
                  <p className="team-card__role">Oprichter & Directeur</p>
                </div>
              </article>
              <article
                className="team-card team-card--bio"
                data-category="program-guide"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-controls="nielsBioPopup"
              >
                <img
                  src="/wstf/images/team/WSTF-team-Niels-Bosma.jpg"
                  alt="Niels Bosma"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Niels Bosma</h3>
                  <p className="team-card__role">
                    Academisch Directeur We Shape the Future, Hoogleraar Sociaal
                    Ondernemerschap, Universiteit Utrecht
                  </p>
                </div>
              </article>
              <article className="team-card" data-category="alumni-board">
                <img
                  src="/wstf/images/team/Marlies%20van%20Hilten.jpg"
                  alt="Marlies van Hilten"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Marlies van Hilten</h3>
                  <p className="team-card__role">
                    Voorzitter van het Alumnibestuur
                  </p>
                  <p className="team-card__role">LSO Advanced Alumna, 2018</p>
                </div>
              </article>
              <article className="team-card" data-category="alumni-board">
                <img
                  src="/wstf/images/team/Michiel%20Bodt.jpg"
                  alt="Michiel Bodt"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Michiel Bodt</h3>
                  <p className="team-card__role">
                    Strategische Partnerschappen & Funding, Alumnibestuur
                  </p>
                  <p className="team-card__role">LSO Alumnus, 2011</p>
                </div>
              </article>
              <article className="team-card" data-category="alumni-board">
                <img
                  src="/wstf/images/team/Soraya%20Mooijweer.jpg"
                  alt="Soraya Mooijweer"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Soraya Mooijweer</h3>
                  <p className="team-card__role">
                    Community Engagement, Alumnibestuur
                  </p>
                  <p className="team-card__role">LSO Alumna, 2025</p>
                </div>
              </article>
              <article className="team-card" data-category="alumni-board">
                <img
                  src="/wstf/images/team/Erwin%20van%20Asselt.jpg"
                  alt="Erwin van Asselt"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Erwin van Asselt</h3>
                  <p className="team-card__role">Financiën, Alumnibestuur</p>
                  <p className="team-card__role">LSO Alumnus, 2021</p>
                </div>
              </article>
              <article className="team-card" data-category="alumni-board">
                <img
                  src="/wstf/images/team/Lotje-Terra.jpeg"
                  alt="Lotje Terra"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Lotje Terra</h3>
                  <p className="team-card__role">
                    Sociale Innovatie & Systeemverandering, Alumnibestuur
                  </p>
                  <p className="team-card__role">LSO Alumna, 2019</p>
                </div>
              </article>
              <article className="team-card" data-category="strategic-council">
                <img
                  src="/wstf/images/team/Benyamin%20van%20Raalte.jpeg"
                  alt="Benyamin van Raalte"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Benyamin van Raalte</h3>
                  <p className="team-card__role">
                    Voorzitter van de Strategische Adviesraad
                  </p>
                  <p className="team-card__role">LSO Alumnus, 2022</p>
                </div>
              </article>
              <article className="team-card" data-category="strategic-council">
                <img
                  src="/wstf/images/team/Arianne%20de%20Jong%202.jpeg"
                  alt="Arianne de Jong"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Arianne de Jong</h3>
                  <p className="team-card__role">
                    Secretaris van de Strategische Adviesraad
                  </p>
                  <p className="team-card__role">LSO Alumna, 2012</p>
                </div>
              </article>
              <article className="team-card" data-category="board-wstf">
                <img
                  src="/wstf/images/team/Floris%20Croon%2C%20Chairman.jpg"
                  alt="Floris Croon"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Floris Croon</h3>
                  <p className="team-card__role">
                    Voorzitter van het LSO Foundation Bestuur
                  </p>
                </div>
              </article>
              <article className="team-card" data-category="board-wstf">
                <img
                  src="/wstf/images/team/Pjotr-Anthoni-Treasurer-LSO.png"
                  alt="Pjotr Anthoni"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Pjotr Anthoni</h3>
                  <p className="team-card__role">
                    Penningmeester van het LSO Foundation Bestuur
                  </p>
                </div>
              </article>
              <article className="team-card" data-category="board-wstf">
                <img
                  src="/wstf/images/team/WSTF-team-Rob-Jansen.jpg"
                  alt="Rob Jansen"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Rob Jansen</h3>
                  <p className="team-card__role">
                    Secretaris van het LSO Foundation Bestuur
                  </p>
                  <p className="team-card__role">LSO Advanced alumnus</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Roeland%20Weebers.jpg"
                  alt="Roeland Weebers"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Roeland Weebers</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Monique%20Zandbergen.png"
                  alt="Monique Zandbergen"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Monique Zandbergen</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Doesje%20Fransen.jpeg"
                  alt="Doesje Fransen"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Doesje Fransen</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Harvey%20Lansdorf.jpeg"
                  alt="Harvey Lansdorf"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Harvey Lansdorf</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Bartel%20Geleijnse.png"
                  alt="Bartel Geleijnse"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Bartel Geleijnse</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Carolien-van-Wersch.jpg"
                  alt="Carolien van Wersch"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Carolien van Wersch</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="coaches">
                <img
                  src="/wstf/images/team/Enver%20Loke.jpg"
                  alt="Enver Loke"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Enver Loke</h3>
                  <p className="team-card__role">Coach</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Margit%20Sleeuwenhoek.jpg"
                  alt="Margit Sleeuwenhoek"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Margit Sleeuwenhoek</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Caroline-Olde-Rikkert.jpg"
                  alt="Caroline Olde Rikkert"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Caroline Olde Rikkert</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/oscar%20westra%20van%20holthe.jpg"
                  alt="Oscar Westra van Holthe"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Oscar Westra van Holthe</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Karin%20Geuijen.jpeg"
                  alt="Karin Geuijen"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Karin Geuijen</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Abdulkader%20Kaakeh.jpeg"
                  alt="Abdulkader Kaakeh"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Abdulkader Kaakeh</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Helen-Toxopeus_0069%20kleur.jpg"
                  alt="Helen Toxopeus"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Helen Toxopeus</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Leendert%20de%20Bell.jpg"
                  alt="Leendert de Bell"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Leendert de Bell</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Jeroen%20de%20Jong.jpg"
                  alt="Jeroen de Jong"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Jeroen de Jong</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Stephanie%20van%20Gerven.jpeg"
                  alt="Stéphanie van Gerven"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Stéphanie van Gerven</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
              <article className="team-card" data-category="faculty">
                <img
                  src="/wstf/images/team/Prof.-mr.-dr.-Manuel.jpg"
                  alt="Manuel Lokin"
                  className="team-card__image"
                />
                <div className="team-card__content">
                  <h3 className="team-card__name">Manuel Lokin</h3>
                  <p className="team-card__role">Kernfaculteit</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="about-approach">
        <div className="about-approach__container">
          <div className="about-approach__content">
            <div className="about-approach__top">
              <img
                src="/wstf/images/about/WSTF-convocation%20ceremony.jpeg"
                alt="Onze aanpak"
                className="about-approach__image"
              />
              <div className="about-approach__text">
                <h2 className="about-approach__title">Onze aanpak</h2>
                <p className="about-approach__description">
                  Je verbindt academische inzichten en bedrijfskundige kennis
                  met je eigen praktijk en persoonlijke ontwikkeling. Zo
                  ontstaat er ruimte om anders te kijken naar je organisatie, je
                  leiderschap en wat daarin speelt. Daarbij kijken we naar de
                  ondernemer of professional, de organisatie én de systemen
                  waarin zij werken. Zo worden ook patronen zichtbaar die
                  verandering in de weg kunnen staan.
                </p>
              </div>
            </div>
            <div className="about-approach__bottom">
              <h2 className="about-approach__title">
                Faculteit & academische partners
              </h2>
              <p className="about-approach__description">
                Onze programma's worden ontwikkeld en verzorgd door
                vooraanstaande academici, ervaren ondernemers en praktijkmensen,
                en experts uit de overheid en het bedrijfsleven. Zo verbinden we
                actuele academische kennis met jarenlange praktijkervaring en
                perspectieven uit verschillende sectoren.
              </p>
            </div>
          </div>
          <div className="about-approach__aside">
            <img
              src="/wstf/images/about/WSTF-Stefanie%26Ellen-Rose-2021.jpeg"
              alt="Faculteit & academische partners"
              className="about-approach__aside-image"
            />
          </div>
        </div>
      </section>
      <section className="program-highlights">
        <div className="program-highlights__container">
          <div className="program-highlights__content">
            <div className="program-highlights__intro">
              <h2 className="program-highlights__title">
                Wat onze programma's kenmerkt
              </h2>
              <p className="program-highlights__description">
                Academisch onderbouwd én stevig geworteld in de praktijk, met
                ruimte voor persoonlijke ontwikkeling en leren van elkaar. Wat
                heeft je organisatie nodig? En wat vraagt dat van jou als
                leider? Je eigen praktijk vormt steeds het uitgangspunt.
              </p>
            </div>
            <img
              src="/wstf/images/about/WSTF-Dave-toolkit-LSI-2025.jpeg"
              alt="Wat onze programma's kenmerkt"
              className="program-highlights__image"
            />
          </div>
          <div className="program-highlights__cards">
            <article className="highlight-card">
              <h3 className="highlight-card__title">Academisch fundament</h3>
              <p className="highlight-card__description">
                Werk met de nieuwste academische inzichten en modellen van onze
                academische partners.
              </p>
            </article>
            <article className="highlight-card">
              <h3 className="highlight-card__title">Ervaren praktijkmensen</h3>
              <p className="highlight-card__description">
                Leer van ondernemers, beleidsmakers en ervaren professionals die
                hun praktijkkennis inbrengen in het programma.
              </p>
            </article>
            <article className="highlight-card">
              <h3 className="highlight-card__title">Persoonlijk leiderschap</h3>
              <p className="highlight-card__description">
                Versterk je leiderschap, verdiep je zelfinzicht en ontwikkel het
                zelfvertrouwen om keuzes te maken en verandering te leiden.
              </p>
            </article>
            <article className="highlight-card">
              <h3 className="highlight-card__title">Praktische toepassing</h3>
              <p className="highlight-card__description">
                Wat je leert, neem je direct mee naar je eigen praktijk. Pas
                nieuwe kennis en inzichten toe op de uitdagingen en ambities
                binnen je organisatie.
              </p>
            </article>
            <article className="highlight-card">
              <h3 className="highlight-card__title">Sterke leercommunity</h3>
              <p className="highlight-card__description">
                Leer met en van mensen die verschillende ervaringen en
                perspectieven meebrengen — tijdens het programma en daarna.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="mission-overview">
        <div className="mission-overview__container">
          <div className="mission-overview__content">
            <div className="mission-overview__learning">
              <h2 className="mission-overview__title">Leren in de praktijk</h2>
              <p className="mission-overview__description">
                In masterclasses, workshops, coaching en intervisie toets je
                nieuwe kennis en perspectieven aan wat er speelt in je eigen
                praktijk.
              </p>
            </div>
            <img
              src="/wstf/images/about/WSTF-Jeroen-LSO-2025.jpeg"
              alt="Leren in de praktijk"
              className="mission-overview__image"
            />
            <div className="mission-overview__vision">
              <h2 className="mission-overview__title">Missie & visie</h2>
              <div className="mission-overview__stack">
                <div className="mission-card">
                  <h3 className="mission-card__title">Onze missie</h3>
                  <p className="mission-card__description">
                    Wij helpen sociaal ondernemers en andere impactmakers om
                    duurzame organisaties te bouwen, verandering te leiden en
                    hun maatschappelijke impact te vergroten.
                  </p>
                </div>
                <div className="mission-card">
                  <h3 className="mission-card__title">Onze visie</h3>
                  <p className="mission-card__description">
                    Wij geloven in een leven lang leren voor impactmakers. Want
                    zij zijn degenen die positieve verandering realiseren en
                    maatschappelijke waarde creëren. Door te investeren in hun
                    ontwikkeling, investeren we in de impact die nodig is voor
                    een toekomstbestendige economie.
                    <br />
                    <br />
                    Investeer in de mens achter de impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta">
        <div className="cta__container">
          <h2 className="cta__title">Ontdek onze programma's</h2>
          <p className="cta__description">
            Vind het programma dat past bij jouw ambities en bouw mee aan de
            toekomst.
          </p>
          <Link className="cta__button" href={`${base}/programmas`}>
            {" "}
            <span className="cta__button-text"> Ontdek programma's </span>{" "}
          </Link>
        </div>
      </section>
      <div
        className="team-bio-popup"
        id="nicoleBioPopup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nicoleBioPopupName"
        aria-hidden="true"
      >
        <div className="team-bio-popup__overlay"></div>
        <div className="team-bio-popup__dialog">
          <button
            className="team-bio-popup__close"
            type="button"
            aria-label="Close Nicole Verhoeven profile"
          >
            {" "}
            <X aria-hidden="true" />{" "}
          </button>
          <div className="team-bio-popup__image-wrapper">
            <img
              className="team-bio-popup__image"
              src="/wstf/images/team/Nicole%20Verhoeven.png"
              alt="Nicole Verhoeven"
            />
          </div>
          <div className="team-bio-popup__content">
            <p className="team-bio-popup__role">Oprichter & Directeur</p>
            <h2 className="team-bio-popup__name" id="nicoleBioPopupName">
              Nicole Verhoeven
            </h2>
            <div className="team-bio-popup__bio">
              <p>
                Nicole Verhoeven is sociaal ondernemer en oprichter van We Shape
                the Future. Al vijftien jaar speelt zij een leidende rol in de
                ontwikkeling van executive education voor sociaal ondernemers in
                Nederland.
              </p>
              <p>
                Ze heeft van nature het vermogen om vooruit te kijken,
                maatschappelijke ontwikkelingen vroeg te signaleren en richting
                te geven aan wat er nodig is — en dit te vertalen naar
                vernieuwende concepten en programma’s.
              </p>
              <p>
                Haar kracht ligt in het creëren van programma’s waarin
                academische kennis, ondernemerschap en persoonlijke ontwikkeling
                samenkomen — en die deelnemers uitdagen om scherpe keuzes te
                maken en vanuit een heldere strategie verder te bouwen.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="team-bio-popup"
        id="nielsBioPopup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nielsBioPopupName"
        aria-hidden="true"
      >
        <div className="team-bio-popup__overlay"></div>
        <div className="team-bio-popup__dialog">
          <button
            className="team-bio-popup__close"
            type="button"
            aria-label="Close Niels Bosma profile"
          >
            {" "}
            <X aria-hidden="true" />{" "}
          </button>
          <div className="team-bio-popup__image-wrapper">
            <img
              className="team-bio-popup__image"
              src="/wstf/images/team/WSTF-team-Niels-Bosma.jpg"
              alt="Niels Bosma"
            />
          </div>
          <div className="team-bio-popup__content">
            <p className="team-bio-popup__role">
              Academisch Directeur We Shape the Future, Hoogleraar Sociaal
              Ondernemerschap, Universiteit Utrecht
            </p>
            <h2 className="team-bio-popup__name" id="nielsBioPopupName">
              Niels Bosma
            </h2>
            <div className="team-bio-popup__bio">
              <p>
                Niels Bosma is hoogleraar Sociaal Ondernemerschap aan de
                Universiteit Utrecht en speelt een leidende rol in de
                ontwikkeling van het vakgebied sociaal ondernemerschap in
                Nederland.
              </p>
              <p>
                Wat Niels drijft, is het verbinden van academische kennis met
                mensen en organisaties die werken aan daadwerkelijke
                verandering. Hij heeft bijgedragen aan verschillende academische
                initiatieven en blijft tegelijkertijd nauw verbonden met de
                praktijk, onder andere vanuit zijn rol in de adviescommissie van
                FNO Impact door Groei.
              </p>
              <p>
                Binnen de executive programma’s van We Shape the Future brengt
                hij deze perspectieven samen. Hij combineert wetenschappelijk
                onderzoek, praktijkervaring en de inzichten van deelnemers om
                academische kennis naar de praktijk te vertalen en nieuwe
                perspectieven op maatschappelijke verandering te verkennen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
