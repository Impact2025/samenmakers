"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
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
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-tertiary-fixed text-tertiary flex h-14 w-14 items-center justify-center rounded-2xl">
          <MailCheck size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-lg text-on-surface">
            Controleer je e-mail
          </h1>
          <p className="text-body-md text-secondary">
            Als er een account bestaat voor{" "}
            <strong className="text-on-surface">{email}</strong>, ontvang je een
            resetlink.
          </p>
        </div>
        <Link
          href="/inloggen"
          className={buttonClasses("secondary", "lg", "w-full")}
        >
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="bg-primary-fixed text-primary-container flex h-12 w-12 items-center justify-center rounded-2xl">
          <KeyRound size={24} />
        </span>
        <h1 className="text-headline-lg text-on-surface">
          Wachtwoord vergeten
        </h1>
        <p className="text-body-md text-secondary">
          Vul je e-mailadres in. Als er een account bestaat, sturen we je een
          resetlink.
        </p>
      </div>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
      >
        <Input
          label="E-mailadres"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@bedrijf.nl"
          autoComplete="email"
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Resetlink versturen"}
        </Button>
      </form>
      <p className="text-body-md text-secondary text-center">
        Wachtwoord weer te binnen geschoten?{" "}
        <Link
          href="/inloggen"
          className="text-primary-container font-semibold hover:underline"
        >
          Inloggen
        </Link>
      </p>
    </div>
  );
}
