/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit programs.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { ApplyButton } from "@/components/site/popup-buttons";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Programma's | We Shape the Future",
  description: "",
};

export function ProgrammasContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Onze Programma's</h1>
            <h2 className="page-hero__subtitle">We Shape the Future</h2>
          </div>
          <p className="page-hero__description">
            Of je nu bouwt aan een sociale onderneming, verandering realiseert
            binnen een organisatie of opnieuw richting wilt bepalen: onze
            programma’s geven je de kennis en begeleiding om je ambities in de
            praktijk te brengen.
          </p>
        </div>
      </section>
      <section className="programs">
        <div className="programs__container">
          <header className="section-header">
            <div>
              <p className="section-header__eyebrow">VIND JOUW PAD</p>
              <h2 className="section-header__title">
                Waar maak jij het verschil?
              </h2>
            </div>
            <p className="section-header__description">
              Verschillende rollen vragen om een andere aanpak. Kies het
              programma dat past bij jouw rol en ambitie.
            </p>
          </header>
          <div className="program-grid">
            <article className="program-card program-card--featured">
              <div className="program-card__image">
                <img
                  src="/wstf/images/programs/LSO/Certificaatuitreiking%20LSO%202021.jpg"
                  alt="Leergang Sociaal Ondernemen"
                />
              </div>
              <div className="program-card__content">
                <div className="program-card__meta">
                  <span>10 MAANDEN</span> <span>VOOR OPRICHTERS</span>
                </div>
                <h3 className="program-card__title">
                  Leergang Sociaal Ondernemen
                </h3>
                <p className="program-card__description">
                  Voor sociaal ondernemers die willen bouwen aan een sterke
                  organisatie, hun leiderschap willen ontwikkelen en hun
                  maatschappelijke impact willen vergroten.
                </p>
                <Link
                  href={`${base}/leergang-sociaal-ondernemen`}
                  className="program-card__link"
                >
                  {" "}
                  Ontdek programma <span aria-hidden="true">→</span>{" "}
                </Link>
              </div>
            </article>
            <article className="program-card">
              <div className="program-card__image">
                <img
                  src="/wstf/images/programs/LSI/Groepje%20buiten%20Lisan%20Gina%20Gwen%20en%20Hidde%20LSI%202025.jpeg"
                  alt="Leergang Social Intrapreneurship"
                />
              </div>
              <div className="program-card__content">
                <div className="program-card__meta">
                  <span>4 MAANDEN</span> <span>VOOR PROFESSIONALS</span>
                </div>
                <h3 className="program-card__title">
                  Leergang Social Intrapreneurship
                </h3>
                <p className="program-card__description">
                  Voor professionals die van binnenuit maatschappelijke
                  verandering willen realiseren, effectief willen omgaan met
                  weerstand en stakeholders willen meekrijgen.
                </p>
                <Link
                  href={`${base}/leergang-social-intrapreneurship`}
                  className="program-card__link"
                >
                  {" "}
                  Ontdek programma <span aria-hidden="true">→</span>{" "}
                </Link>
              </div>
            </article>
            <article className="program-card">
              <div className="program-card__image">
                <img
                  src="/wstf/images/programs/RYF/ryf-hero.png"
                  alt="Reshaping Your Future"
                />
              </div>
              <div className="program-card__content">
                <div className="program-card__meta">
                  <span>3 DAGEN</span> <span>OPRICHTERS & CHANGEMAKERS</span>
                </div>
                <h3 className="program-card__title">Reshaping Your Future</h3>
                <p className="program-card__description">
                  Neem afstand van de dagelijkse praktijk, hervind je focus en
                  krijg helder welke richting je op wilt én welke eerste stappen
                  daarbij horen.
                </p>
                <Link
                  href={`${base}/reshaping-your-future`}
                  className="program-card__link"
                >
                  {" "}
                  Ontdek programma <span aria-hidden="true">→</span>{" "}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="program-community">
        <div className="program-community__container">
          <div className="program-community__image">
            <img
              src="/wstf/images/community/moments/Groepsfoto%20deelnemers-geslaagd!%20LSO%202012%20copy.jpg"
              alt="Leren doe je samen."
            />
          </div>
          <div className="program-community__content">
            <p className="program-community__eyebrow">MEER DAN EEN PROGRAMMA</p>
            <h2 className="program-community__title">Leren doe je samen.</h2>
            <p className="program-community__description">
              Onze programma's brengen ondernemers, professionals, academici en
              changemakers samen. Ook na afloop blijven deelnemers via de
              WSTF-community met elkaar verbonden.
            </p>
            <Link
              href={`${base}/community`}
              className="program-community__link"
            >
              {" "}
              Ontdek onze community <span aria-hidden="true">→</span>{" "}
            </Link>
          </div>
        </div>
      </section>
      <section className="cta">
        <div className="cta__container">
          <h2 className="cta__title">Klaar om de volgende stap te zetten?</h2>
          <p className="cta__description">
            Ontdek welk programma past bij jouw rol en wat je wilt realiseren.
          </p>
          <ApplyButton className="submit-btn">Meld je nu aan</ApplyButton>
        </div>
      </section>
    </>
  );
}
