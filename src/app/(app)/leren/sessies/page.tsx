import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatDateTime } from "@/lib/date-utils";
import { PHASE_LABEL } from "@/lib/session-cycle";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sessies" };

export default async function AlleSessiesPage() {
  if (!features.leren) notFound();
  const { teaching } = await api.learning.home();

  const perEditie = await Promise.all(
    teaching.map(async (e) => ({
      edition: e,
      sessions: await api.sessions.list({ cohortId: e.cohort.id }),
    })),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = perEditie
    .flatMap(({ edition, sessions }) =>
      sessions
        .filter((s) => s.startsAt >= startOfToday)
        .map((s) => ({ edition, s })),
    )
    .sort((a, b) => a.s.startsAt.getTime() - b.s.startsAt.getTime());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Programmadagen"
        title="Sessies"
        description="Alle komende sessies van de edities die je begeleidt."
        className="mb-0"
      />

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="Geen komende sessies"
          description="Plan een sessie via een editie hieronder."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {upcoming.map(({ edition, s }) => (
            <li key={s.id}>
              <Link
                href={`/leren/${edition.cohort.id}/sessies`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-1 rounded-2xl p-4 transition-shadow"
              >
                <span className="text-label-sm text-secondary uppercase">
                  {edition.program.name} · {edition.cohort.name}
                </span>
                <span className="text-title-md text-on-surface">{s.title}</span>
                <span className="text-body-sm text-secondary">
                  {formatDateTime(s.startsAt)}
                  {s.location ? ` · ${s.location}` : ""}
                  {" · "}
                  {PHASE_LABEL[s.phase]}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <section>
        <h2 className="text-headline-sm text-on-surface mb-3">
          Sessies per editie
        </h2>
        <div className="flex flex-wrap gap-2">
          {teaching.map((e) => (
            <Link
              key={e.membershipId}
              href={`/leren/${e.cohort.id}/sessies`}
              className={buttonClasses("secondary", "md")}
            >
              {e.cohort.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
