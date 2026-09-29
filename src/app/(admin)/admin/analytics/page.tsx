import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const [stats, members] = await Promise.all([
    api.admin.analytics(),
    api.admin.membership(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-headline-lg text-on-surface">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Totaal gebruikers",
            value: stats.totalUsers,
            change: `+${stats.newUsersThisMonth} (30d)`,
          },
          {
            label: "Actief deze week",
            value: stats.activeUsersThisWeek,
            change: "unieke senders",
          },
          {
            label: "PRO gebruikers",
            value: stats.proUsers,
            change: `€${stats.mrr} MRR`,
          },
          {
            label: "Match rate",
            value: `${stats.matchRate}%`,
            change: "wederzijds",
          },
          { label: "Berichten", value: stats.totalMessages, change: "totaal" },
          { label: "Posts", value: stats.totalPosts, change: "gepubliceerd" },
          { label: "Events", value: stats.totalEvents, change: "gepubliceerd" },
          {
            label: "MRR",
            value: `€${stats.mrr}`,
            change: `${stats.proUsers} × €9`,
          },
        ].map(({ label, value, change }) => (
          <Card key={label} hover={false}>
            <CardBody className="p-5">
              <p className="text-secondary text-label-sm uppercase">{label}</p>
              <p className="text-display-lg text-on-surface">{value}</p>
              <p className="text-secondary mt-1 text-xs">{change}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-headline-sm text-on-surface">
          Leden, logins en activiteit
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Accounts", value: members.accounts },
            { label: "Cursisten", value: members.cursisten },
            { label: "Docenten", value: members.docenten },
            { label: "Facilitators", value: members.facilitators },
            { label: "Alumni", value: members.alumni },
          ].map(({ label, value }) => (
            <Card key={label} hover={false}>
              <CardBody className="p-5">
                <p className="text-secondary text-label-sm uppercase">
                  {label}
                </p>
                <p className="text-display-lg text-on-surface">{value}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            {
              label: "Logins 7 dagen",
              value: members.logins7.total,
              change: `${members.logins7.unique} unieke leden`,
            },
            {
              label: "Logins 30 dagen",
              value: members.logins30.total,
              change: `${members.logins30.unique} unieke leden`,
            },
            {
              label: "Inleveringen",
              value: members.submissions7,
              change: "afgelopen 7 dagen",
            },
            {
              label: "Klasberichten",
              value: members.feedPosts7,
              change: "afgelopen 7 dagen",
            },
            {
              label: "Chatberichten",
              value: members.messages7,
              change: "afgelopen 7 dagen",
            },
          ].map(({ label, value, change }) => (
            <Card key={label} hover={false}>
              <CardBody className="p-5">
                <p className="text-secondary text-label-sm uppercase">
                  {label}
                </p>
                <p className="text-display-lg text-on-surface">{value}</p>
                <p className="text-secondary mt-1 text-xs">{change}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <p className="text-body-sm text-secondary">
          Logins worden geteld vanaf de livegang van deze functie.
        </p>
      </section>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-headline-sm text-on-surface">
            Groei indicatoren
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <MetricBar
              label="Conversie Basis → Pro"
              value={
                stats.totalUsers > 0
                  ? Math.round((stats.proUsers / stats.totalUsers) * 100)
                  : 0
              }
              target={15}
            />
            <MetricBar label="Match rate" value={stats.matchRate} target={40} />
            <MetricBar
              label="Profiel activatie (actief/totaal)"
              value={
                stats.totalUsers > 0
                  ? Math.round(
                      (stats.activeUsersThisWeek / stats.totalUsers) * 100,
                    )
                  : 0
              }
              target={30}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricBar({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const pct = Math.min(100, value);
  const targetPct = Math.min(100, target);
  const isGood = value >= target;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span
          className={`font-bold ${isGood ? "text-primary" : "text-on-surface"}`}
        >
          {value}%{" "}
          <span className="text-secondary font-normal">/ doel: {target}%</span>
        </span>
      </div>
      <div className="bg-surface-container relative h-2">
        <div
          className={`absolute h-2 transition-all ${isGood ? "bg-primary" : "bg-on-surface"}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="bg-outline/40 absolute top-0 bottom-0 w-0.5"
          style={{ left: `${targetPct}%` }}
        />
      </div>
    </div>
  );
}
