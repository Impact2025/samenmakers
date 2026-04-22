import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Over Samenmakers",
  description: "Het verhaal achter Samenmakers — het platform voor purpose-driven ondernemers.",
};

export default function OverPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5 hairline-b">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">SAMENMAKERS</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        <div>
          <p className="text-label-caps text-outline mb-3">OVER ONS</p>
          <h1 className="text-headline-lg text-on-surface mb-6">Samenmakers</h1>
          <p className="text-body-lg text-on-surface-variant">
            Samenmakers is het netwerk voor ondernemers die geloven dat samenwerking de sleutel is tot impact.
            We brengen purpose-driven ondernemers samen die vanuit een gedeelde missie bouwen aan een betere wereld.
          </p>
        </div>

        <div className="hairline-t pt-10">
          <h2 className="text-headline-sm text-on-surface mb-4">Onze missie</h2>
          <p className="text-body text-on-surface-variant">
            Elke impact-ondernemer verdient de juiste medemenselijke partner. Iemand die begrijpt waar je voor staat,
            die complementaire vaardigheden heeft en die even gedreven is als jij. Samenmakers maakt die verbinding mogelijk —
            op schaal, met intentie.
          </p>
        </div>

        <div className="hairline-t pt-10">
          <h2 className="text-headline-sm text-on-surface mb-4">Voor wie?</h2>
          <p className="text-body text-on-surface-variant mb-4">
            Samenmakers is gebouwd voor ondernemers actief in sectoren zoals duurzaamheid, social impact,
            circulaire economie, schone energie en meer. Of je nu starter bent of al jaren bezig — als je
            vanuit een missie onderneemt, is Samenmakers voor jou.
          </p>
        </div>

        <div className="hairline-t pt-10 flex gap-4">
          <Link href="/aanmelden" className="px-6 py-3 bg-primary text-on-primary font-bold text-label-caps">
            Word lid
          </Link>
          <Link href="/" className="px-6 py-3 border border-hairline text-on-surface font-bold text-label-caps">
            Terug naar home
          </Link>
        </div>
      </main>
    </div>
  );
}
