import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Lock } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { formatEuro } from "@/server/events/pricing";
import { MembershipPanel } from "./membership-panel";

export const metadata: Metadata = { title: "Lidmaatschap" };

interface Props {
  searchParams: Promise<{ success?: string }>;
}

export default async function LidmaatschapPage({ searchParams }: Props) {
  const { success } = await searchParams;
  const o = await api.membership.overview();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Alumni"
        title="Jaarlidmaatschap"
        description="Blijf verbonden met het alumninetwerk en kom gratis binnen bij de meeste events."
        className="mb-0"
      />

      {success && !o.isMember && (
        <p
          role="status"
          className="text-body-md text-on-surface bg-surface-container-lowest shadow-card rounded-2xl p-4"
        >
          Bedankt! Je betaling wordt verwerkt. Je lidmaatschap is binnen een
          paar minuten actief.
        </p>
      )}

      {o.isMember ? (
        <section className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
          <h2 className="text-title-md text-on-surface">Je bent lid</h2>
          <p className="text-body-md text-secondary mt-1">
            {o.membership?.currentPeriodEnd
              ? `Je lidmaatschap loopt tot ${formatDate(o.membership.currentPeriodEnd)} en verlengt automatisch.`
              : "Je lidmaatschap is actief."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/events" className={buttonClasses("primary", "md")}>
              <CalendarCheck size={16} /> Bekijk events
            </Link>
            <Link
              href="/instellingen/abonnement"
              className={buttonClasses("secondary", "md")}
            >
              Betaling beheren
            </Link>
          </div>
        </section>
      ) : o.canBuy ? (
        <MembershipPanel
          priceLabel={formatEuro(o.priceCents)}
          pastDue={o.membership?.status === "past_due"}
        />
      ) : (
        <EmptyState
          icon={<Lock size={22} />}
          title="Het lidmaatschap is er voor alumni"
          description={`Na afronding van de leergang kun je lid worden voor ${formatEuro(o.priceCents)} per jaar. Tot die tijd kun je per event een ticket kopen.`}
          action={
            <Link href="/events" className={buttonClasses("tonal", "sm")}>
              Bekijk events
            </Link>
          }
        />
      )}
    </div>
  );
}
