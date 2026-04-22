import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const stats = await api.admin.analytics();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-on-surface">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAAL GEBRUIKERS", value: stats.totalUsers, change: `+${stats.newUsersThisMonth} (30d)` },
          { label: "ACTIEF DEZE WEEK", value: stats.activeUsersThisWeek, change: "unieke senders" },
          { label: "PRO GEBRUIKERS", value: stats.proUsers, change: `€${stats.mrr} MRR` },
          { label: "MATCH RATE", value: `${stats.matchRate}%`, change: "wederzijds" },
          { label: "BERICHTEN", value: stats.totalMessages, change: "totaal" },
          { label: "POSTS", value: stats.totalPosts, change: "gepubliceerd" },
          { label: "EVENTS", value: stats.totalEvents, change: "gepubliceerd" },
          { label: "MRR", value: `€${stats.mrr}`, change: `${stats.proUsers} × €9` },
        ].map(({ label, value, change }) => (
          <Card key={label} hover={false}>
            <CardBody className="p-5">
              <p className="text-[10px] font-bold tracking-widest text-outline mb-2">{label}</p>
              <p className="text-3xl font-black text-on-surface">{value}</p>
              <p className="text-xs text-outline mt-1">{change}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-caps text-on-surface">GROEI INDICATOREN</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <MetricBar label="Conversie Basis → Pro" value={stats.totalUsers > 0 ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0} target={15} />
            <MetricBar label="Match rate" value={stats.matchRate} target={40} />
            <MetricBar label="Profiel activatie (actief/totaal)" value={stats.totalUsers > 0 ? Math.round((stats.activeUsersThisWeek / stats.totalUsers) * 100) : 0} target={30} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricBar({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, value);
  const targetPct = Math.min(100, target);
  const isGood = value >= target;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-on-surface-variant">{label}</span>
        <span className={`font-bold ${isGood ? "text-primary" : "text-on-surface"}`}>
          {value}% <span className="text-outline font-normal">/ doel: {target}%</span>
        </span>
      </div>
      <div className="relative h-2 bg-surface-container">
        <div
          className={`absolute h-2 transition-all ${isGood ? "bg-primary" : "bg-on-surface"}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-outline/40"
          style={{ left: `${targetPct}%` }}
        />
      </div>
    </div>
  );
}
