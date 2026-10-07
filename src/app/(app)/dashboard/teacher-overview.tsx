import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  GraduationCap,
  Users,
  Video,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/learning/progress-bar";
import { COHORT_ROLE_LABELS } from "@/lib/learning";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { SIGNAL_LABEL } from "@/lib/teaching";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

export type TeachingEditions =
  inferRouterOutputs<AppRouter>["teaching"]["overview"];

const dateTime = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

function Stat({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone?: "warn" | "ok" | undefined;
}) {
  return (
    <div className="bg-surface-container-low flex flex-col rounded-xl p-3">
      <span
        className={cn(
          "text-headline-md",
          tone === "warn"
            ? "text-error"
            : tone === "ok"
              ? "text-tertiary"
              : "text-on-surface",
        )}
      >
        {value}
      </span>
      <span className="text-body-sm text-secondary">{label}</span>
    </div>
  );
}

export function TeacherOverview({ editions }: { editions: TeachingEditions }) {
  if (editions.length === 0) return null;

  return (
    <section aria-label="Mijn edities">
      <SectionHeader
        title="Mijn edities"
        subtitle="Overzicht van de groepen die je begeleidt"
        icon={<GraduationCap size={18} />}
        viewAllHref="/leren"
        viewAllLabel="Alles"
      />
      <div className="flex flex-col gap-3">
        {editions.map((e) => {
          const needAttention = e.counts.achter + e.counts.inactief;
          return (
            <article
              key={e.cohort.id}
              className="bg-surface-container-lowest shadow-elevated flex flex-col gap-4 rounded-2xl p-5"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="text-on-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: e.program.color }}
                  >
                    <GraduationCap size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-title-md text-on-surface truncate">
                      {e.program.name}
                    </h3>
                    <p className="text-body-sm text-secondary truncate">
                      {e.cohort.name}
                      {e.currentModule ? ` · nu: ${e.currentModule}` : ""}
                    </p>
                  </div>
                </div>
                <span className="bg-surface-container text-label-sm text-secondary shrink-0 rounded-full px-2.5 py-1 uppercase">
                  {COHORT_ROLE_LABELS[e.role] ?? "Docent"}
                </span>
              </header>

              <div className="grid grid-cols-3 gap-2">
                <Stat value={e.learnerCount} label="Cursisten" />
                <Stat
                  value={`${e.avgPercent}%`}
                  label="Gem. voortgang"
                  tone="ok"
                />
                <Stat
                  value={needAttention}
                  label="Aandacht nodig"
                  tone={needAttention > 0 ? "warn" : undefined}
                />
              </div>

              <ProgressBar
                percent={e.avgPercent}
                label={`Gemiddelde voortgang ${e.cohort.name}`}
              />

              {e.nextLive && (
                <div className="bg-primary-fixed/40 flex items-center gap-3 rounded-xl p-3">
                  <span className="bg-surface-container-lowest text-primary-container shadow-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <CalendarClock size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-label-sm text-on-primary-fixed-variant uppercase">
                      Volgende live sessie
                    </p>
                    <p className="text-label-lg text-on-surface truncate">
                      {e.nextLive.title}
                    </p>
                    <p className="text-body-sm text-secondary">
                      {dateTime.format(e.nextLive.startsAt)}
                    </p>
                  </div>
                  {e.nextLive.meetingUrl && (
                    <a
                      href={e.nextLive.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses("primary", "sm", "shrink-0")}
                    >
                      <Video size={16} /> Start
                    </a>
                  )}
                </div>
              )}

              {e.attention.length > 0 ? (
                <div>
                  <p className="text-label-sm text-secondary mb-2 flex items-center gap-1.5 uppercase">
                    <AlertTriangle size={14} className="text-error" /> Aandacht
                    nodig
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {e.attention.map((l) => (
                      <li
                        key={l.userId}
                        className="bg-surface-container-low flex items-center gap-3 rounded-xl p-2.5"
                      >
                        <Avatar src={l.avatarUrl} naam={l.naam} size="xs" />
                        <div className="min-w-0 flex-1">
                          <p className="text-label-lg text-on-surface truncate">
                            {l.naam}
                          </p>
                          <p className="text-body-sm text-secondary">
                            {l.percent}% klaar
                            {l.signal === "inactief"
                              ? ` · ${l.inactiveDays} dagen geen activiteit`
                              : ""}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-label-sm shrink-0 rounded-full px-2.5 py-1",
                            l.signal === "inactief"
                              ? "bg-error-container text-on-error-container"
                              : "bg-primary-fixed text-on-primary-fixed-variant",
                          )}
                        >
                          {SIGNAL_LABEL[l.signal]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                e.learnerCount > 0 && (
                  <p className="bg-tertiary/10 text-body-sm text-tertiary rounded-xl p-3">
                    Iedereen loopt op schema. Mooi werk!
                  </p>
                )
              )}

              <footer className="flex flex-wrap gap-2">
                <Link
                  href={`/leren/${e.cohort.id}/deelnemers`}
                  className={buttonClasses(
                    "primary",
                    "md",
                    "flex-1 sm:flex-none",
                  )}
                >
                  <Users size={18} /> Cursistoverzicht <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/leren/${e.cohort.id}`}
                  className={buttonClasses("secondary", "md")}
                >
                  Leerpad
                </Link>
                <Link
                  href={`/leren/${e.cohort.id}/sessies`}
                  className={buttonClasses("secondary", "md")}
                >
                  {e.role === "facilitator" || e.role === "manager"
                    ? "Sessies en aanwezigheid"
                    : "Sessies"}
                </Link>
                <Link
                  href={`/leren/${e.cohort.id}/materiaal`}
                  className={buttonClasses("secondary", "md")}
                >
                  Lesmateriaal
                </Link>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
