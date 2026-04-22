import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await api.admin.analytics();

  const statCards = [
    { label: "TOTAAL GEBRUIKERS", value: stats.totalUsers, sub: `+${stats.newUsersThisMonth} deze maand` },
    { label: "MATCH RATE", value: `${stats.matchRate}%`, sub: "wederzijds geïnteresseerd" },
    { label: "BERICHTEN", value: stats.totalMessages, sub: "totaal verzonden" },
    { label: "ACTIEF DEZE WEEK", value: stats.activeUsersThisWeek, sub: "unieke gebruikers" },
    { label: "POSTS", value: stats.totalPosts, sub: "gepubliceerde artikelen" },
    { label: "EVENTS", value: stats.totalEvents, sub: "gepubliceerde events" },
    { label: "PRO GEBRUIKERS", value: stats.proUsers, sub: "actieve abonnementen" },
    { label: "MRR", value: `€${stats.mrr}`, sub: "maandelijkse omzet" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-on-surface">Admin Dashboard</h1>
        <p className="text-sm text-outline mt-1">Platform overzicht</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub }) => (
          <Card key={label} hover={false}>
            <CardBody className="p-5">
              <p className="text-[10px] font-bold tracking-widest text-outline mb-2">{label}</p>
              <p className="text-3xl font-black text-on-surface">{value}</p>
              <p className="text-xs text-outline mt-1">{sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
