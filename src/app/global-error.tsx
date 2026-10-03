"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="nl">
      <body
        style={{ background: "#f9f9ff", color: "#141b2b" }}
        className="flex min-h-screen flex-col items-center justify-center px-6 font-sans antialiased"
      >
        <div className="max-w-sm text-center">
          <p className="mb-4 text-sm font-bold" style={{ color: "#d8006e" }}>
            We Shape the Future
          </p>
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
            className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
            style={{ background: "#d8006e" }}
          >
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}
