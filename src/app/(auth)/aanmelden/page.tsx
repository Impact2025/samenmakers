import type { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { enabledOAuthProviders } from "@/server/auth/providers";

export const metadata: Metadata = { title: "Aanmelden" };

interface Props {
  searchParams: Promise<{ ref?: string; email?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { ref, email } = await searchParams;
  return (
    <div>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-headline-lg text-on-surface">
          Word onderdeel van We Shape the Future
        </h1>
        <p className="text-body-md text-secondary">
          Vind je medemissie-ondernemer en bouw samen aan een betere wereld
        </p>
      </div>
      <RegisterForm
        providers={enabledOAuthProviders()}
        {...(ref ? { referralCode: ref } : {})}
        {...(email ? { initialEmail: email } : {})}
      />
    </div>
  );
}
