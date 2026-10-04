import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { formatRelative } from "@/lib/date-utils";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Te beoordelen" };

export default async function BeoordelenPage() {
  if (!features.leren) notFound();
  const queue = await api.teaching.reviewQueue();

  // Per editie groeperen; binnen een editie blijft de oudste inlevering bovenaan.
  const byCohort = new Map<string, { name: string; items: typeof queue }>();
  for (const item of queue) {
    const group = byCohort.get(item.cohortId) ?? {
      name: item.cohortName,
      items: [],
    };
    group.items.push(item);
    byCohort.set(item.cohortId, group);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Docent"
        title="Te beoordelen"
        description={
          queue.length === 0
            ? "Alle inleveringen zijn beoordeeld."
            : `${queue.length} ${queue.length === 1 ? "inlevering wacht" : "inleveringen wachten"} op feedback, oudste eerst.`
        }
        className="mb-0"
      />

      {queue.length === 0 ? (
        <EmptyState
          icon={<CircleCheck size={22} />}
          title="Niets te beoordelen"
          description="Nieuwe inleveringen van je cursisten verschijnen hier."
          action={
            <Link href="/leren" className={buttonClasses("tonal", "sm")}>
              Naar mijn edities
            </Link>
          }
        />
      ) : (
        [...byCohort.entries()].map(([cohortId, group]) => (
          <section key={cohortId} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-title-md text-on-surface">{group.name}</h2>
              <Link
                href={`/leren/${cohortId}/opdrachten`}
                className="text-label-md text-primary-container flex items-center gap-1"
              >
                Alle opdrachten <ArrowRight size={14} />
              </Link>
            </div>
            <ul className="flex flex-col gap-2">
              {group.items.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/leren/${cohortId}/opdrachten`}
                    className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-start gap-3 rounded-2xl p-4 transition-shadow"
                  >
                    <Avatar
                      src={s.learner.avatarUrl}
                      naam={s.learner.naam}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-label-lg text-on-surface truncate">
                        {s.learner.naam}
                        <span className="text-secondary font-normal">
                          {" "}
                          · {s.assignmentTitle}
                        </span>
                      </p>
                      {s.excerpt && (
                        <p className="text-body-sm text-secondary line-clamp-2">
                          {s.excerpt}
                        </p>
                      )}
                      <p className="text-label-sm text-secondary mt-1">
                        Ingeleverd {formatRelative(new Date(s.submittedAt))}
                        {s.isLate && (
                          <span className="bg-error-container text-on-error-container ml-2 rounded-full px-2 py-0.5">
                            Te laat
                          </span>
                        )}
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-secondary mt-1 shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
