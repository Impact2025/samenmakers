"use client";

import { useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  title: React.ReactNode;
  description: string;
};

export function HeroSlider({
  slides,
  interval = 5000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [restart, setRestart] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      interval,
    );
    return () => window.clearInterval(t);
  }, [slides.length, interval, restart]);

  return (
    <section className="hero">
      <div className="hero__slider">
        {slides.map((s, i) => (
          <article
            key={i}
            className={`hero__slide${i === index ? "hero__slide--active" : ""}`}
            style={
              {
                "--hero-slide-image": `url("${s.image}")`,
              } as React.CSSProperties
            }
          >
            <div className="hero__content">
              {i === 0 ? (
                <h1 className="hero__title">{s.title}</h1>
              ) : (
                <h2 className="hero__title">{s.title}</h2>
              )}
              <p className="hero__description">{s.description}</p>
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="hero__pagination" aria-label="Hero slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero__pagination-dot${i === index ? "hero__pagination-dot--active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => {
                setIndex(i);
                setRestart((r) => r + 1);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
