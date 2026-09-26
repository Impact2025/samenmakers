import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRO_FEATURES, SECTOREN } from "@/lib/constants";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "We Shape the Future — Vind je medemissie-ondernemer",
  description:
    "Het platform waar purpose-driven ondernemers elkaar vinden, kennis delen en samenwerken aan een betere wereld.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="hairline-b fixed top-0 z-50 w-full bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-on-surface text-lg font-extrabold tracking-tighter">
            WE SHAPE THE FUTURE
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/inloggen"
              className="text-label-md text-secondary hover:text-on-surface transition-colors"
            >
              INLOGGEN
            </Link>
            <Link href="/aanmelden">
              <Button variant="primary">Begin gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="max-w-2xl">
          <Badge variant="default" className="mb-6">
            Purpose-driven netwerk
          </Badge>
          <h1 className="text-display-lg text-on-surface mb-6">
            Vind je medemissie-ondernemer
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
            We Shape the Future verbindt impact-ondernemers die samen meer
            bereiken. Match op missie, deel kennis en bouw aan een betere
            wereld.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/aanmelden">
              <Button variant="primary" className="px-8 py-4">
                Start gratis <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/inloggen">
              <Button variant="secondary" className="px-8 py-4">
                Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-container-low hairline-t hairline-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-label-md text-secondary mb-3">HOE HET WERKT</p>
          <h2 className="text-headline-lg text-on-surface mb-12 max-w-md">
            Drie stappen naar jouw medemissie-ondernemer
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Maak je profiel",
                body: "Vertel over je missie, sector, fase en wat je zoekt in een samenwerking.",
              },
              {
                step: "02",
                title: "Match op missie",
                body: "Swipe door profielen van gelijkgestemde ondernemers. Bij wederzijdse interesse: een match!",
              },
              {
                step: "03",
                title: "Bouw samen",
                body: "Chat, ontmoet elkaar op events en deel kennis in de community.",
              },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <p className="text-secondary/30 mb-4 text-4xl font-extrabold">
                  {step}
                </p>
                <h3 className="text-on-surface mb-2 text-lg font-extrabold">
                  {title}
                </h3>
                <p className="text-body-md text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-label-md text-secondary mb-3">SECTOREN</p>
          <h2 className="text-headline-lg text-on-surface mb-8">
            Van circulaire economie tot social impact
          </h2>
          <div className="flex flex-wrap gap-2">
            {SECTOREN.map((s) => (
              <span
                key={s}
                className="border-hairline text-on-surface-variant hover:border-on-surface hover:text-on-surface border px-4 py-2 text-sm font-medium transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface-container-low hairline-t hairline-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-label-md text-secondary mb-3">ABONNEMENTEN</p>
          <h2 className="text-headline-lg text-on-surface mb-12">
            Transparante prijzen
          </h2>
          <div className="grid max-w-2xl gap-6 md:grid-cols-2">
            {/* Basis */}
            <div className="border-hairline border bg-white p-8">
              <p className="text-label-md text-secondary mb-2">BASIS</p>
              <p className="text-on-surface mb-1 text-4xl font-extrabold">
                Gratis
              </p>
              <p className="text-body-md text-secondary mb-6">Altijd</p>
              <ul className="mb-8 space-y-3">
                {[
                  "Profiel aanmaken",
                  "20 swipes per dag",
                  "Chatten met matches",
                  "Events bekijken",
                  "Kennisbank lezen",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-body-md text-on-surface flex items-center gap-2"
                  >
                    <CheckCircle
                      size={14}
                      className="text-secondary shrink-0"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/aanmelden">
                <Button variant="secondary" className="w-full">
                  Begin gratis
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="border-primary relative border-2 bg-white p-8">
              <Badge variant="primary" className="absolute top-4 right-4">
                AANBEVOLEN
              </Badge>
              <p className="text-label-md text-primary mb-2">PRO</p>
              <div className="mb-1 flex items-baseline gap-1">
                <p className="text-on-surface text-4xl font-extrabold">€9</p>
                <p className="text-on-surface-variant">/maand</p>
              </div>
              <p className="text-body-md text-secondary mb-6">
                Maandelijks opzegbaar
              </p>
              <ul className="mb-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="text-body-md text-on-surface flex items-center gap-2"
                  >
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/aanmelden">
                <Button variant="primary" className="w-full">
                  Start Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-on-surface text-on-primary px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-headline-lg mb-4">
            Klaar om je medemissie-ondernemer te vinden?
          </h2>
          <p className="text-body-md mb-8 text-white/70">
            Sluit je aan bij honderden impact-ondernemers die al samenwerken via
            We Shape the Future.
          </p>
          <Link href="/aanmelden">
            <button className="text-on-surface text-label-md bg-white px-10 py-4 font-bold transition-colors hover:bg-white/90">
              GRATIS AANMELDEN
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="hairline-t px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span className="text-on-surface text-sm font-extrabold">
            WE SHAPE THE FUTURE
          </span>
          <div className="text-secondary flex gap-6 text-xs">
            <Link
              href="/over"
              className="hover:text-on-surface transition-colors"
            >
              Over ons
            </Link>
            <Link
              href="/privacy"
              className="hover:text-on-surface transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/voorwaarden"
              className="hover:text-on-surface transition-colors"
            >
              Voorwaarden
            </Link>
          </div>
          <p className="text-secondary text-xs">
            © {new Date().getFullYear()} We Shape the Future
          </p>
        </div>
      </footer>
    </div>
  );
}
