import Link from "next/link";
import { CalendarClock, ClipboardCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeachingEditions } from "./teacher-overview";

const when = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

/**
 * "Vandaag" voor docenten: wat vraagt nu aandacht, over al hun edities heen,
 * met één tik naar de plek waar je het afhandelt.
 */
export function TeacherToday({ editions }: { editions: TeachingEditions }) {
  if (editions.length === 0) return null;

  const review = editions.filter((e) => e.toReview > 0);
  const reviewTotal = review.reduce((n, e) => n + e.toReview, 0);
  const attention = editions.filter((e) => e.counts.achter + e.counts.inactief);
  const attentionTotal = attention.reduce(
    (n, e) => n + e.counts.achter + e.counts.inactief,
    0,
  );
  const next = editions
    .flatMap((e) => (e.nextSession ? [{ e, s: e.nextSession }] : []))
    .sort((a, b) => a.s.startsAt.getTime() - b.s.startsAt.getTime())[0];

  const single = editions.length === 1;
  const tiles = [
    {
      key: "review",
      icon: <ClipboardCheck size={20} />,
      value: reviewTotal,
      label:
        reviewTotal === 1
          ? "Inlevering te beoordelen"
          : "Inleveringen te beoordelen",
      sub: reviewTotal === 0 ? "Alles beoordeeld" : null,
      warn: reviewTotal > 0,
      href: review[0]
        ? `/leren/${review[0].cohort.id}/opdrachten`
        : `/leren/${editions[0]!.cohort.id}/opdrachten`,
    },
    {
      key: "attention",
      icon: <TriangleAlert size={20} />,
      value: attentionTotal,
      label:
        attentionTotal === 1
          ? "Cursist heeft aandacht nodig"
          : "Cursisten hebben aandacht nodig",
      sub: attentionTotal === 0 ? "Iedereen op schema" : null,
      warn: attentionTotal > 0,
      href: `/leren/${(attention[0] ?? editions[0]!).cohort.id}/deelnemers`,
    },
    {
      key: "session",
      icon: <CalendarClock size={20} />,
      value: next ? when.format(next.s.startsAt) : "–",
      label: next ? next.s.title : "Geen sessie gepland",
      sub: next && !single ? next.e.cohort.name : null,
      warn: false,
      href: `/leren/${(next?.e ?? editions[0]!).cohort.id}/sessies`,
    },
  ];

  return (
    <section aria-label="Vandaag" className="grid gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-2 rounded-2xl p-4 transition-shadow"
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              t.warn
                ? "bg-error-container text-on-error-container"
                : "bg-primary-fixed text-on-primary-fixed-variant",
            )}
          >
            {t.icon}
          </span>
          <span
            className={cn(
              "text-on-surface",
              typeof t.value === "number" ? "text-display-lg" : "text-title-lg",
              t.warn && "text-error",
            )}
          >
            {t.value}
          </span>
          <span className="text-body-sm text-secondary line-clamp-2">
            {t.label}
          </span>
          {t.sub && (
            <span className="text-label-sm text-secondary">{t.sub}</span>
          )}
        </Link>
      ))}
    </section>
  );
}
