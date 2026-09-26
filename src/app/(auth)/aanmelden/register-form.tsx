"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OAuthButtons, OrDivider } from "../oauth-buttons";

// initialEmail: vanuit een gastbestelling (?email=) alvast invullen, zodat tickets direct gekoppeld zijn.
export function RegisterForm({
  referralCode,
  initialEmail = "",
}: {
  referralCode?: string;
  initialEmail?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: initialEmail,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, referralCode }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Er is iets misgegaan");
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/profiel/bewerken",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await signIn(provider, {
      callbackUrl: "/profiel/bewerken",
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons
        verb="Aanmelden"
        loading={oauthLoading}
        onSelect={(p) => void handleOAuth(p)}
      />
      <OrDivider />

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          label="Naam"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Jouw volledige naam"
          autoComplete="name"
          required
          minLength={2}
        />
        <Input
          label="E-mailadres"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="jij@bedrijf.nl"
          autoComplete="email"
          inputMode="email"
          required
        />
        <Input
          label="Wachtwoord"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="Minimaal 8 tekens"
          autoComplete="new-password"
          required
          minLength={8}
        />

        {error && (
          <p className="text-body-sm text-error" role="alert">
            {error}
          </p>
        )}

        <p className="text-secondary text-xs">
          Door aan te melden ga je akkoord met onze{" "}
          <Link href="/voorwaarden" className="text-primary">
            gebruiksvoorwaarden
          </Link>{" "}
          en{" "}
          <Link href="/privacy" className="text-primary">
            privacybeleid
          </Link>
          .
        </p>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? <Spinner /> : "Account aanmaken"}
        </Button>
      </form>

      <p className="text-body-md text-secondary text-center">
        Al een account?{" "}
        <Link href="/inloggen" className="text-primary-container font-semibold">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
