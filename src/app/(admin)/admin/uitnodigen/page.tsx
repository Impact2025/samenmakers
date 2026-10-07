import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Beheer — uitnodigen" };

export default async function UitnodigenPage() {
  const cohorts = await api.programs.staffOverview();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        label="Leden"
        title="Persoon uitnodigen"
        description="Nodig iemand uit die nog geen lid is. Zonder editie wordt de persoon gewoon lid van het platform. Kies je een editie, dan krijgt de persoon meteen een rol daarin. De uitnodiging bevat een link om een wachtwoord te kiezen (7 dagen geldig)."
        className="mb-0"
      />
      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <InviteForm
          cohorts={cohorts.map((c) => ({
            id: c.id,
            label: `${c.programName} — ${c.name}`,
          }))}
        />
      </section>
    </div>
  );
}
