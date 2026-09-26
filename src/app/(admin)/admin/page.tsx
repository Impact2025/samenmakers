import type { Metadata } from "next";
import {
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
  const stats = await api.admin.analytics();

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
