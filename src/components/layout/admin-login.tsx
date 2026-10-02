"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Eigen inlogscherm voor /admin. Alleen e-mail en wachtwoord. */
export function AdminLogin({ ingelogdAls }: { ingelogdAls?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-5 py-8">
      <div className="bg-surface-container-lowest shadow-elevated w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-headline-lg text-on-surface">Beheer</h1>
          <p className="text-body-md text-secondary">
            Log in om het beheerpaneel te openen
          </p>
        </div>

        {ingelogdAls ? (
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-error" role="alert">
              {ingelogdAls} heeft geen beheerdersrechten. Log in met een
              beheerdersaccount.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => void signOut({ redirectTo: "/admin" })}
            >
              Uitloggen
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <Input
              label="E-mailadres"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              autoComplete="email"
              inputMode="email"
              required
            />
            <Input
              label="Wachtwoord"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              autoComplete="current-password"
              required
            />
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
        )}
      </div>
    </div>
  );
}
