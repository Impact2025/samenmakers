"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RegisterForm({ referralCode }: { referralCode?: string }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    <div className="space-y-6">
      {/* OAuth */}
      <div className="space-y-3">
        <button
          onClick={() => void handleOAuth("google")}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-hairline text-sm font-semibold hover:border-on-surface transition-colors disabled:opacity-50"
        >
          {oauthLoading === "google" ? <Spinner /> : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Aanmelden met Google
        </button>
        <button
          onClick={() => void handleOAuth("linkedin")}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-hairline text-sm font-semibold hover:border-on-surface transition-colors disabled:opacity-50"
        >
          {oauthLoading === "linkedin" ? <Spinner /> : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#0A66C2">
              <path d="M16.2 0H1.8C.81 0 0 .81 0 1.8v14.4C0 17.19.81 18 1.8 18h14.4c.99 0 1.8-.81 1.8-1.8V1.8C18 .81 17.19 0 16.2 0zM5.4 15.3H2.7V6.75h2.7V15.3zM4.05 5.58a1.575 1.575 0 110-3.15 1.575 1.575 0 010 3.15zM15.3 15.3h-2.7v-4.185c0-1.008-.018-2.304-1.404-2.304-1.404 0-1.62 1.098-1.62 2.232V15.3H6.876V6.75h2.592v1.188h.036c.36-.684 1.242-1.404 2.556-1.404 2.736 0 3.24 1.8 3.24 4.14V15.3z"/>
            </svg>
          )}
          Aanmelden met LinkedIn
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-hairline" />
        <span className="text-xs text-outline">OF</span>
        <div className="flex-1 h-px bg-hairline" />
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="text-label-caps text-outline block mb-2">NAAM</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jouw volledige naam"
            autoComplete="name"
            required
            minLength={2}
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">E-MAILADRES</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jij@bedrijf.nl"
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">WACHTWOORD</label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Minimaal 8 tekens"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-xs text-outline">
          Door aan te melden ga je akkoord met onze{" "}
          <Link href="/voorwaarden" className="text-primary">gebruiksvoorwaarden</Link>{" "}
          en{" "}
          <Link href="/privacy" className="text-primary">privacybeleid</Link>.
        </p>

        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
          {loading ? <Spinner /> : "Account aanmaken"}
        </Button>
      </form>

      <p className="text-center text-body-sm text-outline">
        Al een account?{" "}
        <Link href="/inloggen" className="text-primary font-semibold">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
