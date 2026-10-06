"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface SliderEvent {
  id: string;
  href: string;
  image: string | null;
  date: string;
  title: string;
  description: string;
}

const AUTOPLAY_MS = 3000;

export function UpcomingEventsSlider({ events }: { events: SliderEvent[] }) {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [restart, setRestart] = useState(0);
  const slidesRef = useRef<HTMLDivElement>(null);

  // Hoeveel kaarten kunnen er maximaal "voorbij" geschoven worden voordat het einde in beeld is.
  const maxIndex = () => {
    const slides = slidesRef.current;
    const viewport = slides?.parentElement;
    if (!slides || !viewport) return 0;
    return slides.scrollWidth - viewport.clientWidth > 0
      ? events.length - 1
      : 0;
  };

  const goTo = (i: number) => {
    const slides = slidesRef.current;
    const viewport = slides?.parentElement;
    if (!slides || !viewport) return;
    const clamped = Math.max(0, Math.min(i, maxIndex()));
    const card = slides.children[clamped] as HTMLElement | undefined;
    const max = Math.max(0, slides.scrollWidth - viewport.clientWidth);
    setIndex(clamped);
    setOffset(Math.min(Math.max(0, card?.offsetLeft ?? 0), max));
  };

  useEffect(() => {
    if (events.length <= 1) return;
    const t = window.setInterval(() => {
      const max = maxIndex();
      if (max <= 0) return;
      goTo(index >= max ? 0 : index + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, restart, events.length]);

  useEffect(() => {
    const onResize = () => goTo(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <section className="upcoming-events">
      <div className="upcoming-events__container">
        <div className="upcoming-events__header">
          <h2 className="upcoming-events__title">AANKOMENDE EVENEMENTEN</h2>
          <p className="upcoming-events__intro">
            Blijf verbonden via onze komende communityactiviteiten.
          </p>
        </div>

        <div className="upcoming-events__slider">
          <div
            className="upcoming-events__slides"
            ref={slidesRef}
            style={{
              transform: `translate3d(-${offset}px, 0, 0)`,
              transition: "transform 0.4s ease",
            }}
          >
            {events.map((e) => (
              <article key={e.id} className="event-card">
                <Link
                  href={e.href}
                  className="event-card__email event-card__email-link"
                >
                  {e.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="event-card__image"
                      src={e.image}
                      alt={e.title}
                    />
                  ) : (
                    <div
                      className="event-card__image"
                      aria-hidden="true"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-deep-petrol), var(--pink-600))",
                      }}
                    />
                  )}
                  <div className="event-card__content">
                    <div className="event-card__date">{e.date}</div>
                    <div className="event-card__details">
                      <h3 className="event-card__title">{e.title}</h3>
                      <p className="event-card__description">{e.description}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {events.length > 1 && (
          <div className="upcoming-events__pagination">
            {events.map((e, i) => (
              <button
                key={e.id}
                className={`upcoming-events__dot${i === index ? "upcoming-events__dot--active" : ""}`}
                type="button"
                aria-label={`Ga naar evenement ${i + 1}`}
                aria-current={i === index}
                onClick={() => {
                  goTo(i);
                  setRestart((r) => r + 1);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
