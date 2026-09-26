"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

export function CalendarFeed({
  https,
  webcal,
}: {
  https: string;
  webcal: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
      <CalendarPlus size={20} className="text-secondary shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="text-on-surface text-sm font-semibold">
          Al je events automatisch in je agenda
        </p>
        <p className="text-body-md text-secondary">
          Abonneer je één keer; nieuwe aanmeldingen, wijzigingen en annuleringen
          komen vanzelf mee. Deel deze link niet.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={webcal}
          className="bg-on-surface text-surface-container-lowest text-label-md inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 transition-colors"
        >
          Abonneren
        </a>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(https).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          {copied ? "Gekopieerd" : "Link kopiëren"}
        </button>
      </div>
    </div>
  );
}
