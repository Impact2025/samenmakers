"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PROGRAMS, siteHref } from "./site-config";
import { useSitePopups } from "./site-popups";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/over-ons", label: "Over ons" },
  { href: "/alumni", label: "Alumni" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
] as const;

function LangMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefix = variant === "desktop" ? "lang" : "mobile-lang";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={cn(`${prefix}-dropdown`, open && "is-open")}>
      <button
        className={`${prefix}-switcher`}
        type="button"
        aria-expanded={open}
        aria-label="Select Language"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`${prefix}-switcher__flag`}
          src="/wstf/images/flag-dutch.png"
          alt="NL"
        />
        <span className={`${prefix}-switcher__label`}>
          <span>Nl</span>
          <ChevronDown />
        </span>
      </button>
      <ul className={`${prefix}-dropdown__menu`}>
        <li>
          <a href="?lang=nl" className="lang-dropdown__link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wstf/images/flag-dutch.png" alt="Dutch" />
            <span>Nederlands</span>
          </a>
        </li>
        <li>
          <a href="?lang=en" className="lang-dropdown__link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wstf/images/uk-flag.png" alt="English" />
            <span>English</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const { openApply, openCollab: openCollabPopup } = useSitePopups();

  const closeMenu = () => {
    if (!menuOpen) return;
    setMenuOpen(false);
    setClosing(true);
    window.setTimeout(() => setClosing(false), 400);
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1200) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const openCollab = () => {
    closeMenu();
    openCollabPopup();
  };

  return (
    <header>
      <nav className="navbar" aria-label="Primary Navigation">
        <div className="navbar__brand">
          <Link
            href={siteHref("")}
            className="navbar__brand-link"
            aria-label="We Shape The Future home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="navbar__logo navbar__logo--desktop"
              src="/wstf/images/WSTF-logo.svg"
              alt="We Shape The Future"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="navbar__logo navbar__logo--mobile"
              src="/wstf/images/WSTF-logo-mobile.svg"
              alt="We Shape The Future"
            />
          </Link>
        </div>

        <div className="navbar__content">
          <ul className="navbar__menu">
            <li className="navbar__dropdown">
              <button
                className="navbar__dropdown-toggle"
                type="button"
                aria-expanded="false"
              >
                <span>
                  <Link
                    className="navbar__dropdown-toggle"
                    href={siteHref("/programmas")}
                  >
                    Programma&apos;s
                  </Link>
                </span>
                <ChevronDown />
              </button>
              <ul className="navbar__dropdown-menu">
                {PROGRAMS.map((p) => (
                  <li key={p.href}>
                    <Link href={siteHref(p.href)}>{p.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={siteHref(n.href)} className="navbar__link">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__actions">
            <div className="navbar__action-group">
              <button className="submit-bt" type="button" onClick={openApply}>
                Meld je aan
              </button>
              <button
                className="secondary-bt"
                type="button"
                aria-haspopup="dialog"
                onClick={openCollab}
              >
                Samenwerken
              </button>
            </div>
            <LangMenu variant="desktop" />
          </div>
        </div>

        <div
          className="mobile-lang-dropdown-wrapper"
          style={{ display: "contents" }}
        >
          <LangMenu variant="mobile" />
        </div>

        <button
          className={cn("navbar__hamburger", menuOpen && "is-active")}
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        >
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
        </button>
      </nav>

      <div
        className={cn(
          "mobile-menu",
          menuOpen && "is-open",
          closing && "is-closing",
        )}
        id="mobileMenu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__overlay" onClick={closeMenu} />
        <div className="mobile-menu__panel">
          <ul className="mobile-menu__list">
            <li
              className={cn(
                "mobile-menu__item mobile-menu__dropdown",
                mobileProgramsOpen && "is-open",
              )}
            >
              <button
                className="mobile-menu__dropdown-toggle"
                type="button"
                aria-expanded={mobileProgramsOpen}
                onClick={() => setMobileProgramsOpen((o) => !o)}
              >
                <span>
                  <Link
                    href={siteHref("/programmas")}
                    className="mobile-menu__link"
                    onClick={closeMenu}
                  >
                    Programma&apos;s
                  </Link>
                </span>
                <ChevronDown />
              </button>
              <ul className="mobile-menu__submenu">
                {PROGRAMS.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={siteHref(p.href)}
                      className="mobile-menu__link"
                      onClick={closeMenu}
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {NAV.map((n) => (
              <li key={n.href} className="mobile-menu__item">
                <Link
                  href={siteHref(n.href)}
                  className="mobile-menu__link"
                  onClick={closeMenu}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-menu__footer">
            <button
              className="mobile-menu__button"
              type="button"
              onClick={() => {
                closeMenu();
                openApply();
              }}
            >
              Meld je aan
            </button>
            <button
              className="mobile-menu__button"
              type="button"
              aria-haspopup="dialog"
              onClick={openCollab}
            >
              Samenwerken
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
