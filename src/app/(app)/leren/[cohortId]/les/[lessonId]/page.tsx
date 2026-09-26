import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ArrowLeft, Download, ExternalLink, Radio } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { renderMarkdown } from "@/lib/markdown";
import { formatDateTime } from "@/lib/date-utils";
import { LESSON_TYPE_LABELS, toEmbedUrl } from "@/lib/learning";
import { ProgressBar } from "@/components/learning/progress-bar";
import { LessonIcon } from "@/components/learning/lesson-icon";
import { LessonActions } from "./lesson-actions";

interface Props {
  params: Promise<{ cohortId: string; lessonId: string }>;
}

async function load(cohortId: string, lessonId: string) {
  try {
    return await api.learning.lesson({ cohortId, lessonId });
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cohortId, lessonId } = await params;
  const data = await api.learning
    .lesson({ cohortId, lessonId })
    .catch(() => null);
  return {
    title: data ? `${data.lesson.title} · ${data.program.name}` : "Les",
  };
}

const safeHttpUrl = (u?: string) => (u && /^https?:\/\//.test(u) ? u : null);

export default async function LessonPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId, lessonId } = await params;
  const data = await load(cohortId, lessonId);
  const { lesson, program, cohort } = data;
  const c = lesson.content;
  const embed = lesson.type === "video" ? toEmbedUrl(c.videoUrl) : null;
  const fileUrl = safeHttpUrl(c.fileUrl);
  const meetingUrl = safeHttpUrl(c.meetingUrl);

  return (
    <article className="flex flex-col gap-6">
      <div className="space-y-4">
        <Link
          href={`/leren/${cohort.id}`}
          className="text-label-md text-secondary hover:text-primary-container inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> {program.name}
        </Link>
        <ProgressBar
          percent={data.progress.percent}
          color={program.color}
          label="Voortgang programma"
        />
      </div>

      <header className="space-y-3">
        <p className="text-label-sm text-primary-container flex items-center gap-2 uppercase">
          <LessonIcon type={lesson.type} size={14} />
          {lesson.moduleTitle} · les {data.position.index} van{" "}
          {data.position.total}
        </p>
        <h1 className="text-headline-lg text-on-surface">{lesson.title}</h1>
        <p className="text-body-md text-secondary">
          {LESSON_TYPE_LABELS[lesson.type]}
          {lesson.durationMinutes ? (
            <> · ca. {lesson.durationMinutes} minuten</>
          ) : null}
          {!lesson.isRequired && <> · optioneel</>}
        </p>
      </header>

      {lesson.type === "video" &&
        (embed ? (
          <div className="bg-on-surface shadow-elevated aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              src={embed}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : safeHttpUrl(c.videoUrl) ? (
          <a
            href={c.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-lg text-primary-container inline-flex items-center gap-2 hover:underline"
          >
            Bekijk de video <ExternalLink size={12} />
          </a>
        ) : null)}

      {lesson.type === "live" && (c.startsAt || meetingUrl) && (
        <div className="bg-surface-container-lowest shadow-elevated flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="bg-tertiary/10 text-tertiary flex h-10 w-10 items-center justify-center rounded-full">
              <Radio size={20} aria-hidden />
            </span>
            <div>
              <p className="text-label-md text-secondary">Live sessie</p>
              {c.startsAt && (
                <p className="text-body-md text-on-surface font-semibold">
                  {formatDateTime(c.startsAt)}
                </p>
              )}
            </div>
          </div>
          {meetingUrl && (
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label-md bg-primary-container text-on-primary shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 transition-colors"
            >
              Deelnemen <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {c.body && (
        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(c.body) }}
        />
      )}

      {lesson.type === "bestand" && fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:shadow-elevated bg-surface-container-lowest shadow-card flex items-center gap-4 rounded-2xl p-5 transition-colors"
        >
          <span className="bg-tertiary/10 text-tertiary flex h-10 w-10 items-center justify-center rounded-xl">
            <Download size={20} aria-hidden />
          </span>
          <span className="text-body-md text-on-surface font-semibold">
            {c.fileName || "Download het bestand"}
          </span>
        </a>
      )}

      {lesson.type === "reflectie" && c.prompt && (
        <blockquote className="border-primary-container bg-primary-fixed/40 rounded-2xl border-l-4 p-5">
          <p className="text-label-sm text-primary-container mb-2 uppercase">
            Reflectievraag
          </p>
          <p className="text-body-lg text-on-surface">{c.prompt}</p>
        </blockquote>
      )}

      <LessonActions
        cohortId={cohort.id}
        lessonId={lesson.id}
        initialStatus={data.status}
        initialNote={data.note}
        isReflection={lesson.type === "reflectie"}
        prev={data.prev}
        next={data.next}
      />
    </article>
  );
}
