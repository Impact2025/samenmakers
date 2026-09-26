"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OAuthButtons, OrDivider, type OAuthProviders } from "../oauth-buttons";

/** Alleen interne paden, zodat ?next= geen open redirect wordt. */
function nextPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export function LoginForm({ providers }: { providers: OAuthProviders }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError("E-mailadres of wachtwoord onjuist");
      } else {
        router.push(nextPath());
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: nextPath() });
  }

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons
        verb="Doorgaan"
        loading={oauthLoading}
        onSelect={(p) => void handleOAuth(p)}
        providers={providers}
      />
      {(providers.google || providers.linkedin) && <OrDivider />}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <div className="-mt-2 text-right">
          <Link
            href="/wachtwoord-reset"
            className="text-label-md text-primary-container hover:underline"
          >
            Wachtwoord vergeten?
          </Link>
        </div>

        {error && (
          <p className="text-body-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? <Spinner /> : "Inloggen"}
        </Button>
      </form>

      <p className="text-body-md text-secondary text-center">
        Nog geen account?{" "}
        <Link
          href="/aanmelden"
          className="text-primary-container font-semibold"
        >
          Aanmelden
        </Link>
      </p>
    </div>
  );
}
