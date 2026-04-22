import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRO_FEATURES, SECTOREN } from "@/lib/constants";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Samenmakers — Vind je medemissie-ondernemer",
  description: "Het platform waar purpose-driven ondernemers elkaar vinden, kennis delen en samenwerken aan een betere wereld.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white hairline-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-black tracking-tighter text-on-surface">SAMENMAKERS</span>
          <div className="flex items-center gap-4">
            <Link href="/inloggen" className="text-label-caps text-outline hover:text-on-surface transition-colors">
              INLOGGEN
            </Link>
            <Link href="/aanmelden">
              <Button variant="primary">Begin gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <Badge variant="default" className="mb-6">Purpose-driven netwerk</Badge>
          <h1 className="text-headline-lg text-on-surface mb-6">
            Vind je medemissie-ondernemer
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
            Samenmakers verbindt impact-ondernemers die samen meer bereiken.
            Match op missie, deel kennis en bouw aan een betere wereld.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/aanmelden">
              <Button variant="primary" className="py-4 px-8">
                Start gratis <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/inloggen">
              <Button variant="secondary" className="py-4 px-8">
                Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-surface-container-low hairline-t hairline-b">
        <div className="max-w-5xl mx-auto">
          <p className="text-label-caps text-outline mb-3">HOE HET WERKT</p>
          <h2 className="text-headline-md text-on-surface mb-12 max-w-md">
            Drie stappen naar jouw medemissie-ondernemer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Maak je profiel", body: "Vertel over je missie, sector, fase en wat je zoekt in een samenwerking." },
              { step: "02", title: "Match op missie", body: "Swipe door profielen van gelijkgestemde ondernemers. Bij wederzijdse interesse: een match!" },
              { step: "03", title: "Bouw samen", body: "Chat, ontmoet elkaar op events en deel kennis in de community." },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <p className="text-4xl font-black text-outline/30 mb-4">{step}</p>
                <h3 className="text-lg font-black text-on-surface mb-2">{title}</h3>
                <p className="text-body-sm text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-label-caps text-outline mb-3">SECTOREN</p>
          <h2 className="text-headline-md text-on-surface mb-8">Van circulaire economie tot social impact</h2>
          <div className="flex flex-wrap gap-2">
            {SECTOREN.map((s) => (
              <span key={s} className="px-4 py-2 border border-hairline text-sm font-medium text-on-surface-variant hover:border-on-surface hover:text-on-surface transition-colors">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-surface-container-low hairline-t hairline-b">
        <div className="max-w-5xl mx-auto">
          <p className="text-label-caps text-outline mb-3">ABONNEMENTEN</p>
          <h2 className="text-headline-md text-on-surface mb-12">Transparante prijzen</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {/* Basis */}
            <div className="border border-hairline bg-white p-8">
              <p className="text-label-caps text-outline mb-2">BASIS</p>
              <p className="text-4xl font-black text-on-surface mb-1">Gratis</p>
              <p className="text-body-sm text-outline mb-6">Altijd</p>
              <ul className="space-y-3 mb-8">
                {["Profiel aanmaken", "20 swipes per dag", "Chatten met matches", "Events bekijken", "Kennisbank lezen"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body-sm text-on-surface">
                    <CheckCircle size={14} className="text-outline shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/aanmelden">
                <Button variant="secondary" className="w-full">Begin gratis</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-primary bg-white p-8 relative">
              <Badge variant="primary" className="absolute top-4 right-4">AANBEVOLEN</Badge>
              <p className="text-label-caps text-primary mb-2">PRO</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-4xl font-black text-on-surface">€9</p>
                <p className="text-on-surface-variant">/maand</p>
              </div>
              <p className="text-body-sm text-outline mb-6">Maandelijks opzegbaar</p>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body-sm text-on-surface">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/aanmelden">
                <Button variant="primary" className="w-full">Start Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-on-surface text-on-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-headline-md mb-4">Klaar om je medemissie-ondernemer te vinden?</h2>
          <p className="text-body text-white/70 mb-8">
            Sluit je aan bij honderden impact-ondernemers die al samenwerken via Samenmakers.
          </p>
          <Link href="/aanmelden">
            <button className="px-10 py-4 bg-white text-on-surface font-bold text-label-caps hover:bg-white/90 transition-colors">
              GRATIS AANMELDEN
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 hairline-t">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-black text-on-surface">SAMENMAKERS</span>
          <div className="flex gap-6 text-xs text-outline">
            <Link href="/over" className="hover:text-on-surface transition-colors">Over ons</Link>
            <Link href="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-on-surface transition-colors">Voorwaarden</Link>
          </div>
          <p className="text-xs text-outline">© {new Date().getFullYear()} Samenmakers</p>
        </div>
      </footer>
    </div>
  );
}
