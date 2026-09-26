import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { PHASE_LABEL } from "@/server/events/status";
import { ManageActions } from "./manage-actions";
import { EditEventForm } from "./edit-event-form";
import { EventCheckinPanel } from "./event-checkin-panel";
import { TicketsManager } from "./tickets-manager";
import { features } from "@/lib/features";

export const metadata: Metadata = {
  title: "Event beheren",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ManageEventPage({ params }: Props) {
  const { slug } = await params;
  const event = await api.events
    .forEdit({ slug: decodeURIComponent(slug) })
    .catch((e: unknown) => {
      if (
        e instanceof TRPCError &&
        (e.code === "NOT_FOUND" || e.code === "FORBIDDEN")
      )
        return null;
      throw e;
    });
  if (!event) notFound();
  const attendees = await api.events.attendees({ eventId: event.id });

  const stats = [
    {
      label: "Aangemeld",
      value: event.seatsTaken,
      sub: event.maxAttendees ? `van ${event.maxAttendees}` : undefined,
    },
    { label: "Wachtlijst", value: event.waitlistCount },
    {
      label: "Ingecheckt",
      value: attendees.filter((a) => a.status === "checked_in").length,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-md text-secondary mb-1">
            <Link href="/events/mijn" className="hover:text-on-surface">
              Mijn events
            </Link>{" "}
            / BEHEREN
          </p>
          <h1 className="text-headline-lg text-on-surface">{event.title}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {formatEventWhen(event.startAt, event.endAt, event.timezone)} ·{" "}
            {eventWhere(event)}
          </p>
        </div>
        <span className="text-label-md bg-on-surface text-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 transition-colors">
          {PHASE_LABEL[event.phase]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest shadow-card rounded-2xl p-4"
          >
            <p className="text-label-md text-secondary">{s.label}</p>
            <p className="text-headline-md text-on-surface">
              {s.value}
              {s.sub && (
                <span className="text-body-md text-secondary"> {s.sub}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <ManageActions
        eventId={event.id}
        slug={event.slug}
        status={event.status}
        hasAudience={event.seatsTaken + event.waitlistCount > 0}
      />

      {features.eventTickets && event.status !== "cancelled" && (
        <section className="space-y-3">
          <h2 className="text-headline-sm text-on-surface">
            Tickets en bestellingen
          </h2>
          <TicketsManager eventId={event.id} timezone={event.timezone} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-headline-sm text-on-surface">
          {features.eventTickets
            ? "Aanmeldingen (zonder ticket) en wachtlijst"
            : "Deelnemers en check-in"}
        </h2>
        <EventCheckinPanel
          eventId={event.id}
          eventTitle={event.title}
          attendees={attendees}
        />
      </section>

      {event.status !== "cancelled" && (
        <section className="space-y-3">
          <h2 className="text-headline-sm text-on-surface">
            Gegevens wijzigen
          </h2>
          <p className="text-body-md text-secondary">
            Wijzig je datum, tijd, locatie of link van een gepubliceerd event,
            dan krijgen deelnemers automatisch bericht.
          </p>
          <div className="bg-surface-container-lowest shadow-card rounded-2xl p-5 sm:p-6">
            <EditEventForm event={event} />
          </div>
        </section>
      )}
    </div>
  );
}
