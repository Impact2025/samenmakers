"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function NieuwWachtwoordForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8)
      return setError("Kies een wachtwoord van minimaal 8 tekens");
    if (password !== confirm)
      return setError("De wachtwoorden komen niet overeen");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Er is iets misgegaan. Probeer het opnieuw.");
        return;
      }
      setDone(true);
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-headline-lg text-on-surface">Ongeldige link</h1>
        <p className="text-body-md text-secondary">
          Deze resetlink is onvolledig. Vraag een nieuwe aan.
        </p>
        <Link
          href="/wachtwoord-reset"
          className={buttonClasses("primary", "lg", "w-full")}
        >
          Nieuwe link aanvragen
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-tertiary-fixed text-tertiary flex h-14 w-14 items-center justify-center rounded-2xl">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="text-headline-lg text-on-surface">
          Wachtwoord ingesteld
        </h1>
        <p className="text-body-md text-secondary">
          Je kunt nu inloggen met je nieuwe wachtwoord.
        </p>
        <Link
          href="/inloggen"
          className={buttonClasses("primary", "lg", "w-full")}
        >
          Inloggen
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
        <h1 className="text-headline-lg text-on-surface">Nieuw wachtwoord</h1>
        <p className="text-body-md text-secondary">
          Voor <strong className="text-on-surface">{email}</strong>
        </p>
      </div>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
      >
        <Input
          label="Nieuw wachtwoord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          hint="Minimaal 8 tekens"
          required
        />
        <Input
          label="Herhaal wachtwoord"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        {error && (
          <p className="text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Wachtwoord opslaan"}
        </Button>
      </form>
    </div>
  );
}

export default function NieuwWachtwoordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <NieuwWachtwoordForm />
    </Suspense>
  );
}
