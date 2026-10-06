import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  ClipboardList,
  GraduationCap,
  Handshake,
  Heart,
  MessageCircle,
  MessagesSquare,
  PenLine,
  TrendingUp,
} from "lucide-react";
import { COHORT_ROLE_LABELS } from "@/lib/learning";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/learning/progress-bar";
import { StatCard, IconTile } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { formatRelative, formatDueIn } from "@/lib/date-utils";
import { eventWhere, formatEventShort } from "@/lib/event-format";
import { TeacherOverview, type TeachingEditions } from "./teacher-overview";
import { TeacherToday } from "./teacher-today";
import type { Persona } from "@/lib/persona";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Me = RouterOutputs["users"]["me"];
type Matches = RouterOutputs["matches"]["myMatches"];
type EventItems = RouterOutputs["events"]["list"]["items"];
type Questions = RouterOutputs["questions"]["list"]["items"];
type Edition = RouterOutputs["learning"]["home"]["learning"][number];

interface Props {
  greeting: string;
  me: Me;
  matches: Matches;
  events: EventItems;
  questions: Questions;
  edition: Edition | null;
  teaching: TeachingEditions;
  persona: Persona;
}

const kennisbank = {
  href: "/kennis",
  label: "Kennisbank",
  icon: BookOpen,
  tone: "text-secondary",
};
const berichten = {
  href: "/berichten",
  label: "Berichten",
  icon: MessageCircle,
  tone: "text-tertiary",
};

// Snelkoppelingen per ervaring: een docent heeft niets aan "Vind een match".
function shortcutsFor(persona: Persona, cohortId?: string) {
  switch (persona) {
    case "docent":
      return [
        {
          href: "/leren",
          label: "Mijn edities",
          icon: GraduationCap,
          tone: "text-primary-container",
        },
        {
          href: "/leren/beoordelen",
          label: "Beoordelen",
          icon: ClipboardList,
          tone: "text-tertiary",
        },
        ...(cohortId
          ? [
              {
                href: `/leren/${cohortId}/sessies`,
                label: "Sessies",
                icon: CalendarDays,
                tone: "text-secondary",
              },
            ]
          : []),
        berichten,
      ];
    case "alumnus":
      return [
        {
          href: "/alumni",
          label: "Alumni-community",
          icon: Award,
          tone: "text-primary-container",
        },
        {
          href: "/kennis/materiaal",
          label: "Lesmateriaal",
          icon: BookOpen,
          tone: "text-tertiary",
        },
        defaultShortcuts[0]!,
        defaultShortcuts[3]!,
      ];
    case "cursist":
      return [
        {
          href: "/leren",
          label: "Verder leren",
          icon: GraduationCap,
          tone: "text-primary-container",
        },
        berichten,
        defaultShortcuts[1]!,
        kennisbank,
      ];
    default:
      return defaultShortcuts;
  }
}

const defaultShortcuts = [
  {
    href: "/matching",
    label: "Vind een match",
    icon: Heart,
    tone: "text-primary-container",
  },
  {
    href: "/vragen/nieuw",
    label: "Stel een vraag",
    icon: PenLine,
    tone: "text-tertiary",
  },
  {
    href: "/kennis",
    label: "Kennisbank",
    icon: BookOpen,
    tone: "text-secondary",
  },
  {
    href: "/mentorship",
    label: "Mentorship",
    icon: Handshake,
    tone: "text-primary-container",
  },
];

