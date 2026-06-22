import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PRO_FEATURES } from "@/lib/constants";
import { StripeButton } from "./stripe-button";
import { CheckoutWithCoupon } from "./checkout-with-coupon";
import { SubscriptionRefresh } from "./subscription-refresh";

export const metadata: Metadata = { title: "Abonnement" };

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function AbonnementPage({ searchParams }: Props) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  const isPro = me?.subscriptionStatus === "active";
  const justUpgraded = params.success === "1";

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <p className="text-label-caps text-outline mb-1">INSTELLINGEN</p>
        <h1 className="text-headline-md text-on-surface">Abonnement</h1>
      </div>

      {justUpgraded && <SubscriptionRefresh />}

      {justUpgraded && (
        <div className="border border-primary/30 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-primary" />
            <p className="font-bold text-on-surface">Welkom bij Pro!</p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Je abonnement is actief. Alle Pro-functies zijn nu beschikbaar.
          </p>
        </div>
      )}

      {isPro ? (
        <Card hover={false}>
          <CardBody className="text-center py-10">
            <Badge variant="primary" className="mb-4">PRO ACTIEF</Badge>
            <p className="text-headline-sm text-on-surface mb-2">Je bent Pro-lid</p>
            <p className="text-body text-on-surface-variant mb-6">
              Je hebt toegang tot alle premium functies van Samenmakers.
            </p>
            <StripeButton action="portal" />
          </CardBody>
        </Card>
      ) : (
        <>
          <Card hover={false}>
            <CardBody>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-on-surface">€9</span>
                <span className="text-on-surface-variant">/maand</span>
                <Badge variant="default" className="ml-2">Pro</Badge>
              </div>
              <p className="text-body-sm text-outline mb-4">Maandelijks opzegbaar</p>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span className="text-body-sm text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>
              <CheckoutWithCoupon />
            </CardBody>
          </Card>

          <Card hover={false}>
            <CardBody>
              <h3 className="text-label-caps text-outline mb-3">BASIS — GRATIS</h3>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li>✓ Profiel aanmaken</li>
                <li>✓ 20 swipes per dag</li>
                <li>✓ Matches bekijken</li>
                <li>✓ Chatten met matches</li>
                <li>✓ Events bekijken</li>
                <li>✓ Kennisbank lezen</li>
                <li>✓ Vragen stellen</li>
              </ul>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
