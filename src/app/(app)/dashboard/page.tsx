import { Suspense } from "react";
import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { getPersona } from "@/server/learning/persona";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = { title: "Home" };

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("nl-NL", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Amsterdam",
    }).format(new Date()),
  );
  if (hour < 6) return "Goedenacht";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

async function DashboardData() {
  const [me, matches, events, questions, learning, teaching, persona] =
    await Promise.all([
      api.users.me(),
      api.matches.myMatches(),
      api.events.list({ upcoming: true, limit: 3 }),
      api.questions.list({ limit: 2 }).catch(() => ({ items: [] })),
      features.leren
        ? api.learning.home().catch(() => null)
        : Promise.resolve(null),
      features.leren
        ? api.teaching.overview().catch(() => [])
        : Promise.resolve([]),
      getPersona(),
    ]);

  return (
    <DashboardContent
      greeting={greeting()}
      me={me}
      matches={matches}
      events={events.items}
      questions={questions.items}
      edition={learning?.learning[0] ?? null}
      teaching={teaching}
      persona={persona}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-5"
      aria-busy="true"
      aria-label="Laden"
    >
      <div className="bg-surface-container h-6 w-48 rounded-full" />
      <div className="bg-surface-container h-9 w-64 rounded-xl" />
      <div className="bg-surface-container-low h-28 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-low h-28 rounded-2xl" />
        <div className="bg-surface-container-low h-28 rounded-2xl" />
      </div>
      <div className="bg-surface-container-low h-56 rounded-2xl" />
    </div>
  );
}
