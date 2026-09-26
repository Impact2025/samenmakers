import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacybeleid" };

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-5 py-10">
        <article className="lesson-content bg-surface-container-lowest shadow-card rounded-2xl p-6 sm:p-8">
          <h1>Privacybeleid</h1>
          <p className="text-secondary text-sm">
            Laatst bijgewerkt: april 2026
          </p>

          <h2>1. Gegevens die we verzamelen</h2>
          <p>
            Bij het aanmaken van een account verzamelen we je naam, e-mailadres
            en profielinformatie. Foto&apos;s worden opgeslagen op Vercel Blob.
            Wachtwoorden worden gehashed met bcrypt.
          </p>

          <h2>2. Hoe we je gegevens gebruiken</h2>
          <p>
            Je gegevens worden uitsluitend gebruikt voor het koppelen van
            ondernemers, het weergeven van je profiel aan andere leden en het
            versturen van relevante e-mails waar je toestemming voor hebt
            gegeven.
          </p>

          <h2>3. Jouw rechten (AVG/GDPR)</h2>
          <p>
            Je hebt recht op inzage, correctie en verwijdering van je gegevens.
            Je kunt een export aanvragen via{" "}
            <Link href="/api/gdpr/export">Mijn gegevens exporteren</Link> of je
            account laten verwijderen via Instellingen &rarr; Privacy.
          </p>

          <h2>4. Contact</h2>
          <p>
            Voor privacyvragen:{" "}
            <a href="mailto:privacy@samenmakers.nl">privacy@samenmakers.nl</a>
          </p>
        </article>
      </main>
    </>
  );
}
