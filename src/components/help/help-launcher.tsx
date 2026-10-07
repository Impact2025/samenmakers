"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  Compass,
  MessageCircleQuestion,
  X,
} from "lucide-react";
import { HELP, type HelpAudience } from "@/lib/help-content";
import { cn } from "@/lib/utils";

/** Andere onderdelen (bijv. de helppagina) starten de rondleiding met dit event. */
export const START_TOUR_EVENT = "wstf:start-tour";

const storageKey = (audience: string, userId: string) =>
  `wstf-tour-v1:${userId}:${audience}`;

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* geen opslag beschikbaar: dan tonen we de tour gewoon bij elk bezoek niet automatisch */
  }
}

export function HelpLauncher({
  audience,
  userId,
}: {
  audience: Exclude<HelpAudience, "beheerder">;
  userId: string;
}) {
  const section = HELP[audience];
  const steps = section.tour;
  const key = storageKey(audience, userId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [step, setStep] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const startTour = useCallback(() => {
    setMenuOpen(false);
    setStep(0);
    setTourOpen(true);
  }, []);

  const finishTour = useCallback(() => {
    write(key, "done");
    setTourOpen(false);
  }, [key]);

  // Eerste keer: de rondleiding opent vanzelf (met een korte pauze zodat de pagina eerst laadt).
  useEffect(() => {
    if (steps.length === 0 || read(key)) return;
    const t = window.setTimeout(startTour, 900);
    return () => window.clearTimeout(t);
  }, [key, steps.length, startTour]);

  useEffect(() => {
    window.addEventListener(START_TOUR_EVENT, startTour);
    return () => window.removeEventListener(START_TOUR_EVENT, startTour);
  }, [startTour]);

  useEffect(() => {
    if (!menuOpen && !tourOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (tourOpen) finishTour();
      else setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      )
        setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen, tourOpen, finishTour]);

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed right-4 bottom-24 z-40 lg:right-6 lg:bottom-6"
      >
        {menuOpen && (
          <div
            role="menu"
            className="bg-surface-container-lowest shadow-floating absolute right-0 bottom-14 w-60 rounded-2xl p-2"
          >
            {steps.length > 0 && (
              <button
                type="button"
                role="menuitem"
                onClick={startTour}
                className="text-label-lg text-on-surface hover:bg-surface-container-low flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
              >
                <Compass
                  size={18}
                  className="text-primary-container"
                  aria-hidden
                />
                Rondleiding
              </button>
            )}
            <Link
              href="/help"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="text-label-lg text-on-surface hover:bg-surface-container-low flex items-center gap-3 rounded-xl px-3 py-2.5"
            >
              <MessageCircleQuestion
                size={18}
                className="text-primary-container"
                aria-hidden
              />
              Veelgestelde vragen
            </Link>
          </div>
        )}
        <button
          type="button"
          aria-label="Hulp"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="bg-primary-container text-on-primary shadow-cta flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:brightness-105 active:scale-95"
        >
          {menuOpen ? <X size={22} /> : <CircleHelp size={24} />}
        </button>
      </div>

      {tourOpen && current && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
        >
          <div
            className="bg-on-surface/50 absolute inset-0"
            onClick={finishTour}
            aria-hidden
          />
          <div className="bg-surface-container-lowest shadow-floating relative w-full max-w-md rounded-3xl p-6">
            <button
              type="button"
              onClick={finishTour}
              aria-label="Rondleiding sluiten"
              className="text-secondary hover:text-on-surface absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full"
            >
              <X size={18} />
            </button>

            <p className="text-label-sm text-primary-container mb-2 uppercase">
              Stap {step + 1} van {steps.length}
            </p>
            <h2
              id="tour-title"
              className="text-headline-md text-on-surface mb-2"
            >
              {current.title}
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-5">
              {current.body}
            </p>

            {current.href && (
              <Link
                href={current.href}
                onClick={finishTour}
                className="text-label-lg text-primary-container mb-5 inline-flex items-center gap-1 hover:underline"
              >
                {current.cta ?? "Bekijk"} <ArrowRight size={16} aria-hidden />
              </Link>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5" aria-hidden>
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === step
                        ? "bg-primary-container w-5"
                        : "bg-surface-container-high w-2",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={finishTour}
                    className="text-label-lg text-secondary hover:text-on-surface px-3 py-2"
                  >
                    Overslaan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-label-lg text-secondary hover:text-on-surface px-3 py-2"
                  >
                    Terug
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (last ? finishTour() : setStep((s) => s + 1))}
                  className="bg-primary-container text-on-primary text-label-lg shadow-cta rounded-full px-5 py-2"
                >
                  {last ? "Aan de slag" : "Volgende"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
