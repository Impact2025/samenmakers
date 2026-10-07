import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelative } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Systeem — Admin" };
export const dynamic = "force-dynamic";

const KIND_LABEL = {
  mislukt: "Mislukt",
  "te-laat": "Te laat",
  "nooit-gedraaid": "Nog niet gedraaid",
} as const;

export default async function SysteemPage() {
  const s = await api.admin.systemStatus();
  const healthy = s.problems.length === 0;
  const card = "bg-surface-container-lowest shadow-card rounded-2xl p-5";
  const tile =
    "bg-surface-container-low hover:bg-surface-container rounded-xl p-4";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Beheer"
        title="Systeem"
        description="Draaien de geplande taken en wat vraagt nu aandacht?"
        className="mb-0"
      />

      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl p-4",
          healthy
            ? "bg-tertiary/10 text-tertiary"
            : "bg-error-container text-on-error-container",
        )}
      >
        {healthy ? <CircleCheck size={22} /> : <CircleAlert size={22} />}
        <p className="text-title-md">
          {healthy
            ? "Alle geplande taken draaien zoals verwacht."
            : `${s.problems.length} taak/taken met een probleem.`}
        </p>
      </div>

      <section className={card}>
        <h2 className="text-headline-sm text-on-surface mb-3">
          Geplande taken
        </h2>
        <ul className="divide-hairline divide-y">
          {s.jobs.map((j) => (
            <li key={j.name} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  j.problem ? "bg-error" : "bg-tertiary",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-label-lg text-on-surface">{j.name}</p>
                <p className="text-body-sm text-secondary">
                  {j.last
                    ? `Laatste run ${formatRelative(new Date(j.last.startedAt))} · ${j.last.durationMs} ms`
                    : "Nog geen run geregistreerd"}
                </p>
                {j.problem && (
                  <p className="text-body-sm text-error">
                    {KIND_LABEL[j.problem.kind]}: {j.problem.detail}
                  </p>
                )}
              </div>
              <span className="text-label-sm text-secondary shrink-0">
                max {j.maxAgeHours}u
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-headline-sm text-on-surface mb-3">
          Wacht op actie
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/content" className={tile}>
            <p className="text-display-lg text-on-surface">
              {s.queue.pendingReports}
            </p>
            <p className="text-body-sm text-secondary">Openstaande meldingen</p>
          </Link>
          <Link href="/admin/gdpr" className={tile}>
            <p className="text-display-lg text-on-surface">
              {s.queue.pendingDeletion}
            </p>
            <p className="text-body-sm text-secondary">Verwijderverzoeken</p>
          </Link>
          <Link href="/admin/gebruikers" className={tile}>
            <p className="text-display-lg text-on-surface">
              {s.queue.pastDueMemberships}
            </p>
            <p className="text-body-sm text-secondary">
              Betaling achterstallig
            </p>
          </Link>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-headline-sm text-on-surface mb-3">
          Recente fouten
        </h2>
        {s.failures.length === 0 ? (
          <p className="text-body-md text-secondary">
            Geen fouten in de afgelopen 9 dagen.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {s.failures.map((f, i) => (
              <li key={i} className="bg-error-container/40 rounded-xl p-3">
                <p className="text-label-lg text-on-surface">
                  {f.job} · {formatRelative(new Date(f.startedAt))}
                </p>
                <p className="text-body-sm text-secondary break-words">
                  {f.error}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-label-sm text-secondary">
        Meer: Vercel → Logs voor details, Sentry voor fouten in de app, de
        uptime-monitor op /api/health voor beschikbaarheid.
      </p>
    </div>
  );
}
