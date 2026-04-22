import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, CreditCard, Bell, Shield, LogOut } from "lucide-react";
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
      description: me?.subscriptionStatus === "active" ? "Pro — actief" : "Basis — gratis",
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
        <p className="text-label-caps text-outline mb-1">ACCOUNT</p>
        <h1 className="text-headline-md text-on-surface">Instellingen</h1>
      </div>

      <Card hover={false}>
        <CardBody className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-on-surface">{me?.naam ?? me?.name}</p>
            <p className="text-body-sm text-outline">{me?.email}</p>
          </div>
          {me?.subscriptionStatus === "active" && (
            <Badge variant="primary">PRO</Badge>
          )}
        </CardBody>
      </Card>

      <div className="border border-hairline bg-white divide-y divide-hairline">
        {settingsSections.map(({ icon: Icon, label, description, href, badge }) => (
          <Link key={href} href={href} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors">
            <Icon size={18} className="text-outline shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface text-sm">{label}</p>
              <p className="text-xs text-outline mt-0.5">{description}</p>
            </div>
            {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
            <ChevronRight size={16} className="text-outline shrink-0" />
          </Link>
        ))}
      </div>

      <SignOutButton />
    </div>
  );
}
