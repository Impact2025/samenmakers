import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Circle,
  CircleCheck,
  CircleDashed,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  MessagesSquare,
  Timer,
  Users,
} from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatDate } from "@/lib/date-utils";
import { LESSON_TYPE_LABELS } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { LessonIcon } from "@/components/learning/lesson-icon";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Leerpad" };

async function load(cohortId: string) {
  try {
    return await api.learning.cohort({ cohortId });
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export default async function LeerpadPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const data = await load(cohortId);
  const { program, cohort, progress, modules, nextLessonId } = data;
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/leren"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Mijn leertraject
      </Link>

      <header className="bg-surface-container-low shadow-card relative overflow-hidden rounded-2xl p-5">
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: program.color }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="bg-primary/10 text-label-sm text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 uppercase">
              <GraduationCap size={14} /> {cohort.name}
            </span>
            <h1 className="text-headline-lg text-on-surface mt-2">
              {program.name}
            </h1>
            {program.tagline && (
              <p className="text-body-md text-secondary mt-1">
                {program.tagline}
              </p>
            )}
          </div>
          <ProgressRing percent={progress.percent}>
            <span className="text-label-md text-on-surface">
              {progress.percent}%
            </span>
          </ProgressRing>
        </div>
        <p className="text-body-sm text-secondary relative mt-3">
          {progress.done} van {progress.total} lessen klaar
          {cohort.startDate && (
            <>
              {" "}
              · {formatDate(cohort.startDate)}
              {cohort.endDate && <> – {formatDate(cohort.endDate)}</>}
            </>
          )}
        </p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {nextLessonId && (
            <Link
              href={`/leren/${cohort.id}/les/${nextLessonId}`}
              className={buttonClasses("primary", "lg", "flex-1 sm:flex-none")}
            >
              {progress.done === 0 ? "Start het programma" : "Ga verder"}{" "}
              <ArrowRight size={18} />
            </Link>
          )}
          <Link
            href={`/leren/${cohort.id}/klas`}
            className={buttonClasses("secondary", "lg")}
          >
            <MessagesSquare size={18} /> Klas
          </Link>
          <Link
            href={`/leren/${cohort.id}/sessies`}
            className={buttonClasses("secondary", "lg")}
          >
            <CalendarDays size={18} /> Sessies
          </Link>
          <Link
            href={`/leren/${cohort.id}/opdrachten`}
            className={buttonClasses("secondary", "lg")}
          >
            <ClipboardList size={18} /> Opdrachten
          </Link>
          {data.isStaff && (
            <>
              <Link
                href={`/leren/${cohort.id}/deelnemers`}
                className={buttonClasses("secondary", "lg")}
              >
                <Users size={18} /> Cursistoverzicht
              </Link>
              <Link
                href={`/leren/${cohort.id}/materiaal`}
                className={buttonClasses("secondary", "lg")}
              >
                <FileText size={18} /> Lesmateriaal
              </Link>
            </>
          )}
        </div>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface">Curriculum</h2>
          <span className="text-label-md text-secondary">
            {modules.length} {modules.length === 1 ? "module" : "modules"}
          </span>
        </div>

        {modules.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={22} />}
            title="Nog geen lesmateriaal"
            description="Er is nog geen lesmateriaal aan dit programma toegevoegd."
          />
        ) : (
          <ol className="flex flex-col gap-2">
            {modules.map((mod, i) => {
              const isCurrent = !!(
                mod.startsAt &&
                mod.endsAt &&
                mod.startsAt <= now &&
                now <= mod.endsAt
              );
              const pct =
                mod.progress.total === 0
                  ? 0
                  : Math.round((mod.progress.done / mod.progress.total) * 100);
              const complete =
                mod.progress.total > 0 &&
                mod.progress.done === mod.progress.total;
              const hasNext = mod.lessons.some((l) => l.id === nextLessonId);
              return (
                <li key={mod.id}>
                  <details
                    open={isCurrent || hasNext}
                    className={cn(
                      "group rounded-2xl",
                      isCurrent || hasNext
                        ? "bg-surface-container-lowest shadow-card"
                        : "bg-surface-container-low",
                    )}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            complete
                              ? "bg-tertiary/15 text-tertiary"
                              : isCurrent || hasNext
                                ? "bg-primary-container/15 text-primary-container"
                                : "bg-surface-variant text-secondary",
                          )}
                        >
                          {complete ? (
                            <Check size={20} />
                          ) : isCurrent || hasNext ? (
                            <Timer size={20} />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={cn(
                              "text-label-sm uppercase",
                              isCurrent || hasNext
                                ? "text-primary-container"
                                : "text-secondary",
                            )}
                          >
                            Module {i + 1}
                            {isCurrent && " • Nu"}
                            {(mod.startsAt || mod.endsAt) && (
                              <span className="text-secondary normal-case">
                                {" "}
                                · {mod.startsAt && formatDate(mod.startsAt)}
                                {mod.endsAt && <> – {formatDate(mod.endsAt)}</>}
                              </span>
                            )}
                          </span>
                          <h3 className="text-title-md text-on-surface truncate">
                            {mod.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "text-label-sm rounded-full px-2 py-1",
                            complete
                              ? "bg-tertiary/10 text-tertiary"
                              : isCurrent || hasNext
                                ? "bg-primary-container text-on-primary"
                                : "bg-surface-variant text-secondary",
                          )}
                        >
                          {pct}%
                        </span>
                        <ChevronDown
                          size={18}
                          className="text-secondary transition-transform group-open:rotate-180"
                        />
                      </div>
                    </summary>

                    {mod.description && (
                      <p className="text-body-sm text-secondary px-4 pb-2">
                        {mod.description}
                      </p>
                    )}
                    <ul className="flex flex-col gap-1 px-2 pb-2">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/leren/${cohort.id}/les/${lesson.id}`}
                            className={cn(
                              "hover:bg-surface-container-low flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                              lesson.id === nextLessonId &&
                                "bg-primary-fixed/40",
                            )}
                          >
                            <StatusIcon status={lesson.status} />
                            <span className="min-w-0 flex-1">
                              <span className="text-label-lg text-on-surface block truncate">
                                {lesson.title}
                              </span>
                              <span className="text-body-sm text-secondary flex items-center gap-1.5">
                                <LessonIcon type={lesson.type} size={14} />
                                {LESSON_TYPE_LABELS[lesson.type]}
                                {lesson.durationMinutes ? (
                                  <> · {lesson.durationMinutes} min</>
                                ) : null}
                                {!lesson.isRequired && <> · optioneel</>}
                              </span>
                            </span>
                            {lesson.id === nextLessonId && (
                              <span className="bg-primary-container text-label-sm text-on-primary hidden rounded-full px-2.5 py-1 sm:inline">
                                Volgende
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function StatusIcon({ status }: { status: "open" | "bezig" | "klaar" }) {
  if (status === "klaar")
    return (
      <CircleCheck
        size={20}
        className="text-tertiary shrink-0"
        aria-label="Klaar"
      />
    );
  if (status === "bezig")
    return (
      <CircleDashed
        size={20}
        className="text-primary-container shrink-0"
        aria-label="Bezig"
      />
    );
  return (
    <Circle
      size={20}
      strokeWidth={1.5}
      className="text-secondary-fixed-dim shrink-0"
      aria-label="Nog niet gestart"
    />
  );
}
