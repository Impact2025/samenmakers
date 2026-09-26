"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans antialiased">
        <div className="max-w-sm text-center">
          <p className="text-label-caps text-outline mb-4">SAMENMAKERS</p>
          <h1 className="text-on-surface mb-3 text-2xl font-black">
            Er ging iets mis
          </h1>
          <p className="text-on-surface-variant mb-8 text-sm">
            Er is een onverwachte fout opgetreden. Probeer het opnieuw.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mb-4 max-h-32 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-left text-xs whitespace-pre-wrap">
              {error.name}: {error.message}
              {"\n"}
              {error.digest && `Digest: ${error.digest}`}
            </pre>
          )}
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary/90 px-6 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}
