import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatRelative } from "@/lib/date-utils";
import { COHORT_ROLE_LABELS } from "@/lib/learning";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/learning/progress-bar";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Cursistoverzicht" };

const STATUS_LABELS: Record<string, string> = {
  actief: "Actief",
  gepauzeerd: "Gepauzeerd",
  afgerond: "Afgerond",
  uitgeschreven: "Uitgeschreven",
};

export default async function DeelnemersPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const data = await api.learning
    .participants({ cohortId })
    .catch((e: unknown) => {
      if (
        e instanceof TRPCError &&
        (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
      )
        notFound();
      throw e;
    });
  const atRisk = data.learners.filter((l) => l.atRisk).length;
  const avg = data.learners.length
    ? Math.round(
        data.learners.reduce((s, l) => s + l.progress.percent, 0) /
          data.learners.length,
      )
    : 0;

  return (
    <div className="space-y-10">
      <Link
        href={`/leren/${cohortId}`}
        className="text-label-md text-secondary hover:text-on-surface inline-flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Leerpad
      </Link>

      <header>
        <p className="text-label-md text-primary-container mb-2">
          {data.program.name}
        </p>
        <h1 className="text-headline-lg text-on-surface">
          Cursisten · {data.cohort.name}
        </h1>
        {data.staff.length > 0 && (
          <p className="text-body-md text-secondary mt-2">
            Begeleiding:{" "}
            {data.staff
              .map(
                (s) =>
                  `${s.naam} (${COHORT_ROLE_LABELS[s.role]?.toLowerCase()})`,
              )
              .join(", ")}
          </p>
        )}
      </header>

      <dl className="bg-surface-container-lowest shadow-card grid grid-cols-3 rounded-2xl">
        <Stat label="Cursisten" value={data.learners.length} />
        <Stat label="Gem. voortgang" value={`${avg}%`} />
        <Stat label="Dreigt uit te vallen" value={atRisk} warn={atRisk > 0} />
      </dl>

      {data.learners.length === 0 ? (
        <p className="text-body-md text-secondary">
          Nog geen cursisten in deze editie.
        </p>
      ) : (
        <div className="bg-surface-container-lowest shadow-card overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-left">
            <thead className="hairline-b">
              <tr className="text-label-md text-secondary">
                <th className="p-4 font-semibold">Cursist</th>
                <th className="p-4 font-semibold">Voortgang</th>
                <th className="p-4 font-semibold">Laatste activiteit</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.learners.map((l) => (
                <tr key={l.membershipId} className="hairline-b last:border-b-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={l.avatarUrl} naam={l.naam} size="xs" />
                      <span className="text-body-md text-on-surface">
                        {l.naam}
                      </span>
                    </div>
                  </td>
                  <td className="w-48 p-4">
                    <ProgressBar
                      percent={l.progress.percent}
                      color={data.program.color}
                      label={`Voortgang ${l.naam}`}
                    />
                    <p className="text-body-md text-secondary mt-1">
                      {l.progress.done}/{l.progress.total} ·{" "}
                      {l.progress.percent}%
                    </p>
                  </td>
                  <td className="text-body-md text-on-surface-variant p-4">
                    {l.lastActivity
                      ? formatRelative(l.lastActivity)
                      : "Nog niet gestart"}
                  </td>
                  <td className="p-4">
                    {l.atRisk ? (
                      <span className="text-label-md text-error inline-flex items-center gap-1">
                        <TriangleAlert size={12} /> Dreigt uit te vallen
                      </span>
                    ) : (
                      <span className="text-body-md text-on-surface-variant">
                        {STATUS_LABELS[l.status]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-body-md text-secondary">
        &ldquo;Dreigt uit te vallen&rdquo;: actieve cursist zonder lesactiviteit
        in de afgelopen 14 dagen.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
}) {
  return (
    <div className="hairline-r p-5 last:border-r-0">
      <dt className="text-label-md text-secondary">{label}</dt>
      <dd
        className={`text-headline-md mt-2 ${warn ? "text-error" : "text-on-surface"}`}
      >
        {value}
      </dd>
    </div>
  );
}
