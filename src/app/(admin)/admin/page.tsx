import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CalendarDays,
  Euro,
  FileText,
  GraduationCap,
  Handshake,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/trpc/server";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Beheer — dashboard" };

export default async function AdminDashboardPage() {
  const [stats, system] = await Promise.all([
    api.admin.analytics(),
    api.admin.systemStatus(),
  ]);

  // Wat nu actie vraagt, bovenaan: een beheerder wil eerst weten wat er brandt.
  const actions = [
    ...(system.problems.length > 0
      ? [
          {
            href: "/admin/systeem",
            text: `${system.problems.length} geplande taak/taken met een probleem`,
          },
        ]
      : []),
    ...(system.queue.pendingReports > 0
      ? [
          {
            href: "/admin/content",
            text: `${system.queue.pendingReports} openstaande melding(en)`,
          },
        ]
      : []),
    ...(system.queue.pendingDeletion > 0
      ? [
          {
            href: "/admin/gdpr",
            text: `${system.queue.pendingDeletion} verwijderverzoek(en)`,
          },
        ]
      : []),
    ...(system.queue.pastDueMemberships > 0
      ? [
          {
            href: "/admin/gebruikers",
            text: `${system.queue.pastDueMemberships} lidmaatschap(pen) met achterstallige betaling`,
          },
        ]
      : []),
  ];

  const avgPerClub =
    stats.totalCohorts > 0
      ? Math.round((stats.totalCohortMembers / stats.totalCohorts) * 10) / 10
      : 0;

  const cards = [
    {
      label: `Totaal gebruikers · +${stats.newUsersThisMonth} deze maand`,
      value: stats.totalUsers,
      icon: <Users size={18} />,
      tone: "primary" as const,
    },
    {
      label: "Match rate · wederzijds geïnteresseerd",
      value: `${stats.matchRate}%`,
      icon: <Handshake size={18} />,
      tone: "primary" as const,
    },
    {
      label: "Actief deze week · unieke gebruikers",
      value: stats.activeUsersThisWeek,
      icon: <TrendingUp size={18} />,
      tone: "tertiary" as const,
    },
    {
      label: "Pro-gebruikers · actieve abonnementen",
      value: stats.proUsers,
      icon: <Sparkles size={18} />,
      tone: "primary" as const,
    },
    {
      label: "MRR · maandelijkse omzet",
      value: `€${stats.mrr}`,
      icon: <Euro size={18} />,
      tone: "tertiary" as const,
    },
    {
      label: "Berichten · totaal verzonden",
      value: stats.totalMessages,
      icon: <MessageCircle size={18} />,
      tone: "neutral" as const,
    },
    {
      label: "Posts · gepubliceerde artikelen",
      value: stats.totalPosts,
      icon: <FileText size={18} />,
      tone: "neutral" as const,
    },
    {
      label: "Events · gepubliceerd",
      value: stats.totalEvents,
      icon: <CalendarDays size={18} />,
      tone: "neutral" as const,
    },
    {
      label: `Cohorten · ${stats.totalCohortMembers} leden (gem. ${avgPerClub})`,
      value: stats.totalCohorts,
      icon: <GraduationCap size={18} />,
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Beheer"
        title="Platformoverzicht"
        description="De belangrijkste cijfers in één oogopslag"
        className="mb-0"
      />
      {actions.length === 0 ? (
        <p className="bg-tertiary/10 text-tertiary text-title-md flex items-center gap-2 rounded-2xl p-4">
          <CircleCheck size={20} /> Niets wacht op je. Alles draait.
        </p>
      ) : (
        <section aria-label="Vraagt actie" className="flex flex-col gap-2">
          {actions.map((a) => (
            <Link
              key={a.href + a.text}
              href={a.href}
              className="bg-error-container text-on-error-container text-label-lg flex items-center justify-between gap-3 rounded-2xl p-4"
            >
              {a.text}
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ label, value, icon, tone }) => (
          <StatCard
            key={label}
            value={value}
            label={label}
            icon={icon}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}
