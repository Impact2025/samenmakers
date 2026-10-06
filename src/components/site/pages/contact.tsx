/* eslint-disable @next/next/no-img-element */
// Gegenereerd uit contact.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import { Phone, Mail, MapPin } from "lucide-react";
import { UpcomingEvents } from "@/components/site/upcoming-events";
import { ContactMap } from "@/components/site/contact-map";
import { ContactFormShell } from "@/components/site/contact-form-shell";

export const meta = {
  title: "Contact | We Shape The Future",
  description: "",
};

export function ContactContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Contact</h1>
            <h2 className="page-hero__subtitle">Neem contact op</h2>
          </div>
          <p className="page-hero__description">
            Heb je een vraag over één van onze programma’s, de WSTF Community of
            een komend evenement? We horen graag van je.
          </p>
        </div>
      </section>
      <section className="contact-section">
        <div className="contact-section__container">
          <div className="contact-section__content">
            <div className="contact-details">
              <h2 className="contact-details__title">Contactgegevens</h2>
              <div className="contact-details__list">
                <div className="contact-item">
                  <div className="contact-item__icon">
                    <Phone aria-hidden="true" />
                  </div>
                  <p className="contact-item__text">+31 (0)85 13 01 17 6</p>
                </div>
                <div className="contact-divider"></div>
                <div className="contact-item">
                  <div className="contact-item__icon">
                    <Mail aria-hidden="true" />
                  </div>
                  <p className="contact-item__text">info@weshapethefuture.nl</p>
                </div>
                <div className="contact-divider"></div>
                <div className="contact-item">
                  <div className="contact-item__icon">
                    <MapPin aria-hidden="true" />
                  </div>
                  <p className="contact-item__text">
                    Van Eedenstraat 18
                    <br />
                    2012 EM Haarlem
                  </p>
                </div>
              </div>
            </div>
            <div className="contact-map">
              <ContactMap />
            </div>
          </div>
          <div className="contact-location-image">
            <img
              src="/wstf/images/loc.png"
              alt="We Shape The Future location"
            />
          </div>
        </div>
      </section>
      <section className="contact-form">
        <div className="contact-form__container">
          <div className="contact-form__header">
            <h2 className="contact-form__title">Contactformulier</h2>
            <p className="contact-form__description">
              Velden met een <span>*</span> zijn verplicht.
            </p>
          </div>
          <ContactFormShell className="contact-form__form" id="contactForm">
            <div className="form-group">
              <label className="form-label">
                {" "}
                Voornaam <span>*</span>{" "}
              </label>{" "}
              <input
                type="text"
                className="form-input"
                name="txtContactFirstName"
                id="txtContactFirstName"
                placeholder="Vul je voornaam in"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {" "}
                Achternaam <span>*</span>{" "}
              </label>{" "}
              <input
                type="text"
                className="form-input"
                name="txtContactLastName"
                id="txtContactLastName"
                placeholder="Vul je achternaam in"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {" "}
                E-mailadres <span>*</span>{" "}
              </label>{" "}
              <input
                type="email"
                className="form-input"
                name="txtContactEmail"
                id="txtContactEmail"
                placeholder="Vul je e-mailadres in"
              />
            </div>
            <div className="form-group">
              <label className="form-label"> Telefoonnummer </label>{" "}
              <input
                type="tel"
                className="form-input"
                name="txtContactPhoneNumber"
                id="txtContactPhoneNumber"
                placeholder="Vul je telefoonnummer in"
              />
            </div>
            <div className="form-group">
              <label className="form-label"> Organisatie </label>{" "}
              <input
                type="text"
                className="form-input"
                name="txtOrganization"
                id="txtOrganization"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {" "}
                Onderwerp <span>*</span>{" "}
              </label>{" "}
              <input
                type="text"
                className="form-input"
                name="txtSubject"
                id="txtSubject"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {" "}
                Bericht <span>*</span>{" "}
              </label>{" "}
              <textarea
                className="form-textarea"
                rows={8}
                name="txtMessage"
                id="txtMessage"
              ></textarea>
            </div>
            <input type="hidden" name="hdnProcess" defaultValue="1" />{" "}
            <button
              type="submit"
              className="contact-form__button"
              id="contactFormSubmitBtn"
            >
              {" "}
              <span className="btn-text">Versturen</span>{" "}
            </button>
          </ContactFormShell>
        </div>
      </section>
      <UpcomingEvents />
    </>
  );
}
