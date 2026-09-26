import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { EventCard } from "@/components/events/event-card";
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
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-label-md text-secondary mb-1">
            <Link href="/events" className="hover:text-on-surface">
              EVENTS
            </Link>
          </p>
          <h1 className="text-headline-lg text-on-surface">Mijn events</h1>
        </div>
        <Link
          href="/events/nieuw"
          className="bg-primary-container text-on-primary text-label-md shrink-0 px-4 py-2"
        >
          + Nieuw
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-label-md text-on-surface">IK GA</h2>
        {registrations.length === 0 ? (
          <p className="border-hairline text-body-md text-secondary border bg-white p-5">
            Je bent nog nergens voor aangemeld.{" "}
            <Link href="/events" className="underline underline-offset-4">
              Ontdek events
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {registrations.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
        {tickets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-label-md text-secondary">MIJN TICKETS</h3>
            <ul className="border-hairline divide-hairline divide-y border bg-white">
              {tickets.map((t) => (
                <li key={t.code}>
                  <Link
                    href={`/tickets/${t.code}`}
                    className="hover:bg-surface-container-low flex items-center gap-3 p-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-on-surface block truncate font-semibold">
                        {t.eventTitle}
                      </span>
                      <span className="text-body-md text-secondary block">
                        {formatEventWhen(t.startAt, t.endAt, t.timezone)} ·{" "}
                        {t.ticketName} · {t.holderName}
                        {t.eventStatus === "cancelled" && " · geannuleerd"}
                      </span>
                    </span>
                    <span className="text-label-md text-primary shrink-0">
                      Ticket →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <CalendarFeed https={feed.https} webcal={feed.webcal} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-label-md text-on-surface">IK ORGANISEER</h2>
          {features.eventTickets && (
            <Link
              href="/events/uitbetalingen"
              className="text-label-md text-primary"
            >
              Uitbetalingen →
            </Link>
          )}
        </div>
        {organisedUpcoming.length === 0 ? (
          <p className="border-hairline text-body-md text-secondary border bg-white p-5">
            Geen komende events.
          </p>
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
          <details className="border-hairline border bg-white">
            <summary className="text-label-md text-secondary cursor-pointer px-5 py-3">
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
