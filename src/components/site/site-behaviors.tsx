"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Gedrag van de gegenereerde pagina's (teamfilter, bio-popups, carrousel,
 * community-mail). Dit is de omzetting van de losse scripts uit de oude site;
 * ze werken op de server-gerenderde markup via class-namen.
 */
export function SiteBehaviors() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const on = (
      target: Document | Window | HTMLElement,
      type: string,
      fn: (e: never) => void,
      opts?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() =>
        target.removeEventListener(type, fn as EventListener, opts),
      );
    };

    /* ---------- Teamfilter ---------- */
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      ".team-filter__button",
    );
    const cards = document.querySelectorAll<HTMLElement>(".team-card");
    const filterTeam = (category: string | undefined) => {
      cards.forEach((c) => {
        c.style.display = c.dataset.category === category ? "flex" : "none";
      });
    };
    buttons.forEach((b) =>
      on(b, "click", () => {
        document
          .querySelector(".team-filter__button--active")
          ?.classList.remove("team-filter__button--active");
        b.classList.add("team-filter__button--active");
        filterTeam(b.dataset.filter);
      }),
    );
    const active = document.querySelector<HTMLElement>(
      ".team-filter__button--active",
    );
    if (active) filterTeam(active.dataset.filter);

    /* ---------- Bio-popups ---------- */
    let activeTrigger: Element | null = null;
    let activePopup: HTMLElement | null = null;
    const openBio = (popup: HTMLElement, trigger: Element) => {
      activeTrigger = trigger;
      activePopup = popup;
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-team-bio-open");
      requestAnimationFrame(() =>
        popup.querySelector<HTMLElement>(".team-bio-popup__close")?.focus(),
      );
    };
    const closeBio = (popup: HTMLElement | null) => {
      if (!popup) return;
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      if (!document.querySelector(".team-bio-popup.is-open"))
        document.body.classList.remove("is-team-bio-open");
      (activeTrigger as HTMLElement | null)?.focus();
      activeTrigger = null;
      activePopup = null;
    };
    const popupFor = (card: Element) => {
      const id = card.getAttribute("aria-controls");
      return id ? document.getElementById(id) : null;
    };
    on(document, "click", (e: MouseEvent) => {
      const t = e.target as Element;
      const card = t.closest('.team-card[aria-haspopup="dialog"]');
      if (card) {
        const popup = popupFor(card);
        if (popup) {
          e.preventDefault();
          openBio(popup, card);
          return;
        }
      }
      const close = t.closest(".team-bio-popup__close");
      if (close) {
        closeBio(close.closest<HTMLElement>(".team-bio-popup"));
        return;
      }
      const overlay = t.closest(".team-bio-popup__overlay");
      if (overlay) closeBio(overlay.closest<HTMLElement>(".team-bio-popup"));
    });
    on(document, "keydown", (e: KeyboardEvent) => {
      const card = (e.target as Element).closest?.(
        '.team-card[aria-haspopup="dialog"]',
      );
      if (card && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        const popup = popupFor(card);
        if (popup) openBio(popup, card);
        return;
      }
      if (e.key === "Escape" && activePopup) closeBio(activePopup);
    });

    /* ---------- Carrousel ---------- */
    const carousel = document.querySelector<HTMLElement>(
      ".experience-carousel",
    );
    if (carousel) {
      const track = carousel.querySelector<HTMLElement>(
        ".experience-carousel__track",
      );
      const slides = Array.from(
        carousel.querySelectorAll<HTMLElement>(".experience-card"),
      );
      const prev = carousel.querySelector<HTMLButtonElement>(
        ".experience-carousel__button--prev",
      );
      const next = carousel.querySelector<HTMLButtonElement>(
        ".experience-carousel__button--next",
      );
      if (track && slides.length && prev && next) {
        let index = 0;
        let wheelLock = false;
        let dragging = false;
        let dragStart = 0;
        let dragDist = 0;
        let touchStart = 0;
        const update = () => {
          const w = slides[0]!.getBoundingClientRect().width;
          const gap = parseFloat(getComputedStyle(track).gap) || 0;
          track.style.transform = `translate3d(-${index * (w + gap)}px, 0, 0)`;
          prev.disabled = index === 0;
          next.disabled = index >= slides.length - 1;
        };
        const go = (delta: number) => {
          const n = Math.min(slides.length - 1, Math.max(0, index + delta));
          if (n !== index) {
            index = n;
            update();
          }
        };
        on(next, "click", () => go(1));
        on(prev, "click", () => go(-1));
        on(
          track,
          "wheel",
          (e: WheelEvent) => {
            if (Math.abs(e.deltaX) < 10 || wheelLock) return;
            e.preventDefault();
            wheelLock = true;
            go(e.deltaX > 0 ? 1 : -1);
            window.setTimeout(() => (wheelLock = false), 350);
          },
          { passive: false },
        );
        on(track, "mousedown", (e: MouseEvent) => {
          dragging = true;
          dragStart = e.clientX;
          dragDist = 0;
          track.classList.add("is-dragging");
          track.style.cursor = "grabbing";
          e.preventDefault();
        });
        on(window, "mousemove", (e: MouseEvent) => {
          if (dragging) dragDist = e.clientX - dragStart;
        });
        on(window, "mouseup", () => {
          if (!dragging) return;
          dragging = false;
          track.classList.remove("is-dragging");
          track.style.cursor = "";
          if (Math.abs(dragDist) >= 50) go(dragDist < 0 ? 1 : -1);
        });
        on(
          track,
          "touchstart",
          (e: TouchEvent) => (touchStart = e.touches[0]!.clientX),
          {
            passive: true,
          },
        );
        on(track, "touchend", (e: TouchEvent) => {
          const d = e.changedTouches[0]!.clientX - touchStart;
          if (Math.abs(d) >= 50) go(d < 0 ? 1 : -1);
        });
        on(track, "dragstart", (e: Event) => e.preventDefault());
        on(window, "resize", update);
        update();
      }
    }

    /* ---------- Meer verhalen (alumni) ---------- */
    const storiesGrid = document.querySelector<HTMLElement>(
      ".more-stories__grid",
    );
    const storiesPrev = document.querySelector<HTMLButtonElement>(
      ".more-stories__button--prev",
    );
    const storiesNext = document.querySelector<HTMLButtonElement>(
      ".more-stories__button--next",
    );
    if (storiesGrid && storiesPrev && storiesNext) {
      const step = () => {
        const card =
          storiesGrid.querySelector<HTMLElement>(".story-card-small");
        const gap = parseFloat(getComputedStyle(storiesGrid).gap) || 32;
        return card ? card.offsetWidth + gap : 312;
      };
      const sync = () => {
        storiesPrev.disabled = storiesGrid.scrollLeft <= 0;
        storiesNext.disabled =
          storiesGrid.scrollLeft + storiesGrid.clientWidth >=
          storiesGrid.scrollWidth - 2;
      };
      on(storiesNext, "click", () =>
        storiesGrid.scrollBy({ left: step(), behavior: "smooth" }),
      );
      on(storiesPrev, "click", () =>
        storiesGrid.scrollBy({ left: -step(), behavior: "smooth" }),
      );
      on(storiesGrid, "scroll", sync);
      on(window, "resize", sync);
      sync();
    }

    /* ---------- Community-mail ---------- */
    const joinLink = document.querySelector<HTMLAnchorElement>(
      "[data-community-email]",
    );
    if (joinLink) {
      on(joinLink, "click", (e: MouseEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(
          "Meer informatie over de We Shape the Future Community",
        );
        const body = encodeURIComponent(
          "Hallo We Shape the Future,\n\nIk sluit graag aan bij de We Shape the Future community! Ik hoor graag meer over de community en hoe ik betrokken kan worden.\n\nHartelijke groet,\n",
        );
        window.location.href = `mailto:info@weshapethefuture.nl?subject=${subject}&body=${body}`;
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      document.body.classList.remove("is-team-bio-open");
    };
  }, [pathname]);

  return null;
}
