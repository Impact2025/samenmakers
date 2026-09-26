import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Over We Shape the Future",
  description:
    "Het verhaal achter We Shape the Future — het platform voor purpose-driven ondernemers.",
};

export default function OverPage() {
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
      <main className="mx-auto max-w-2xl space-y-12 px-6 py-16">
        <div>
          <p className="text-label-md text-secondary mb-3">Over ons</p>
          <h1 className="text-display-lg text-on-surface mb-6">
            We Shape the Future
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            We Shape the Future is het netwerk voor ondernemers die geloven dat
            samenwerking de sleutel is tot impact. We brengen purpose-driven
            ondernemers samen die vanuit een gedeelde missie bouwen aan een
            betere wereld.
          </p>
        </div>

        <div className="hairline-t pt-10">
          <h2 className="text-headline-md text-on-surface mb-4">Onze missie</h2>
          <p className="text-body-md text-on-surface-variant">
            Elke impact-ondernemer verdient de juiste medemenselijke partner.
            Iemand die begrijpt waar je voor staat, die complementaire
            vaardigheden heeft en die even gedreven is als jij. We Shape the
            Future maakt die verbinding mogelijk — op schaal, met intentie.
          </p>
        </div>

        <div className="hairline-t pt-10">
          <h2 className="text-headline-md text-on-surface mb-4">Voor wie?</h2>
          <p className="text-body-md text-on-surface-variant mb-4">
            We Shape the Future is gebouwd voor ondernemers actief in sectoren
            zoals duurzaamheid, social impact, circulaire economie, schone
            energie en meer. Of je nu starter bent of al jaren bezig — als je
            vanuit een missie onderneemt, is We Shape the Future voor jou.
          </p>
        </div>

        <div className="hairline-t flex gap-4 pt-10">
          <Link
            href="/aanmelden"
            className="bg-primary text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-colors"
          >
            Word lid
          </Link>
          <Link
            href="/"
            className="text-on-surface text-label-md border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-bold transition-colors"
          >
            Terug naar home
          </Link>
        </div>
      </main>
    </div>
  );
}
