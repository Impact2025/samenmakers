"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function StripeButton({ action }: { action: "checkout" | "portal" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stripe/${action}`, { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="primary"
      onClick={() => void handleClick()}
      disabled={loading}
      className="w-full py-3"
    >
      {loading ? (
        <Spinner />
      ) : action === "checkout" ? (
        "Upgrade naar Pro — €9/maand"
      ) : (
        "Abonnement beheren"
      )}
    </Button>
  );
}
