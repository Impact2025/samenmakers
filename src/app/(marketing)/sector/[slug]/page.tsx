import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SECTOREN } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

function slugToSector(slug: string): string | undefined {
  return SECTOREN.find(
    (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = slugToSector(slug);
  if (!sector) return { title: "Sector niet gevonden" };
  return {
    title: `${sector} — Samenmakers`,
    description: `Ontdek impact-ondernemers actief in ${sector} op Samenmakers.`,
  };
}

export function generateStaticParams() {
  return SECTOREN.map((s) => ({
    slug: s.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = slugToSector(slug);
  if (!sector) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5 hairline-b">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">
          SAMENMAKERS
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-label-caps text-outline mb-3">SECTOR</p>
        <h1 className="text-headline-lg text-on-surface mb-6">{sector}</h1>
        <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
          Samenmakers verbindt impact-ondernemers actief in {sector}. Vind je medemissie-ondernemer,
          deel kennis en bouw samen aan een betere wereld.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div className="border border-hairline p-6">
            <h2 className="font-black text-on-surface mb-2">Ondernemers ontdekken</h2>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Browse door profielen van impact-ondernemers in {sector}.
            </p>
            <Link
              href="/aanmelden"
              className="text-label-caps text-primary hover:underline"
            >
              Maak een account →
            </Link>
          </div>
          <div className="border border-hairline p-6">
            <h2 className="font-black text-on-surface mb-2">Kennis delen</h2>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Lees artikelen en inzichten van experts in {sector}.
            </p>
            <Link
              href="/aanmelden"
              className="text-label-caps text-primary hover:underline"
            >
              Doe mee gratis →
            </Link>
          </div>
        </div>

        <div className="bg-on-surface text-on-primary p-8 text-center">
          <h2 className="text-headline-sm mb-4">Actief in {sector}?</h2>
          <p className="text-body text-white/70 mb-6">
            Word lid van Samenmakers en vind gelijkgestemde ondernemers in jouw sector.
          </p>
          <Link
            href="/aanmelden"
            className="inline-block px-8 py-3 bg-white text-on-surface font-bold text-label-caps hover:bg-white/90 transition-colors"
          >
            GRATIS AANMELDEN
          </Link>
        </div>

        <div className="mt-10 hairline-t pt-8">
          <p className="text-label-caps text-outline mb-3">ANDERE SECTOREN</p>
          <div className="flex flex-wrap gap-2">
            {SECTOREN.filter((s) => s !== sector).map((s) => (
              <Link
                key={s}
                href={`/sector/${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="px-3 py-1.5 border border-hairline text-sm text-on-surface-variant hover:border-on-surface hover:text-on-surface transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
