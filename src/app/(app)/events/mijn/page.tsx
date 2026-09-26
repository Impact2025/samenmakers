import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck2,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Wallet,
} from "lucide-react";
import { api } from "@/trpc/server";
import { EventCard } from "@/components/events/event-card";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { IconTile } from "@/components/ui/stat-card";
import { CalendarFeed } from "./calendar-feed";
import { features } from "@/lib/features";
import { formatEventWhen } from "@/lib/event-format";

export const metadata: Metadata = {
  title: "Mijn events",
  robots: { index: false },
};

export default async function MyEventsPage() {
  const [registrations, organised, feed, tickets] = await Promise.all([
    api.events.myRegistrations(),
    api.events.mine(),
    api.events.calendarFeed(),
    features.eventTickets ? api.tickets.mine() : Promise.resolve([]),
  ]);
  // Server component: rendert per request, dus Date.now() is hier bewust.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const organisedUpcoming = organised.filter(
    (e) => e.phase !== "ended" && e.startAt.getTime() > now - 86400000,
  );
  const organisedPast = organised.filter((e) => !organisedUpcoming.includes(e));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/events"
          className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
        >
          <ChevronLeft size={16} /> Evenementen
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-headline-lg text-on-surface">Mijn events</h1>
            <p className="text-body-md text-secondary mt-0.5">
              Aanmeldingen, tickets en events die je organiseert
            </p>
          </div>
          <Link
            href="/events/nieuw"
            className={buttonClasses("primary", "sm", "shrink-0")}
          >
            <CalendarPlus size={16} /> Nieuw
          </Link>
        </div>
        <SegmentedTabs
          active="mijn"
          tabs={[
            { key: "komend", label: "Aankomend", href: "/events" },
            {
              key: "mijn",
              label: "Mijn aanmeldingen",
              count: registrations.length,
              href: "/events/mijn",
            },
          ]}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-sm text-on-surface">Ik ga</h2>
        {registrations.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck2 size={22} />}
            title="Nog nergens voor aangemeld"
            action={
              <Link href="/events" className={buttonClasses("tonal", "sm")}>
                Ontdek evenementen
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {registrations.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}

        {tickets.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-label-sm text-secondary uppercase">
              Mijn tickets
            </h3>
            <ul className="flex flex-col gap-2">
              {tickets.map((t) => (
                <li key={t.code}>
                  <Link
                    href={`/tickets/${t.code}`}
                    className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-center gap-3 rounded-2xl p-3 transition-shadow"
                  >
                    <IconTile tone="primary">
                      <Ticket size={20} />
                    </IconTile>
                    <span className="min-w-0 flex-1">
                      <span className="text-title-md text-on-surface block truncate">
                        {t.eventTitle}
                      </span>
                      <span className="text-body-sm text-secondary block">
                        {formatEventWhen(t.startAt, t.endAt, t.timezone)} ·{" "}
                        {t.ticketName} · {t.holderName}
                        {t.eventStatus === "cancelled" && " · geannuleerd"}
                      </span>
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-secondary shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div id="agenda" className="scroll-mt-20">
          <CalendarFeed https={feed.https} webcal={feed.webcal} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-headline-sm text-on-surface">Ik organiseer</h2>
          {features.eventTickets && (
            <Link
              href="/events/uitbetalingen"
              className={buttonClasses("tonal", "sm")}
            >
              <Wallet size={16} /> Uitbetalingen
            </Link>
          )}
        </div>
        {organisedUpcoming.length === 0 ? (
          <EmptyState
            title="Geen komende events"
            description="Organiseer een meetup, workshop of borrel voor de community."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {organisedUpcoming.map((e) => (
              <EventCard
                key={e.id}
                event={{ ...e, myStatus: null }}
                href={`/events/${e.slug}/beheer`}
              />
            ))}
          </div>
        )}
        {organisedPast.length > 0 && (
          <details className="bg-surface-container-low rounded-2xl">
            <summary className="text-label-lg text-secondary cursor-pointer px-5 py-3">
              Afgelopen en geannuleerd ({organisedPast.length})
            </summary>
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {organisedPast.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  href={`/events/${e.slug}/beheer`}
                />
              ))}
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
