import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CircleCheck,
  Flag,
  GraduationCap,
  KeyRound,
  PlayCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatDate, formatDueIn } from "@/lib/date-utils";
import { COHORT_ROLE_LABELS } from "@/lib/learning";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/learning/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { LessonIcon } from "@/components/learning/lesson-icon";
import { buttonClasses } from "@/components/ui/button";
import { JoinByCode } from "./join-by-code";

export const metadata: Metadata = { title: "Mijn leertraject" };

export default async function LerenPage() {
  if (!features.leren) notFound();
  const { learning, teaching } = await api.learning.home();

  // De nuttigste actie van vandaag: verder waar je gebleven was.
  const focus =
    learning.find((e) => e.nextLesson && e.enrollmentStatus === "actief") ??
    learning[0];

  // Wie alleen begeleidt, heeft niets aan een leerlingenscherm: edities eerst.
  const staffOnly = learning.length === 0 && teaching.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label={focus ? focus.cohort.name : "Leeromgeving"}
        title={staffOnly ? "Mijn edities" : "Mijn leertraject"}
        description={
          staffOnly ? "De groepen die je begeleidt" : focus?.program.name
        }
        className="mb-0"
      />

      {focus && (
        <div className="bg-surface-container-low shadow-card relative overflow-hidden rounded-2xl p-5">
          <div className="bg-primary/5 pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-label-md text-secondary uppercase">
                Voortgang traject
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-display-lg text-on-surface">
                  {focus.progress.percent}%
                </span>
                <span className="text-body-sm text-secondary">voltooid</span>
              </div>
              <p className="text-body-sm text-secondary mt-1">
                {focus.progress.done} van de {focus.progress.total} lessen
                afgerond
              </p>
            </div>
            <ProgressRing percent={focus.progress.percent}>
              <TrendingUp size={20} className="text-primary-container" />
            </ProgressRing>
          </div>
          {focus.currentModule && (
            <div className="bg-surface-container-lowest/80 relative mt-4 flex items-center gap-2 rounded-xl p-2.5 backdrop-blur-sm">
              <span className="bg-tertiary-container/15 text-tertiary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Flag size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-label-sm text-tertiary block uppercase">
                  Huidige module
                </span>
                <p className="text-body-sm text-on-surface truncate font-medium">
                  {focus.currentModule.title}
                  {focus.currentModule.endsAt && (
                    <>
                      {" "}
                      · loopt af{" "}
                      <span className="text-primary font-bold">
                        {formatDueIn(focus.currentModule.endsAt)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {focus?.nextLesson && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">Nu aan de slag</h2>
            <span className="bg-primary-container/10 text-label-sm text-primary-container rounded-full px-2 py-0.5 uppercase">
              Actief
            </span>
          </div>
          <div className="bg-surface-container-lowest shadow-elevated relative overflow-hidden rounded-2xl p-5">
            <div className="bg-surface-variant absolute top-0 left-0 h-1.5 w-full">
              <div
                className="bg-primary-container h-full rounded-r-full"
                style={{ width: `${focus.progress.percent}%` }}
              />
            </div>
            <div className="text-secondary flex items-center gap-1.5 pt-1">
              <PlayCircle size={16} />
              <span className="text-label-sm uppercase">
                {focus.nextLesson.moduleTitle}
              </span>
            </div>
            <h3 className="text-title-md text-on-surface mt-1">
              {focus.nextLesson.title}
            </h3>
            <p className="text-body-sm text-secondary mt-1 flex items-center gap-1.5">
              <LessonIcon type={focus.nextLesson.type} size={16} />
              {focus.program.name}
            </p>
            <Link
              href={`/leren/${focus.cohort.id}/les/${focus.nextLesson.id}`}
              className={buttonClasses("primary", "lg", "mt-4 w-full")}
            >
              Verder met deze les <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <section hidden={staffOnly}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface">
            Mijn programma&apos;s
          </h2>
          {learning.length > 0 && (
            <span className="text-label-md text-secondary">
              {learning.length} actief
            </span>
          )}
        </div>
        {learning.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={22} />}
            title="Je volgt nog geen programma"
            description="Heb je een uitnodigingscode van je opleider gekregen? Vul hem hieronder in."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {learning.map((e) => {
              const done =
                e.enrollmentStatus === "afgerond" || e.role === "alumnus";
              return (
                <Link
                  key={e.membershipId}
                  href={`/leren/${e.cohort.id}`}
                  className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-3 rounded-2xl p-4 transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="text-on-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: e.program.color }}
                      >
                        <GraduationCap size={20} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-title-md text-on-surface truncate">
                          {e.program.name}
                        </p>
                        <p className="text-body-sm text-secondary truncate">
                          {e.cohort.name}
                        </p>
                      </div>
                    </div>
                    {done && (
                      <span className="bg-tertiary/10 text-label-sm text-tertiary flex shrink-0 items-center gap-1 rounded-full px-2 py-1">
                        <CircleCheck size={12} /> Afgerond
                      </span>
                    )}
                  </div>
                  <ProgressBar percent={e.progress.percent} />
                  <div className="text-label-md text-secondary flex items-center justify-between">
                    <span>
                      {e.progress.done} van {e.progress.total} lessen
                    </span>
                    <span className="text-primary-container">
                      {e.progress.percent}%
                    </span>
                  </div>
                  {e.cohort.startDate && (
                    <p className="text-body-sm text-secondary">
                      {formatDate(e.cohort.startDate)}
                      {e.cohort.endDate && (
                        <> – {formatDate(e.cohort.endDate)}</>
                      )}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {teaching.length > 0 && (
        <section>
          {!staffOnly && (
            <h2 className="text-headline-sm text-on-surface mb-3">
              Begeleiding
            </h2>
          )}
          <div className="flex flex-col gap-2">
            {teaching.map((e) => (
              <div
                key={e.membershipId}
                className="bg-surface-container-low flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div className="min-w-0">
                  <p className="text-title-md text-on-surface">
                    {e.program.name} · {e.cohort.name}
                  </p>
                  <p className="text-body-sm text-secondary">
                    {COHORT_ROLE_LABELS[e.role]} · {e.lessonCount} lessen
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/leren/${e.cohort.id}`}
                    className={buttonClasses("secondary", "sm")}
                  >
                    Leerpad
                  </Link>
                  <Link
                    href={`/leren/${e.cohort.id}/sessies`}
                    className={buttonClasses("secondary", "sm")}
                  >
                    Sessies
                  </Link>
                  <Link
                    href={`/leren/${e.cohort.id}/deelnemers`}
                    className={buttonClasses("tonal", "sm")}
                  >
                    <Users size={16} /> Cursisten
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound size={20} className="text-secondary" />
          <h2 className="text-title-md text-on-surface">
            Deelnemen met een code
          </h2>
        </div>
        <JoinByCode />
      </section>
    </div>
  );
}
