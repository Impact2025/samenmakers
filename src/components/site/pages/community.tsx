/* eslint-disable @next/next/no-img-element */
// Gegenereerd uit community.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { UpcomingEvents } from "@/components/site/upcoming-events";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Community | We Shape the Future",
  description: "",
};

export function CommunityContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Community</h1>
            <h2 className="page-hero__subtitle">
              We Shape the Future Community
            </h2>
          </div>
          <p className="page-hero__description">
            Voor en door sociaal ondernemers en changemakers die willen blijven
            leren, delen en verdiepen, en die weten hoeveel sterker je staat als
            je dat samen doet.
          </p>
        </div>
      </section>
      <section
        className="hero"
        data-hero
        data-autoplay="true"
        data-interval="5000"
      >
        <div className="hero__slider">
          <article
            className="hero__slide hero__slide--active"
            data-hero-slide
            data-image="/wstf/images/community/FInale%20LSO%202025.jpg"
          >
            <div className="hero__content">
              <h1 className="hero__title">
                Leren is een
                <br />
                levenslange reis
              </h1>
              <p className="hero__description">
                Workshops • Masterclasses • Netwerken • Gedeelde ervaringen
              </p>
            </div>
          </article>
        </div>
        <div
          className="hero__pagination"
          data-hero-pagination
          aria-label="Hero dia’s"
        ></div>
      </section>
      <section className="featured-event">
        <div className="featured-event__container">
          <h2 className="featured-event__title">Uitgelicht evenement</h2>
          <div className="featured-event__content">
            <div
              className="featured-event__image"
              style={{
                backgroundImage:
                  "url('https://weshapethefuture.nl/images/community/Reunie\\ diner\\ .jpg')",
              }}
            >
              <div className="featured-event__badge">Reünie november</div>
            </div>
            <p className="featured-event__description">
              Ontmoet alumni, deelnemers, docenten en partners tijdens de
              jaarlijkse communitybijeenkomst. Een dag om ideeën en ervaringen
              uit te wisselen, van elkaar te leren en nieuwe verbindingen te
              leggen.
            </p>
          </div>
        </div>
      </section>
      <section id="events">
        <UpcomingEvents />
      </section>
      <section className="community-grid">
        <div className="community-grid__container">
          <div className="community-card card-small-left-1">
            <img
              className="community-card__image"
              src="/wstf/images/community/Groepje%202016%20met%20Floris.JPG"
              alt="Elk gesprek telt"
            />
            <h3 className="community-card__title">Elk gesprek telt</h3>
          </div>
          <div className="community-card card-small-left-2">
            <img
              className="community-card__image"
              src="/wstf/images/community/Certificaatuitreiking%20LSO%202021%20copy.jpg"
              alt="Ervaringen delen"
            />
            <h3 className="community-card__title">Ervaringen delen</h3>
          </div>
          <div className="community-card card-tall-right">
            <img
              className="community-card__image"
              src="/wstf/images/community/Model%20LSO%202025%20Steffie%20.jpeg"
              alt="Leren door te doen"
            />
            <h3 className="community-card__title">Leren door te doen</h3>
          </div>
          <div className="community-card card-wide-left">
            <img
              className="community-card__image"
              src="/wstf/images/community/Groep%202016%20bij%20EY.JPG"
              alt="Samen impact maken"
            />
            <h3 className="community-card__title">Samen impact maken</h3>
          </div>
          <div className="community-card card-small-right">
            <img
              className="community-card__image"
              src="/wstf/images/community/Hidde%20en%20Antoinette%20LSI.jpeg"
              alt="Nieuwe perspectieven"
            />
            <h3 className="community-card__title">Nieuwe perspectieven</h3>
          </div>
          <div className="community-card card-small-left-3">
            <img
              className="community-card__image"
              src="/wstf/images/community/Esther%20en%20Bartel%202025.jpeg"
              alt="Geïnspireerd door anderen"
            />
            <h3 className="community-card__title">Geïnspireerd door anderen</h3>
          </div>
          <div className="community-card card-wide-right">
            <img
              className="community-card__image"
              src="/wstf/images/community/Groepsfoto%202022%20kleur%20filter.jpg"
              alt="Blijvende verbindingen"
            />
            <h3 className="community-card__title">Blijvende verbindingen</h3>
          </div>
          <div className="community-card card-full-hero">
            <img
              className="community-card__image"
              src="/wstf/images/community/LSO%20Advanced%20Oxford%20trip%202018.jpeg"
              alt="Samen blijven groeien"
            />
            <h3 className="community-card__title">Samen blijven groeien</h3>
            <p className="community-card__caption">
              Sociaal ondernemen hoef je niet alleen te doen. Ook na het
              programma blijf je onderdeel van een groep waarin je ervaringen
              deelt, elkaar scherp houdt en samen de verdieping opzoekt.
            </p>
          </div>
        </div>
      </section>
      <section className="next-step-section">
        <div className="next-step-section__container">
          <div className="next-step-section__header">
            <h2 className="next-step-section__title">
              Voor elkaar. Door elkaar. En mét elkaar.
            </h2>
            <p className="next-step-section__description">
              Ontdek de We Shape the Future Community en bekijk komende
              evenementen, masterclasses en activiteiten.
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
