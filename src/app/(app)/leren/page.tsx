import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, Users } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatDate } from "@/lib/date-utils";
import { COHORT_ROLE_LABELS } from "@/lib/learning";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/learning/progress-bar";
import { LessonIcon } from "@/components/learning/lesson-icon";
import { JoinByCode } from "./join-by-code";

export const metadata: Metadata = { title: "Mijn leren" };

export default async function LerenPage() {
  if (!features.leren) notFound();
  const { learning, teaching } = await api.learning.home();

  // The single most useful action today: continue where you left off.
  const focus = learning.find(
    (e) => e.nextLesson && e.enrollmentStatus === "actief",
  );

  return (
    <div className="space-y-12">
      <PageHeader label="Leeromgeving" title="Mijn leren" className="mb-8" />

      {focus?.nextLesson && (
        <Link
          href={`/leren/${focus.cohort.id}/les/${focus.nextLesson.id}`}
          className="group border-on-surface hover:bg-on-surface hover:text-on-primary block border bg-white p-6 transition-colors lg:p-8"
        >
          <p className="text-label-md mb-3 opacity-70">
            VOLGENDE STAP · {focus.program.name}
          </p>
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-headline-md truncate">
                {focus.nextLesson.title}
              </p>
              <p className="text-body-md mt-1 flex items-center gap-2 opacity-70">
                <LessonIcon type={focus.nextLesson.type} size={14} />
                {focus.nextLesson.moduleTitle}
                {focus.currentModule?.endsAt && (
                  <>
                    {" "}
                    · module loopt tot {formatDate(focus.currentModule.endsAt)}
                  </>
                )}
              </p>
            </div>
            <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      <section className="space-y-4">
        <h2 className="text-label-md text-secondary">MIJN PROGRAMMA&apos;S</h2>
        {learning.length === 0 ? (
          <Card hover={false}>
            <CardBody className="space-y-2">
              <p className="text-headline-sm text-on-surface">
                Je volgt nog geen programma
              </p>
              <p className="text-body-md text-on-surface-variant">
                Heb je een uitnodigingscode van je opleider gekregen? Vul hem
                hieronder in.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {learning.map((e) => (
              <Link
                key={e.membershipId}
                href={`/leren/${e.cohort.id}`}
                className="block"
              >
                <Card className="h-full">
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: e.program.color }}
                  />
                  <CardBody className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-headline-sm text-on-surface">
                          {e.program.name}
                        </p>
                        <p className="text-body-md text-secondary">
                          {e.cohort.name}
                        </p>
                      </div>
                      {e.enrollmentStatus === "afgerond" ||
                      e.role === "alumnus" ? (
                        <Badge size="sm" variant="primary">
                          <CircleCheck size={10} className="mr-1" /> Afgerond
                        </Badge>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <ProgressBar
                        percent={e.progress.percent}
                        color={e.program.color}
                      />
                      <p className="text-body-md text-on-surface-variant">
                        {e.progress.done} van {e.progress.total} lessen klaar ·{" "}
                        {e.progress.percent}%
                      </p>
                    </div>
                    {e.cohort.startDate && (
                      <p className="text-body-md text-secondary">
                        {formatDate(e.cohort.startDate)}
                        {e.cohort.endDate && (
                          <> – {formatDate(e.cohort.endDate)}</>
                        )}
                      </p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {teaching.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-label-md text-secondary">
            Mijn edities (begeleiding)
          </h2>
          <div className="divide-hairline bg-surface-container-lowest shadow-card divide-y rounded-2xl">
            {teaching.map((e) => (
              <div
                key={e.membershipId}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <p className="text-body-md text-on-surface font-semibold">
                    {e.program.name} · {e.cohort.name}
                  </p>
                  <p className="text-body-md text-secondary">
                    {COHORT_ROLE_LABELS[e.role]} · {e.lessonCount} lessen
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/leren/${e.cohort.id}`}
                    className="text-label-md text-on-surface underline underline-offset-4"
                  >
                    Leerpad
                  </Link>
                  <Link
                    href={`/leren/${e.cohort.id}/deelnemers`}
                    className="text-label-md text-primary flex items-center gap-1 underline underline-offset-4"
                  >
                    <Users size={12} /> Cursisten
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-md space-y-4">
        <h2 className="text-label-md text-secondary">Deelnemen met code</h2>
        <JoinByCode />
      </section>
    </div>
  );
}
