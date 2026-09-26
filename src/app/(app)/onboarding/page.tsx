import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = { title: "Welkom bij We Shape the Future" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();

  // Skip onboarding if profile is reasonably complete
  if ((me?.profileCompleteness ?? 0) >= 60) redirect("/dashboard");

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <p className="text-on-surface mb-2 text-2xl font-extrabold tracking-tighter">
            WE SHAPE THE FUTURE
          </p>
          <h1 className="text-headline-lg text-on-surface mb-3">
            Welkom! Laten we beginnen.
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Vertel ons over jezelf, zodat we de beste matches voor je kunnen
            vinden.
          </p>
        </div>
        <OnboardingFlow user={me} />
      </div>
    </div>
  );
}
