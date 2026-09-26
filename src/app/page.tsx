import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Handshake,
  MessagesSquare,
  Sparkles,
  UserPlus,
  CalendarDays,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { PRO_FEATURES, SECTOREN } from "@/lib/constants";

export const metadata: Metadata = {
  title: "We Shape the Future — Vind je medemissie-ondernemer",
  description:
    "Het platform waar purpose-driven ondernemers elkaar vinden, kennis delen en samenwerken aan een betere wereld.",
};

const steps = [
  {
    icon: UserPlus,
    title: "Maak je profiel",
    body: "Vertel over je missie, sector, fase en wat je zoekt in een samenwerking.",
  },
  {
    icon: Handshake,
    title: "Match op missie",
    body: "Swipe door profielen van gelijkgestemde ondernemers. Bij wederzijdse interesse: een match!",
  },
  {
    icon: MessagesSquare,
    title: "Bouw samen",
    body: "Chat, ontmoet elkaar op events en deel kennis in de community.",
  },
];

const highlights = [
  { icon: Handshake, label: "Matching op missie" },
  { icon: CalendarDays, label: "Evenementen & sessies" },
  { icon: GraduationCap, label: "Leertrajecten" },
  { icon: MessagesSquare, label: "Community & kennisbank" },
];

export default function HomePage() {
  return (
    <div className="bg-surface min-h-screen">
      <TopBar />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-28 pb-16 sm:pt-36">
        <div className="bg-primary-container/10 pointer-events-none absolute -top-24 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl" />
        <div className="bg-tertiary/10 pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex max-w-2xl flex-col gap-5">
            <span className="bg-primary-fixed text-label-sm text-on-primary-fixed inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 uppercase">
              <span className="bg-primary-container h-1.5 w-1.5 animate-pulse rounded-full" />
              Purpose-driven netwerk
            </span>
            <h1 className="text-display-lg text-on-surface sm:text-[56px] sm:leading-[64px]">
              Vind je <span className="text-primary-container">medemissie</span>
              -ondernemer
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              We Shape the Future verbindt impact-ondernemers die samen meer
              bereiken. Match op missie, deel kennis en bouw aan een betere
              wereld.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/aanmelden"
                className={buttonClasses("primary", "lg", "px-8")}
              >
                Start gratis <ArrowRight size={18} />
              </Link>
              <Link
                href="/inloggen"
                className={buttonClasses("secondary", "lg", "px-8")}
              >
                Inloggen
              </Link>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="bg-surface-container-lowest shadow-card flex items-center gap-3 rounded-2xl p-4"
              >
                <span className="bg-primary-container/10 text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon size={20} />
                </span>
                <span className="text-label-lg text-on-surface">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="bg-surface-container-low px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-label-sm text-primary mb-2 uppercase">
            Hoe het werkt
          </p>
          <h2 className="text-headline-lg text-on-surface mb-8 max-w-md">
            Drie stappen naar jouw medemissie-ondernemer
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-primary-container text-on-primary shadow-cta flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon size={22} />
                  </span>
                  <span className="text-display-lg text-surface-container-highest">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-headline-sm text-on-surface">{title}</h3>
                <p className="text-body-md text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectoren */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-label-sm text-primary mb-2 uppercase">Sectoren</p>
          <h2 className="text-headline-lg text-on-surface mb-6">
            Van circulaire economie tot social impact
          </h2>
          <div className="flex flex-wrap gap-2">
            {SECTOREN.map((s) => (
              <span
                key={s}
                className="bg-surface-container-lowest text-label-lg text-on-surface shadow-card inline-flex h-9 items-center rounded-full px-4"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Prijzen */}
      <section className="bg-surface-container-low px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-label-sm text-primary mb-2 uppercase">
            Abonnementen
          </p>
          <h2 className="text-headline-lg text-on-surface mb-8">
            Transparante prijzen
          </h2>
          <div className="grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="bg-surface-container-lowest shadow-card flex flex-col rounded-3xl p-6">
              <p className="text-label-sm text-secondary uppercase">Basis</p>
              <p className="text-display-lg text-on-surface mt-1">Gratis</p>
              <p className="text-body-md text-secondary mb-5">Altijd</p>
              <ul className="mb-6 flex flex-col gap-2.5">
                {[
                  "Profiel aanmaken",
                  "20 swipes per dag",
                  "Chatten met matches",
                  "Evenementen bekijken",
                  "Kennisbank lezen",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-body-md text-on-surface flex items-center gap-2"
                  >
                    <Check size={16} className="text-secondary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/aanmelden"
                className={buttonClasses("secondary", "lg", "mt-auto w-full")}
              >
                Begin gratis
              </Link>
            </div>

            <div className="bg-surface-container-lowest shadow-elevated ring-primary-container relative flex flex-col rounded-3xl p-6 ring-2">
              <span className="bg-primary-container text-label-sm text-on-primary absolute top-5 right-5 flex items-center gap-1 rounded-full px-2.5 py-1 uppercase">
                <Sparkles size={12} /> Aanbevolen
              </span>
              <p className="text-label-sm text-primary uppercase">Pro</p>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-display-lg text-on-surface">€9</p>
                <p className="text-body-md text-on-surface-variant">/maand</p>
              </div>
              <p className="text-body-md text-secondary mb-5">
                Maandelijks opzegbaar
              </p>
              <ul className="mb-6 flex flex-col gap-2.5">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="text-body-md text-on-surface flex items-center gap-2"
                  >
                    <Check
                      size={16}
                      className="text-primary-container shrink-0"
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/aanmelden"
                className={buttonClasses("primary", "lg", "mt-auto w-full")}
              >
                Start Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16">
        <div className="from-primary-container to-primary shadow-floating mx-auto max-w-4xl rounded-3xl bg-gradient-to-br px-6 py-14 text-center">
          <h2 className="text-headline-lg text-on-primary mb-3">
            Klaar om je medemissie-ondernemer te vinden?
          </h2>
          <p className="text-body-md text-on-primary/80 mx-auto mb-7 max-w-md">
            Sluit je aan bij honderden impact-ondernemers die al samenwerken via
            We Shape the Future.
          </p>
          <Link
            href="/aanmelden"
            className="bg-surface-container-lowest text-label-lg text-primary inline-flex h-12 items-center justify-center rounded-full px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Gratis aanmelden
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
