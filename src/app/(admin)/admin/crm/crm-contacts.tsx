"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SECTOREN, REGIO_S, FASEN } from "@/lib/constants";
import { formatRelative } from "@/lib/date-utils";

export const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  engaged: "Betrokken",
  customer: "Klant",
  churned: "Verloren",
};

const STAGES = ["lead", "engaged", "customer", "churned"] as const;
const SUBS = [
  { value: "active", label: "Pro actief" },
  { value: "none", label: "Gratis" },
  { value: "past_due", label: "Achterstallig" },
  { value: "canceled", label: "Opgezegd" },
] as const;

export function CrmContacts() {
  const [filters, setFilters] = useState<{
    search: string;
    sector?: string | undefined;
    regio?: string | undefined;
    fase?: "starter" | "groei" | "scale" | undefined;
    subscriptionStatus?:
      | "none"
      | "active"
      | "past_due"
      | "canceled"
      | undefined;
    stage?: (typeof STAGES)[number] | undefined;
  }>({ search: "" });

  const contacts = trpc.crm.contacts.useQuery({
    ...filters,
    search: filters.search || undefined,
    limit: 100,
  });

  const set = (patch: Partial<typeof filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card hover={false}>
        <CardBody className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
          <input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Zoek naam/e-mail"
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 col-span-2 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px] lg:col-span-2"
          />
          <select
            value={filters.stage ?? ""}
            onChange={(e) =>
              set({
                stage: (e.target.value || undefined) as typeof filters.stage,
              })
            }
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px]"
          >
            <option value="">Alle fases</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            value={filters.subscriptionStatus ?? ""}
            onChange={(e) =>
              set({
                subscriptionStatus: (e.target.value ||
                  undefined) as typeof filters.subscriptionStatus,
              })
            }
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px]"
          >
            <option value="">Alle abonnementen</option>
            {SUBS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.sector ?? ""}
            onChange={(e) => set({ sector: e.target.value || undefined })}
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px]"
          >
            <option value="">Alle sectoren</option>
            {SECTOREN.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.regio ?? ""}
            onChange={(e) => set({ regio: e.target.value || undefined })}
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px]"
          >
            <option value="">Alle regio&apos;s</option>
            {REGIO_S.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={filters.fase ?? ""}
            onChange={(e) =>
              set({
                fase: (e.target.value || undefined) as typeof filters.fase,
              })
            }
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 rounded-xl border border-transparent px-4 py-3 pb-2 text-sm outline-none focus:ring-[3px]"
          >
            <option value="">Alle stadia</option>
            {FASEN.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      {/* Results */}
      <Card hover={false}>
        <CardBody className="p-0">
          {contacts.isLoading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : !contacts.data?.length ? (
            <p className="text-secondary p-8 text-sm">
              Geen contacten gevonden.
            </p>
          ) : (
            <>
              <p className="text-secondary px-4 pt-4 text-xs">
                {contacts.data.length} contacten
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-hairline border-b text-left">
                    <th className="text-secondary text-label-sm p-4 uppercase">
                      Naam
                    </th>
                    <th className="text-secondary text-label-sm p-4 uppercase">
                      Sector / regio
                    </th>
                    <th className="text-secondary text-label-sm p-4 uppercase">
                      Abonnement
                    </th>
                    <th className="text-secondary text-label-sm p-4 uppercase">
                      Fase
                    </th>
                    <th className="text-secondary text-label-sm p-4 uppercase">
                      Laatste contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.data.map((c) => (
                    <tr
                      key={c.id}
                      className="border-hairline/50 hover:bg-surface-container-low border-b last:border-0"
                    >
                      <td className="p-4">
                        <Link
                          href={`/admin/crm/${c.id}`}
                          className="text-on-surface font-semibold hover:underline"
                        >
                          {c.naam ?? c.name ?? "—"}
                        </Link>
                        <p className="text-secondary text-xs">{c.email}</p>
                      </td>
                      <td className="text-on-surface-variant p-4 text-xs">
                        {c.sector ?? "—"}
                        <br />
                        {c.regio ?? ""}
                      </td>
                      <td className="p-4">
                        {c.subscriptionStatus === "active" ? (
                          <Badge variant="primary" size="sm">
                            Pro
                          </Badge>
                        ) : (
                          <span className="text-secondary text-xs">
                            {c.subscriptionStatus}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="default" size="sm">
                          {STAGE_LABEL[c.crmStage] ?? c.crmStage}
                        </Badge>
                      </td>
                      <td className="text-secondary p-4 text-xs">
                        {c.crmLastContactedAt
                          ? formatRelative(c.crmLastContactedAt)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
