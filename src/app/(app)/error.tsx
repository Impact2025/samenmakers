"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-headline-lg text-on-surface">Er ging iets mis</h1>
      <p className="text-body-md text-secondary max-w-sm">
        Er is een onverwachte fout opgetreden. Dit is gelogd en we kijken
        ernaar.
      </p>
      <div className="flex gap-2">
        <Button size="lg" onClick={reset}>
          Opnieuw proberen
        </Button>
        <Link href="/dashboard" className={buttonClasses("secondary", "lg")}>
          Naar home
        </Link>
      </div>
    </div>
  );
}
