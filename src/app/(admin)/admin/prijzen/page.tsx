import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { PriceManager } from "./price-manager";

export const metadata: Metadata = { title: "Admin — Prijzen" };

export default async function AdminPrijzenPage() {
  const prices = await api.admin.prices();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg text-on-surface">Prijzen</h1>
        <p className="text-secondary mt-1 text-sm">
          Jaarlidmaatschap voor alumni en de standaardprijs per event
        </p>
      </div>
      <PriceManager
        membershipCents={prices.membershipCents}
        eventCents={prices.eventCents}
        activeMembers={prices.activeMembers}
      />
    </div>
  );
}
