"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function WachtwoordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm text-center">
          <p className="text-label-caps text-outline mb-6">SAMENMAKERS</p>
          <div className="border border-hairline p-8 mb-6">
            <h1 className="text-headline-sm text-on-surface mb-3">Controleer je e-mail</h1>
            <p className="text-body-sm text-on-surface-variant">
              Als er een account bestaat voor <strong>{email}</strong>, ontvang je een
              resetlink.
            </p>
          </div>
          <Link href="/inloggen" className="text-label-caps text-on-surface hover:text-outline">
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <p className="text-label-caps text-outline mb-6 text-center">SAMENMAKERS</p>
        <div className="border border-hairline p-8 mb-6">
          <h1 className="text-headline-sm text-on-surface mb-2">Wachtwoord vergeten</h1>
          <p className="text-body-sm text-on-surface-variant mb-6">
            Vul je e-mailadres in. Als er een account bestaat, sturen we je een resetlink.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label-caps text-outline block mb-2">E-MAILADRES</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : "Resetlink versturen"}
            </Button>
          </form>
        </div>
        <p className="text-center text-body-sm text-outline">
          Wachtwoord weet je weer?{" "}
          <Link href="/inloggen" className="text-on-surface font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
