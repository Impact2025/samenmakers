import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "E-mail verifiëren" };

export default function VerifieerPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm text-center">
        <p className="text-label-caps text-outline mb-6">SAMENMAKERS</p>
        <div className="border border-hairline p-8 mb-6">
          <div className="w-12 h-12 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <rect x="2" y="4" width="20" height="16" rx="0" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-headline-sm text-on-surface mb-3">Controleer je inbox</h1>
          <p className="text-body-sm text-on-surface-variant">
            We hebben een verificatielink gestuurd naar je e-mailadres. Klik op de link om je
            account te activeren.
          </p>
        </div>
        <p className="text-body-sm text-outline mb-4">
          Geen e-mail ontvangen? Controleer je spamfolder.
        </p>
        <Link
          href="/inloggen"
          className="text-label-caps text-on-surface hover:text-outline transition-colors"
        >
          Terug naar inloggen
        </Link>
      </div>
    </div>
  );
}
