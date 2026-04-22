"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, MapPin, Monitor, Users } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date-utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Events = inferRouterOutputs<AppRouter>["events"]["list"]["items"];

export function EventsList({ initialItems }: { initialItems: Events }) {
  const [upcoming, setUpcoming] = useState(true);

  const { data, isLoading } = trpc.events.list.useQuery(
    { upcoming, limit: 20 },
    { initialData: { items: initialItems, nextCursor: undefined } },
  );

  const events = data?.items ?? initialItems;

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setUpcoming(true)}
          className={`px-5 py-2 text-label-caps border transition-colors ${
            upcoming
              ? "bg-on-surface text-on-primary border-on-surface"
              : "border-hairline text-outline hover:border-on-surface"
          }`}
        >
          Komend
        </button>
        <button
          onClick={() => setUpcoming(false)}
          className={`px-5 py-2 text-label-caps border transition-colors ${
            !upcoming
              ? "bg-on-surface text-on-primary border-on-surface"
              : "border-hairline text-outline hover:border-on-surface"
          }`}
        >
          Afgelopen
        </button>
        <Link href="/events/nieuw" className="ml-auto">
          <Button variant="primary">+ Nieuw event</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-hairline">
          <p className="text-on-surface-variant">Geen events gevonden</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

type Event = Events[number];

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.startAt);
  const attendeeCount = event.attendees.filter((a) => a.status === "registered").length;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full">
        <CardBody className="p-5 h-full flex flex-col">
          <div className="flex gap-4 mb-4">
            <div className="shrink-0 w-12 text-center border border-hairline py-2">
              <span className="text-[10px] font-bold text-outline uppercase block">
                {date.toLocaleDateString("nl-NL", { month: "short" })}
              </span>
              <span className="text-2xl font-black text-on-surface leading-none block">
                {date.getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-on-surface truncate">{event.title}</h3>
              <div className="flex items-center gap-1 text-xs text-outline mt-1">
                <Calendar size={11} />
                <span>{formatDateTime(event.startAt)}</span>
              </div>
            </div>
          </div>

          {event.description && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">
              {event.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1 text-xs text-outline">
              {event.isOnline ? (
                <><Monitor size={12} /> Online</>
              ) : (
                <><MapPin size={12} /> {event.location ?? "Locatie TBD"}</>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-outline">
              <Users size={12} />
              {attendeeCount}
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
