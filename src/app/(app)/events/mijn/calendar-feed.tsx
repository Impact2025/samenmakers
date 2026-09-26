"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

export function CalendarFeed({
  https,
  webcal,
}: {
  https: string;
  webcal: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-surface-container flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
      <span className="bg-surface-container-lowest text-primary-container shadow-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <RefreshCw size={20} aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-title-md text-on-surface">Synchroniseer je agenda</p>
        <p className="text-body-sm text-secondary">
          Abonneer je één keer; nieuwe aanmeldingen, wijzigingen en annuleringen
          komen vanzelf mee. Deel deze link niet.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a href={webcal} className={buttonClasses("dark", "sm")}>
          Abonneren
        </a>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            void navigator.clipboard.writeText(https).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
        >
          {copied ? "Gekopieerd" : "Link kopiëren"}
        </Button>
      </div>
    </div>
  );
}
