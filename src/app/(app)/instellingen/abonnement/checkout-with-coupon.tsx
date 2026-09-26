"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Tag } from "lucide-react";

type Applied = {
  code: string;
  discountType: "percent" | "amount";
  discountValue: number;
  description: string | null;
};

function describe(a: Applied) {
  const value =
    a.discountType === "percent"
      ? `${a.discountValue}% korting`
      : `€${(a.discountValue / 100).toFixed(2)} korting`;
  return value;
}

export function CheckoutWithCoupon() {
  const utils = trpc.useUtils();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const res = await utils.coupons.validate.fetch({ code: code.trim() });
      setApplied(res);
    } catch (e) {
      setApplied(null);
      setError(e instanceof Error ? e.message : "Ongeldige code.");
    } finally {
      setChecking(false);
    }
  }

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: applied?.code }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Coupon field */}
      {applied ? (
        <div className="border-primary/30 bg-primary/5 flex items-center justify-between border px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-primary" />
            <div>
              <p className="text-on-surface text-sm font-bold">
                {applied.code}
              </p>
              <p className="text-on-surface-variant text-xs">
                {describe(applied)}
                {applied.description ? ` — ${applied.description}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setApplied(null);
              setCode("");
            }}
            className="text-secondary hover:text-on-surface text-xs font-semibold"
          >
            Wijzig
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-label-md text-secondary mb-2 flex items-center gap-1">
              <Tag size={12} /> Kortingscode
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Heb je een code?"
              className="text-body-lg text-on-surface placeholder:text-secondary bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 w-full rounded-xl border border-transparent px-4 py-3 pb-2 transition-all outline-none focus:ring-[3px]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void apply()}
            disabled={checking || !code.trim()}
          >
            {checking ? <Spinner /> : "Toepassen"}
          </Button>
        </div>
      )}
      {error && <p className="text-error text-sm">{error}</p>}

      <Button
        variant="primary"
        onClick={() => void checkout()}
        disabled={loading}
        className="w-full py-3"
      >
        {loading ? <Spinner /> : "Upgrade naar Pro — €9/maand"}
      </Button>
    </div>
  );
}
