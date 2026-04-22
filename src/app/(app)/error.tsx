"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <p className="text-label-caps text-outline mb-4">FOUT</p>
      <h1 className="text-headline-sm text-on-surface mb-3">Er ging iets mis</h1>
      <p className="text-body text-on-surface-variant mb-8 max-w-sm">
        Er is een onverwachte fout opgetreden. Dit is gelogd en we kijken ernaar.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-on-primary font-bold text-label-caps hover:bg-primary/90 transition-colors"
        >
          Opnieuw proberen
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-hairline text-on-surface font-bold text-label-caps hover:border-on-surface transition-colors"
        >
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
