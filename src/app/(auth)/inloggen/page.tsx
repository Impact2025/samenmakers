import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { enabledOAuthProviders } from "@/server/auth/providers";

export const metadata: Metadata = { title: "Inloggen" };

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-headline-lg text-on-surface">Welkom terug</h1>
        <p className="text-body-md text-secondary">
          Log in op je We Shape the Future account
        </p>
      </div>
      <LoginForm providers={enabledOAuthProviders()} />
    </div>
  );
}
