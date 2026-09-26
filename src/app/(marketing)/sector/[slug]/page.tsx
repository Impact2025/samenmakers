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
    title: `${sector} — We Shape the Future`,
    description: `Ontdek impact-ondernemers actief in ${sector} op We Shape the Future.`,
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
      <header className="hairline-b px-6 py-5">
        <Link
          href="/"
          className="text-on-surface text-xl font-extrabold tracking-tighter"
        >
          We Shape the Future
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-label-md text-secondary mb-3">Sector</p>
        <h1 className="text-display-lg text-on-surface mb-6">{sector}</h1>
        <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
          We Shape the Future verbindt impact-ondernemers actief in {sector}.
          Vind je medemissie-ondernemer, deel kennis en bouw samen aan een
          betere wereld.
        </p>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <div className="bg-surface-container-lowest shadow-card rounded-2xl p-6">
            <h2 className="text-on-surface mb-2 font-extrabold">
              Ondernemers ontdekken
            </h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Browse door profielen van impact-ondernemers in {sector}.
            </p>
            <Link
              href="/aanmelden"
              className="text-label-md text-primary hover:underline"
            >
              Maak een account →
            </Link>
          </div>
          <div className="bg-surface-container-lowest shadow-card rounded-2xl p-6">
            <h2 className="text-on-surface mb-2 font-extrabold">
              Kennis delen
            </h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Lees artikelen en inzichten van experts in {sector}.
            </p>
            <Link
              href="/aanmelden"
              className="text-label-md text-primary hover:underline"
            >
              Doe mee gratis →
            </Link>
          </div>
        </div>

        <div className="bg-on-surface text-on-primary p-8 text-center">
          <h2 className="text-headline-md mb-4">Actief in {sector}?</h2>
          <p className="text-body-md mb-6 text-white/70">
            Word lid van We Shape the Future en vind gelijkgestemde ondernemers
            in jouw sector.
          </p>
          <Link
            href="/aanmelden"
            className="text-on-surface text-label-md inline-block bg-white px-8 py-3 font-bold transition-colors hover:bg-white/90"
          >
            Gratis aanmelden
          </Link>
        </div>

        <div className="hairline-t mt-10 pt-8">
          <p className="text-label-md text-secondary mb-3">Andere sectoren</p>
          <div className="flex flex-wrap gap-2">
            {SECTOREN.filter((s) => s !== sector).map((s) => (
              <Link
                key={s}
                href={`/sector/${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
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
