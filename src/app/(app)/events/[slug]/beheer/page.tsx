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
          <p className="text-label-caps text-outline mb-1">
            <Link href="/events/mijn" className="hover:text-on-surface">
              MIJN EVENTS
            </Link>{" "}
            / BEHEREN
          </p>
          <h1 className="text-headline-md text-on-surface">{event.title}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {formatEventWhen(event.startAt, event.endAt, event.timezone)} ·{" "}
            {eventWhere(event)}
          </p>
        </div>
        <span className="text-label-caps bg-on-surface text-on-primary px-3 py-1">
          {PHASE_LABEL[event.phase]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="border-hairline border bg-white p-4">
            <p className="text-label-caps text-outline">{s.label}</p>
            <p className="text-headline-sm text-on-surface">
              {s.value}
              {s.sub && (
                <span className="text-body-sm text-outline"> {s.sub}</span>
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
          <h2 className="text-label-caps text-on-surface">
            TICKETS EN BESTELLINGEN
          </h2>
          <TicketsManager eventId={event.id} timezone={event.timezone} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-label-caps text-on-surface">
          {features.eventTickets
            ? "AANMELDINGEN (ZONDER TICKET) EN WACHTLIJST"
            : "DEELNEMERS EN CHECK-IN"}
        </h2>
        <EventCheckinPanel
          eventId={event.id}
          eventTitle={event.title}
          attendees={attendees}
        />
      </section>

      {event.status !== "cancelled" && (
        <section className="space-y-3">
          <h2 className="text-label-caps text-on-surface">GEGEVENS WIJZIGEN</h2>
          <p className="text-body-sm text-outline">
            Wijzig je datum, tijd, locatie of link van een gepubliceerd event,
            dan krijgen deelnemers automatisch bericht.
          </p>
          <div className="border-hairline border bg-white p-5 sm:p-6">
            <EditEventForm event={event} />
          </div>
        </section>
      )}
    </div>
  );
}
