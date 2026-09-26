"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Geannuleerd of niet toegestaan: val terug op kopiëren.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopieer de link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
    >
      <Share2 size={14} aria-hidden /> {copied ? "Link gekopieerd" : "Delen"}
    </button>
  );
}
