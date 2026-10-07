import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { COHORT_ROLE_LABELS, COHORT_STATUS_LABELS } from "@/lib/learning";
import { DocentForm } from "./docent-form";

export const metadata: Metadata = { title: "Beheer — docenten" };

export default async function DocentenPage() {
  const cohorts = await api.programs.staffOverview();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        label="Onderwijs"
        title="Docenten"
        description="Nodig een docent uit en koppel die aan een editie. Heeft iemand nog geen account, dan krijgt die automatisch een uitnodiging per e-mail."
        className="mb-0"
      />

      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <h2 className="text-headline-sm text-on-surface">Docent uitnodigen</h2>
        <DocentForm
          cohorts={cohorts.map((c) => ({
            id: c.id,
            label: `${c.programName} — ${c.name}`,
          }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-sm text-on-surface">
          Huidige docenten per editie
        </h2>
        {cohorts.length === 0 ? (
          <p className="text-body-md text-secondary">Nog geen edities.</p>
        ) : (
          cohorts.map((c) => (
            <div
              key={c.id}
              className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <GraduationCap
                    size={18}
                    className="text-primary-container shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-title-md text-on-surface truncate">
                      {c.name}
                    </p>
                    <p className="text-body-sm text-secondary truncate">
                      {c.programName} ·{" "}
                      {COHORT_STATUS_LABELS[c.status] ?? c.status}
                    </p>
                  </div>
                </div>
                {c.programId && (
                  <Link
                    href={`/admin/programmas/${c.programId}/editie/${c.id}`}
                    className="text-label-md text-primary-container shrink-0 hover:underline"
                  >
                    Editie beheren
                  </Link>
                )}
              </div>

              {c.staff.length === 0 ? (
                <p className="text-body-sm text-secondary">
                  Nog geen docent gekoppeld.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {c.staff.map((s) => (
                    <li
                      key={s.id}
                      className="bg-surface-container-low flex items-center gap-3 rounded-xl p-2.5"
                    >
                      <Avatar src={s.avatarUrl} naam={s.naam} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-label-lg text-on-surface truncate">
                          {s.naam}
                        </p>
                        <p className="text-body-sm text-secondary truncate">
                          {s.email}
                        </p>
                      </div>
                      <span className="bg-primary-fixed text-on-primary-fixed text-label-sm rounded-full px-2.5 py-1 uppercase">
                        {COHORT_ROLE_LABELS[s.role] ?? s.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
