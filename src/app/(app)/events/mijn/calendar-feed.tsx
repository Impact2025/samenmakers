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
    <div className="border-hairline flex flex-col gap-4 border bg-white p-5 sm:flex-row sm:items-center">
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
          className="bg-on-surface text-on-primary text-label-md px-4 py-2"
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
          className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-4 py-2"
        >
          {copied ? "Gekopieerd" : "Link kopiëren"}
        </button>
      </div>
    </div>
  );
}