export function DashboardContent({
  greeting,
  me,
  matches,
  events,
  questions,
  edition,
  teaching,
  persona,
}: Props) {
  const isTeacher = persona === "docent";
  const shortcuts = shortcutsFor(persona, teaching[0]?.cohort.id);
  const firstName = (me?.naam ?? me?.name)?.split(" ")[0] ?? "Maker";
  const completeness = me?.profileCompleteness ?? 0;
  const conversations = matches.filter((m) => m.messages.length > 0);
  const [nextEvent, ...laterEvents] = events;

  return (
    <div className="flex flex-col gap-6">
      {/* Begroeting */}
      <section className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="bg-primary-fixed text-on-primary-fixed text-label-sm inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-3 py-1 uppercase">
            <span className="bg-primary-container h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" />
            <span className="truncate">
              {edition
                ? `${edition.cohort.name} • ${edition.program.name}`
                : teaching[0]
                  ? `${COHORT_ROLE_LABELS[teaching[0].role] ?? "Docent"} • ${teaching[0].program.name}`
                  : "Actief netwerk"}
            </span>
          </span>
          <h1 className="text-headline-lg text-on-surface">
            {greeting}, {firstName}
          </h1>
        </div>
        {me?.subscriptionStatus === "active" && (
          <span
            className="bg-surface-container-high text-primary-container rounded-full p-2"
            title="Pro-lid"
            aria-label="Pro-lid"
          >
            <BadgeCheck size={24} />
          </span>
        )}
      </section>

      {/* Docent: wat vraagt nu aandacht, en overzicht van eigen edities */}
      <TeacherToday editions={teaching} />
      <TeacherOverview editions={teaching} />

      {/* Voortgang: leertraject of profiel */}
      {edition ? (
        <Link
          href={`/leren/${edition.cohort.id}`}
          className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-3 rounded-2xl p-4 transition-shadow"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-title-md text-on-surface flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-container" />
              Traject voortgang
            </span>
            <span className="text-headline-sm text-primary-container">
              {edition.progress.percent}%
            </span>
          </div>
          <ProgressBar
            percent={edition.progress.percent}
            label="Traject voortgang"
          />
          <div className="text-label-md text-secondary flex items-center justify-between gap-3">
            <span>
              {edition.progress.done} van {edition.progress.total} lessen klaar
            </span>
            {edition.currentModule && (
              <span className="text-on-surface-variant truncate">
                {edition.currentModule.title}
              </span>
            )}
          </div>
        </Link>
      ) : (
        completeness < 100 && (
          <Link
            href="/profiel/bewerken"
            className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-3 rounded-2xl p-4 transition-shadow"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-title-md text-on-surface flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-container" />
                Profiel {completeness}% compleet
              </span>
              <span className="text-label-md text-primary-container flex items-center gap-1">
                Afronden <ArrowRight size={14} />
              </span>
            </div>
            <ProgressBar percent={completeness} label="Profiel compleetheid" />
            <p className="text-body-sm text-secondary">
              Een compleet profiel levert meer en betere matches op.
            </p>
          </Link>
        )
      )}

      {/* Snelkoppelingen */}
      <section className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 py-1 lg:mx-0 lg:px-0">
        {shortcuts.map(({ href, label, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className="bg-surface-container-lowest text-on-surface shadow-card text-label-lg flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 whitespace-nowrap transition-transform active:scale-95"
          >
            <Icon size={18} className={tone} />
            {label}
          </Link>
        ))}
      </section>

      {/* KPI's: netwerkcijfers zijn ruis voor een docent */}
      {!isTeacher && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            value={matches.length}
            label="Matches in je netwerk"
            icon={<Handshake size={18} />}
            tone="primary"
            href="/matching"
          />
          <StatCard
            value={conversations.length}
            label="Lopende gesprekken"
            icon={<MessageCircle size={18} />}
            href="/berichten"
          />
          <StatCard
            value={events.length}
            label="Komende evenementen"
            icon={<CalendarDays size={18} />}
            href="/events"
            className="hidden lg:flex"
          />
          <StatCard
            value={edition ? edition.progress.done : `${completeness}%`}
            label={edition ? "Lessen afgerond" : "Profiel compleet"}
            icon={<TrendingUp size={18} />}
            tone="tertiary"
            href={edition ? `/leren/${edition.cohort.id}` : "/profiel"}
            className="hidden lg:flex"
          />
        </section>
      )}

      {/* Eerstvolgend event */}
      <section>
        <SectionHeader
          title="Binnenkort op de planning"
          viewAllHref="/events"
        />
        {nextEvent ? (
          <div className="flex flex-col gap-3">
            <div className="bg-surface-container-lowest shadow-elevated flex flex-col gap-4 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm rounded-full px-2.5 py-1 uppercase">
                  {nextEvent.thema ?? "Event"}
                </span>
                <span className="text-label-md text-secondary flex items-center gap-1">
                  <Clock size={16} />
                  {
                    formatEventShort(
                      nextEvent.startAt,
                      nextEvent.endAt,
                      nextEvent.timezone,
                    ).split(" • ")[1]
                  }
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-headline-sm text-on-surface">
                  {nextEvent.title}
                </h3>
                <p className="text-body-sm text-secondary flex items-center gap-1.5">
                  <CalendarDays
                    size={16}
                    className="text-primary-container shrink-0"
                  />
                  <span className="truncate">
                    {
                      formatEventShort(
                        nextEvent.startAt,
                        null,
                        nextEvent.timezone,
                      ).split(" • ")[0]
                    }{" "}
                    • {eventWhere(nextEvent)}
                  </span>
                </p>
              </div>
              {nextEvent.description && (
                <p className="bg-surface-container-low text-body-sm text-on-surface-variant line-clamp-2 rounded-lg p-3">
                  {nextEvent.description}
                </p>
              )}
              <Link
                href={`/events/${nextEvent.slug}`}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                {nextEvent.myStatus
                  ? "Bekijk je aanmelding"
                  : "Deelnemen & details"}
                <ArrowRight size={18} />
              </Link>
            </div>
            {laterEvents.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.slug}`}
                className="bg-surface-container-low hover:bg-surface-container flex items-center gap-3 rounded-2xl p-3 transition-colors"
              >
                <IconTile tone="neutral">
                  <CalendarDays size={20} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-title-md text-on-surface truncate">
                    {e.title}
                  </p>
                  <p className="text-body-sm text-secondary truncate">
                    {formatEventShort(e.startAt, e.endAt, e.timezone)}
                  </p>
                </div>
                <ChevronRight size={18} className="text-secondary shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="Geen evenementen gepland"
            description="Organiseer zelf een meetup of kijk later nog eens."
            action={
              <Link
                href="/events/nieuw"
                className={buttonClasses("tonal", "sm")}
              >
                Event organiseren
              </Link>
            }
          />
        )}
      </section>

      {/* Volgende leertaak */}
      {edition?.nextLesson && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">
              Jouw volgende leertaak
            </h2>
            {edition.currentModule?.endsAt && (
              <span className="bg-error-container text-on-error-container text-label-sm rounded-full px-2 py-0.5">
                Deadline {formatDueIn(edition.currentModule.endsAt)}
              </span>
            )}
          </div>
          <div className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <IconTile tone="neutral">
                <ClipboardList size={22} />
              </IconTile>
              <div className="min-w-0">
                <span className="text-label-sm text-secondary uppercase">
                  {edition.nextLesson.moduleTitle}
                </span>
                <h3 className="text-title-md text-on-surface">
                  {edition.nextLesson.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-label-sm text-secondary">
                {edition.progress.total - edition.progress.done} lessen te gaan
              </span>
              <Link
                href={`/leren/${edition.cohort.id}/les/${edition.nextLesson.id}`}
                className={buttonClasses("dark", "sm")}
              >
                Verder leren
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community */}
      <section>
        <SectionHeader
          title="Populair in de community"
          viewAllHref="/vragen"
          viewAllLabel="Naar de feed"
        />
        {questions.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare size={22} />}
            title="Nog geen vragen"
            description="Stel als eerste een vraag aan de community."
            action={
              <Link
                href="/vragen/nieuw"
                className={buttonClasses("primary", "sm")}
              >
                Stel een vraag
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/vragen/${q.id}`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-3 rounded-2xl p-4 transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar
                      src={q.author.avatarUrl}
                      naam={q.author.naam ?? q.author.name ?? "?"}
                      size="xs"
                      className="!h-6 !w-6"
                    />
                    <span className="text-label-md text-on-surface truncate">
                      {q.author.naam ?? q.author.name}
                    </span>
                  </span>
                  <span className="text-label-sm text-secondary shrink-0">
                    {formatRelative(new Date(q.createdAt))}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-title-md text-on-surface line-clamp-2">
                    {q.title}
                  </p>
                  {q.content && (
                    <p className="text-body-sm text-secondary line-clamp-2">
                      {q.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-label-sm text-secondary flex items-center gap-1">
                    <MessageCircle size={16} />
                    {q.answers.length}{" "}
                    {q.answers.length === 1 ? "reactie" : "reacties"}
                  </span>
                  <span className="text-label-md text-primary-container flex items-center gap-1">
                    Meepraten <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Gesprekken */}
      {matches.length > 0 && (
        <section>
          <SectionHeader title="Recente gesprekken" viewAllHref="/berichten" />
          <ul className="bg-surface-container-lowest shadow-card rounded-2xl p-1.5">
            {matches.slice(0, 4).map((match) => {
              const other = match.userId === me?.id ? match.target : match.user;
              const lastMsg = match.messages[0];
              return (
                <li key={match.id}>
                  <Link
                    href={`/berichten/${match.id}`}
                    className="hover:bg-surface-container-low flex items-center gap-3 rounded-xl p-2.5 transition-colors"
                  >
                    <Avatar
                      src={other.avatarUrl}
                      naam={other.naam ?? other.name ?? "?"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-title-md text-on-surface truncate">
                        {other.naam ?? other.name}
                      </p>
                      <p className="text-body-sm text-secondary truncate">
                        {lastMsg?.content ?? "Stuur een eerste bericht"}
                      </p>
                    </div>
                    {lastMsg && (
                      <span className="text-label-sm text-secondary shrink-0">
                        {formatRelative(new Date(lastMsg.createdAt))}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
