import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacybeleid" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5 hairline-b">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">SAMENMAKERS</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-16 prose prose-sm max-w-none">
        <h1>Privacybeleid</h1>
        <p className="text-outline text-sm">Laatst bijgewerkt: april 2026</p>

        <h2>1. Gegevens die we verzamelen</h2>
        <p>Bij het aanmaken van een account verzamelen we je naam, e-mailadres en profielinformatie. Foto's worden opgeslagen op Vercel Blob. Wachtwoorden worden gehashed met bcrypt.</p>

        <h2>2. Hoe we je gegevens gebruiken</h2>
        <p>Je gegevens worden uitsluitend gebruikt voor het koppelen van ondernemers, het weergeven van je profiel aan andere leden en het versturen van relevante e-mails waar je toestemming voor hebt gegeven.</p>

        <h2>3. Jouw rechten (AVG/GDPR)</h2>
        <p>Je hebt recht op inzage, correctie en verwijdering van je gegevens. Je kunt een export aanvragen via <Link href="/api/gdpr/export">Mijn gegevens exporteren</Link> of je account laten verwijderen via Instellingen &rarr; Privacy.</p>

        <h2>4. Contact</h2>
        <p>Voor privacyvragen: <a href="mailto:privacy@samenmakers.nl">privacy@samenmakers.nl</a></p>
      </main>
    </div>
  );
}
