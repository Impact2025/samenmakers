import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, User, CreditCard, Bell, Shield } from "lucide-react";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Instellingen" };

export default async function InstellingenPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  const isPro = me?.subscriptionStatus === "active";

  const settingsSections = [
    {
      icon: User,
      label: "Profiel bewerken",
      description: "Naam, bio, foto en meer",
      href: "/profiel/bewerken",
    },
    {
      icon: CreditCard,
      label: "Abonnement",
      description: isPro ? "Pro — actief" : "Basis — gratis",
      href: "/instellingen/abonnement",
      badge: isPro ? "Pro" : undefined,
    },
    {
      icon: Bell,
      label: "Meldingen & updates",
      description: "E-mail en push-instellingen",
      href: "/instellingen/notificaties",
    },
    {
      icon: Shield,
      label: "Privacy & beveiliging",
      description: "Profielzichtbaarheid, geblokkeerde gebruikers",
      href: "/instellingen/privacy",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Instellingen"
        description="Beheer je account en voorkeuren"
        className="mb-0"
      />

      <div className="bg-surface-container-lowest shadow-card flex items-center gap-3 rounded-2xl p-4">
        <Avatar
          src={me?.avatarUrl}
          naam={me?.naam ?? me?.name ?? "?"}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-title-md text-on-surface truncate">
            {me?.naam ?? me?.name}
          </p>
          <p className="text-body-sm text-secondary truncate">{me?.email}</p>
        </div>
        {isPro && (
          <span className="bg-primary-fixed text-label-sm text-on-primary-fixed-variant rounded-full px-3 py-1 uppercase">
            Pro
          </span>
        )}
      </div>

      <div className="bg-surface-container-lowest shadow-card flex flex-col gap-1 rounded-2xl p-1.5">
        {settingsSections.map(
          ({ icon: Icon, label, description, href, badge }) => (
            <Link
              key={href}
              href={href}
              className="hover:bg-surface-container-low flex items-center gap-3 rounded-xl px-3 py-3 transition-colors"
            >
              <span className="bg-surface-container text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-label-lg text-on-surface">{label}</p>
                <p className="text-body-sm text-secondary">{description}</p>
              </div>
              {badge && (
                <span className="bg-primary-fixed text-label-sm text-on-primary-fixed-variant rounded-full px-2 py-0.5 uppercase">
                  {badge}
                </span>
              )}
              <ChevronRight size={18} className="text-secondary shrink-0" />
            </Link>
          ),
        )}
      </div>

      <SignOutButton />
    </div>
  );
}
