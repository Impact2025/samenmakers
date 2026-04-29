import { Suspense } from "react";
import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Spinner } from "@/components/ui/spinner";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const [me, matches, notifications, events] = await Promise.all([
    api.users.me().catch((e: unknown) => { console.error("[dashboard] users.me failed:", e); throw e; }),
    api.matches.myMatches().catch((e: unknown) => { console.error("[dashboard] matches.myMatches failed:", e); throw e; }),
    api.notifications.list({ limit: 5 }).catch((e: unknown) => { console.error("[dashboard] notifications.list failed:", e); throw e; }),
    api.events.list({ upcoming: true, limit: 3 }).catch((e: unknown) => { console.error("[dashboard] events.list failed:", e); throw e; }),
  ]);

  return (
    <DashboardContent
      me={me}
      matches={matches}
      notifications={notifications}
      events={events.items}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner />
    </div>
  );
}
