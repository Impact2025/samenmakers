import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PROGRAMS, siteHref } from "./site-config";

const DISCOVER = [
  { href: "/over-ons", label: "Over ons" },
  { href: "/community", label: "Community" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/privacybeleid", label: "Privacybeleid" },
  {
    href: "/annuleringsbeleid-evenementen",
    label: "Annuleringsbeleid - Evenementen",
  },
  { href: "/algemene-voorwaarden", label: "Algemene Voorwaarden" },
];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="footer__image"
              src="/wstf/images/WSTF-logo-verticle.png"
              alt="We Shape the Future logo"
            />
            <p className="footer__description">
              We Shape the Future is een initiatief van de LSO Foundation.
            </p>
          </div>

          <div className="footer__content">
            <nav className="footer__navigation" aria-label="Footer navigation">
              <div className="footer__column">
                <h3 className="footer__heading">Ontdek</h3>
                <ul className="footer__links">
                  {DISCOVER.map((l) => (
                    <li key={l.href}>
                      <Link className="footer__link" href={siteHref(l.href)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__column">
                <h3 className="footer__heading">Programma&apos;s</h3>
                <ul className="footer__links">
                  {PROGRAMS.map((l) => (
                    <li key={l.href}>
                      <Link className="footer__link" href={siteHref(l.href)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__column">
                <h3 className="footer__heading">Juridisch</h3>
                <ul className="footer__links">
                  {LEGAL.map((l) => (
                    <li key={l.href}>
                      <Link className="footer__link" href={siteHref(l.href)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__column">
                <h3 className="footer__heading">Verbind</h3>
                <ul className="footer__links">
                  <li>
                    <a
                      className="footer__link"
                      href="https://www.linkedin.com/company/we-shape-the-future/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </nav>

            <div className="footer__contact">
              <h3 className="footer__heading">Contact</h3>
              <address className="footer__contact-list">
                <a className="footer__contact-item" href="tel:+31851301176">
                  <span className="footer__contact-icon">
                    <Phone aria-hidden="true" />
                  </span>
                  <span className="footer__contact-text">
                    +31 (0)85 13 01 17 6
                  </span>
                </a>
                <div className="footer__divider" />
                <a
                  className="footer__contact-item"
                  href="mailto:info@weshapethefuture.nl"
                >
                  <span className="footer__contact-icon">
                    <Mail aria-hidden="true" />
                  </span>
                  <span className="footer__contact-text">
                    info@weshapethefuture.nl
                  </span>
                </a>
                <div className="footer__divider" />
                <div className="footer__contact-item">
                  <span className="footer__contact-icon">
                    <MapPin aria-hidden="true" />
                  </span>
                  <span className="footer__contact-text">
                    Van Eedenstraat 18
                    <br />
                    2012 EM Haarlem
                  </span>
                </div>
              </address>
            </div>
          </div>
        </div>

        <div className="footer__partners">
          <div className="footer__partner-group">
            <h3 className="footer__heading">Academische Partner</h3>
            <div className="footer__logos">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="footer__logo"
                src="/wstf/images/partners/WSTF-academic-partner.png"
                alt="Academic partner"
              />
            </div>
          </div>
          <div className="footer__partner-group">
            <h3 className="footer__heading">Partners</h3>
            <div className="footer__logos">
              {[1, 2, 3, 4, 5].map((n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={n}
                  className="footer__logo"
                  src={`/wstf/images/partners/WSTF-partner${n}.png`}
                  alt="Partner"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} We Shape the Future. Alle rechten
            voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
