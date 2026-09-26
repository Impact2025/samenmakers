"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans antialiased">
      <div className="max-w-sm text-center">
        <p className="text-label-md text-secondary mb-4">We Shape the Future</p>
        <h1 className="text-on-surface mb-3 text-2xl font-extrabold">
          Er ging iets mis
        </h1>
        <p className="text-on-surface-variant mb-8 text-sm">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="bg-error-container mb-4 max-h-32 overflow-auto rounded border border-red-200 p-3 text-left text-xs whitespace-pre-wrap">
            {error.name}: {error.message}
            {"\n"}
            {error.digest && `Digest: ${error.digest}`}
          </pre>
        )}
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary/90 shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold text-white transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
