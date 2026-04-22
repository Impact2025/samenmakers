import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Gebruiksvoorwaarden" };

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5 hairline-b">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">SAMENMAKERS</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-16 prose prose-sm max-w-none">
        <h1>Gebruiksvoorwaarden</h1>
        <p className="text-outline text-sm">Versie 1.0 — april 2026</p>

        <h2>1. Acceptatie</h2>
        <p>Door gebruik te maken van Samenmakers ga je akkoord met deze voorwaarden. Het platform is bedoeld voor professioneel gebruik door ondernemers.</p>

        <h2>2. Gedragsregels</h2>
        <p>Je gaat er mee akkoord dat je geen spam verzendt, geen valse profielen aanmaakt en andere leden respectvol behandelt. Schendingen kunnen leiden tot verwijdering van je account.</p>

        <h2>3. Intellectueel eigendom</h2>
        <p>Content die je deelt blijft van jou. Door content te plaatsen geef je Samenmakers een niet-exclusieve licentie om deze weer te geven op het platform.</p>

        <h2>4. Aansprakelijkheid</h2>
        <p>Samenmakers is een platform dat leden verbindt. Wij zijn niet aansprakelijk voor de uitkomst van samenwerkingen die via het platform tot stand komen.</p>

        <h2>5. Contact</h2>
        <p><a href="mailto:hallo@samenmakers.nl">hallo@samenmakers.nl</a></p>
      </main>
    </div>
  );
}
