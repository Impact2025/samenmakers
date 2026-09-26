"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function CopyReferralButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/r/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="tonal" size="sm" onClick={() => void handleCopy()}>
      {copied ? (
        <>
          <Check size={16} /> Gekopieerd
        </>
      ) : (
        <>
          <Copy size={16} /> Kopieer link
        </>
      )}
    </Button>
  );
}
