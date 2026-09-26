import Link from "next/link";
import { Calendar, MapPin, Monitor, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import {
  eventDateParts,
  formatEventWhen,
  eventWhere,
} from "@/lib/event-format";
import { PHASE_LABEL, type EventPhase } from "@/server/events/status";

export interface EventCardData {
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  format: "in_person" | "online" | "hybrid";
  startAt: Date | string;
  endAt: Date | string | null;
  timezone: string;
  maxAttendees: number | null;
  seatsTaken: number;
  phase: EventPhase;
  thema?: string | null;
  myStatus?: string | null;
  distanceKm?: number;
}

const MY_STATUS: Record<string, string> = {
  registered: "Aangemeld",
  checked_in: "Ingecheckt",
  waitlisted: "Wachtlijst",
  offered: "Plek aangeboden",
};

export function EventCard({
  event,
  href,
}: {
  event: EventCardData;
  href?: string;
}) {
  const { month, day } = eventDateParts(event.startAt, event.timezone);
  const mine = event.myStatus ? MY_STATUS[event.myStatus] : undefined;
  const highlight =
    event.phase === "sold_out" ||
    event.phase === "cancelled" ||
    event.phase === "live";

  return (
    <Link href={href ?? `/events/${event.slug}`} className="block">
      <Card className="h-full">
        <CardBody className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <div className="flex gap-3">
            <div
              className="border-hairline w-11 shrink-0 border py-1.5 text-center"
              aria-hidden
            >
              <span className="text-outline mb-0.5 block text-[9px] leading-none font-bold uppercase">
                {month}
              </span>
              <span className="text-on-surface block text-xl leading-none font-black">
                {day}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-on-surface line-clamp-2 text-sm leading-snug font-black sm:text-base">
                {event.title}
              </h3>
              <div className="text-outline mt-1 flex items-center gap-1 text-xs">
                <Calendar size={10} className="shrink-0" aria-hidden />
                <span className="truncate">
                  {formatEventWhen(event.startAt, event.endAt, event.timezone)}
                </span>
              </div>
            </div>
          </div>

          {(mine || highlight || event.thema) && (
            <div className="flex flex-wrap gap-1.5">
              {mine && (
                <span className="bg-primary-container text-on-primary px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                  {mine}
                </span>
              )}
              {highlight && (
                <span className="border-on-surface text-on-surface border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                  {PHASE_LABEL[event.phase]}
                </span>
              )}
              {event.thema && (
                <span className="border-hairline text-outline border px-2 py-0.5 text-[10px] tracking-widest uppercase">
                  {event.thema}
                </span>
              )}
            </div>
          )}

          {event.description && (
            <p className="text-on-surface-variant line-clamp-2 text-xs leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="border-hairline mt-auto flex items-center justify-between border-t pt-2">
            <div className="text-outline flex min-w-0 items-center gap-1 text-xs">
              {event.format === "online" ? (
                <Monitor size={11} className="shrink-0" aria-hidden />
              ) : (
                <MapPin size={11} className="shrink-0" aria-hidden />
              )}
              <span className="truncate">{eventWhere(event)}</span>
              {event.distanceKm !== undefined && (
                <span className="shrink-0">
                  · {Math.round(event.distanceKm)} km
                </span>
              )}
            </div>
            <div className="text-outline ml-2 flex shrink-0 items-center gap-1 text-xs">
              <Users size={11} aria-hidden />
              <span>
                {event.seatsTaken}
                {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
