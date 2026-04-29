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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white font-sans antialiased">
      <div className="text-center max-w-sm">
        <p className="text-label-caps text-outline mb-4">SAMENMAKERS</p>
        <h1 className="text-2xl font-black text-on-surface mb-3">Er ging iets mis</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white font-bold text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
