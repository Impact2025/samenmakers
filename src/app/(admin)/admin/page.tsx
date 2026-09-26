import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await api.admin.analytics();

  const statCards = [
    {
      label: "Totaal gebruikers",
      value: stats.totalUsers,
      sub: `+${stats.newUsersThisMonth} deze maand`,
    },
    {
      label: "Match rate",
      value: `${stats.matchRate}%`,
      sub: "wederzijds geïnteresseerd",
    },
    { label: "Berichten", value: stats.totalMessages, sub: "totaal verzonden" },
    {
      label: "Actief deze week",
      value: stats.activeUsersThisWeek,
      sub: "unieke gebruikers",
    },
    { label: "Posts", value: stats.totalPosts, sub: "gepubliceerde artikelen" },
    { label: "Events", value: stats.totalEvents, sub: "gepubliceerde events" },
    {
      label: "PRO gebruikers",
      value: stats.proUsers,
      sub: "actieve abonnementen",
    },
    { label: "MRR", value: `€${stats.mrr}`, sub: "maandelijkse omzet" },
    { label: "Clubs", value: stats.totalCohorts, sub: "cohorten" },
    {
      label: "Clubleden",
      value: stats.totalCohortMembers,
      sub: `gem. ${stats.totalCohorts > 0 ? Math.round((stats.totalCohortMembers / stats.totalCohorts) * 10) / 10 : 0} per club`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-on-surface text-2xl font-extrabold">
          Admin Dashboard
        </h1>
        <p className="text-secondary mt-1 text-sm">Platform overzicht</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, sub }) => (
          <Card key={label} hover={false}>
            <CardBody className="p-5">
              <p className="text-secondary mb-2 text-[10px] font-bold tracking-widest">
                {label}
              </p>
              <p className="text-on-surface text-3xl font-extrabold">{value}</p>
              <p className="text-secondary mt-1 text-xs">{sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
