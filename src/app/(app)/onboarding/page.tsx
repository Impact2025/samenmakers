import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Logo } from "@/components/shared/logo";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = { title: "Welkom bij We Shape the Future" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();

  // Skip onboarding if profile is reasonably complete
  if ((me?.profileCompleteness ?? 0) >= 60) redirect("/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo wordmark="always" size={40} />
        <h1 className="text-headline-lg text-on-surface">
          Welkom! Laten we beginnen.
        </h1>
        <p className="text-body-md text-secondary">
          Vertel ons over jezelf, zodat we de beste matches voor je kunnen
          vinden.
        </p>
      </div>
      <OnboardingFlow user={me} />
    </div>
  );
}
