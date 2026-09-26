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
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-label-md text-secondary mb-4">FOUT</p>
      <h1 className="text-headline-md text-on-surface mb-3">
        Er ging iets mis
      </h1>
      <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">
        Er is een onverwachte fout opgetreden. Dit is gelogd en we kijken
        ernaar.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-on-primary text-label-md hover:bg-primary/90 px-6 py-3 font-bold transition-colors"
        >
          Opnieuw proberen
        </button>
        <Link
          href="/dashboard"
          className="border-hairline text-on-surface text-label-md hover:border-on-surface border px-6 py-3 font-bold transition-colors"
        >
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
