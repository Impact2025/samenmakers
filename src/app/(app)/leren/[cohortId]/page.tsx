import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import {
  ArrowLeft,
  ArrowRight,
  Circle,
  CircleCheck,
  CircleDashed,
  Users,
} from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatDate } from "@/lib/date-utils";
import { LESSON_TYPE_LABELS } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/learning/progress-bar";
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
    <div className="space-y-10">
      <Link
        href="/leren"
        className="text-label-md text-secondary hover:text-on-surface inline-flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Mijn leren
      </Link>

      <header className="space-y-5">
        <div
          className="h-1.5 w-16"
          style={{ backgroundColor: program.color }}
        />
        <div>
          <p className="text-label-md text-primary-container mb-2">
            {cohort.name}
          </p>
          <h1 className="text-headline-lg lg:text-display-lg text-on-surface">
            {program.name}
          </h1>
          {program.tagline && (
            <p className="text-body-lg text-on-surface-variant mt-3">
              {program.tagline}
            </p>
          )}
        </div>
        <div className="max-w-xl space-y-2">
          <ProgressBar
            percent={progress.percent}
            color={program.color}
            label="Voortgang programma"
          />
          <p className="text-body-md text-on-surface-variant">
            {progress.done} van {progress.total} lessen klaar ·{" "}
            {progress.percent}%
            {cohort.startDate && (
              <>
                {" "}
                · {formatDate(cohort.startDate)}
                {cohort.endDate && <> – {formatDate(cohort.endDate)}</>}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {nextLessonId && (
            <Link
              href={`/leren/${cohort.id}/les/${nextLessonId}`}
              className="text-label-md bg-primary-container text-on-primary shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors"
            >
              {progress.done === 0 ? "Start het programma" : "Ga verder"}{" "}
              <ArrowRight size={14} />
            </Link>
          )}
          {data.isStaff && (
            <Link
              href={`/leren/${cohort.id}/deelnemers`}
              className="text-label-md text-on-surface hover:bg-surface-container-low hover:text-on-surface border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 transition-colors"
            >
              <Users size={14} /> Cursistoverzicht
            </Link>
          )}
        </div>
      </header>

      {modules.length === 0 ? (
        <p className="text-body-md text-secondary">
          Er is nog geen lesmateriaal toegevoegd aan dit programma.
        </p>
      ) : (
        <ol className="space-y-6">
          {modules.map((mod, i) => {
            const isCurrent =
              mod.startsAt &&
              mod.endsAt &&
              mod.startsAt <= now &&
              now <= mod.endsAt;
            return (
              <li
                key={mod.id}
                className={cn(
                  "border bg-white",
                  isCurrent ? "border-on-surface" : "border-hairline",
                )}
              >
                <div className="hairline-b flex flex-wrap items-start justify-between gap-4 p-5 lg:p-6">
                  <div className="min-w-0">
                    <p className="text-label-md text-secondary mb-2">
                      MODULE {i + 1}
                      {isCurrent && (
                        <span className="text-primary ml-2">· NU</span>
                      )}
                    </p>
                    <h2 className="text-headline-sm text-on-surface">
                      {mod.title}
                    </h2>
                    {mod.description && (
                      <p className="text-body-md text-on-surface-variant mt-1">
                        {mod.description}
                      </p>
                    )}
                    {(mod.startsAt || mod.endsAt) && (
                      <p className="text-body-md text-secondary mt-2">
                        {mod.startsAt && formatDate(mod.startsAt)}
                        {mod.endsAt && <> – {formatDate(mod.endsAt)}</>}
                      </p>
                    )}
                  </div>
                  <p className="text-label-md text-secondary shrink-0">
                    {mod.progress.done}/{mod.progress.total}
                  </p>
                </div>
                <ul>
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id} className="hairline-b last:border-b-0">
                      <Link
                        href={`/leren/${cohort.id}/les/${lesson.id}`}
                        className={cn(
                          "hover:bg-surface-container-low flex items-center gap-4 px-5 py-4 transition-colors lg:px-6",
                          lesson.id === nextLessonId &&
                            "bg-surface-container-low",
                        )}
                      >
                        <StatusIcon status={lesson.status} />
                        <span className="min-w-0 flex-1">
                          <span className="text-body-md text-on-surface block truncate">
                            {lesson.title}
                          </span>
                          <span className="text-body-md text-secondary flex items-center gap-2">
                            <LessonIcon type={lesson.type} size={12} />
                            {LESSON_TYPE_LABELS[lesson.type]}
                            {lesson.durationMinutes ? (
                              <> · {lesson.durationMinutes} min</>
                            ) : null}
                            {!lesson.isRequired && <> · optioneel</>}
                          </span>
                        </span>
                        {lesson.id === nextLessonId && (
                          <span className="text-label-md text-primary hidden sm:inline">
                            Volgende
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: "open" | "bezig" | "klaar" }) {
  if (status === "klaar")
    return (
      <CircleCheck
        size={20}
        className="text-primary shrink-0"
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
      className="text-outline-variant shrink-0"
      aria-label="Nog niet gestart"
    />
  );
}
