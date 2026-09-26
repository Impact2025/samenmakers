import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, CreditCard, Bell, Shield } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Instellingen" };

export default async function InstellingenPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();

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
      description:
        me?.subscriptionStatus === "active" ? "Pro — actief" : "Basis — gratis",
      href: "/instellingen/abonnement",
      badge: me?.subscriptionStatus === "active" ? "PRO" : undefined,
    },
    {
      icon: Bell,
      label: "Notificaties",
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
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-label-md text-secondary mb-1">Account</p>
        <h1 className="text-headline-lg text-on-surface">Instellingen</h1>
      </div>

      <Card hover={false}>
        <CardBody className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-on-surface font-semibold">
              {me?.naam ?? me?.name}
            </p>
            <p className="text-body-md text-secondary">{me?.email}</p>
          </div>
          {me?.subscriptionStatus === "active" && (
            <Badge variant="primary">PRO</Badge>
          )}
        </CardBody>
      </Card>

      <div className="divide-hairline bg-surface-container-lowest shadow-card divide-y rounded-2xl">
        {settingsSections.map(
          ({ icon: Icon, label, description, href, badge }) => (
            <Link
              key={href}
              href={href}
              className="hover:bg-surface-container-low flex items-center gap-4 px-5 py-4 transition-colors"
            >
              <Icon size={18} className="text-secondary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-on-surface text-sm font-semibold">{label}</p>
                <p className="text-secondary mt-0.5 text-xs">{description}</p>
              </div>
              {badge && (
                <Badge variant="primary" size="sm">
                  {badge}
                </Badge>
              )}
              <ChevronRight size={16} className="text-secondary shrink-0" />
            </Link>
          ),
        )}
      </div>

      <SignOutButton />
    </div>
  );
}
