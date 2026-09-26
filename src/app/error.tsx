"use client";

import { useEffect } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-6 font-sans antialiased">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Logo wordmark="always" />
        <h1 className="text-headline-lg text-on-surface">Er ging iets mis</h1>
        <p className="text-body-md text-secondary">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="bg-error-container text-body-sm text-on-error-container max-h-32 w-full overflow-auto rounded-xl p-3 text-left whitespace-pre-wrap">
            {error.name}: {error.message}
            {"\n"}
            {error.digest && `Digest: ${error.digest}`}
          </pre>
        )}
        <Button size="lg" onClick={reset}>
          Opnieuw proberen
        </Button>
      </div>
    </div>
  );
}
