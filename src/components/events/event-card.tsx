import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Monitor,
  Users,
  CheckCircle2,
  Flame,
  ArrowRight,
} from "lucide-react";
import { formatEventShort, eventWhere } from "@/lib/event-format";
import { PHASE_LABEL, type EventPhase } from "@/server/events/status";
import { cn } from "@/lib/utils";

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
  coverImageUrl?: string | null;
  myStatus?: string | null;
  distanceKm?: number;
}

const MY_STATUS: Record<string, string> = {
  registered: "Aangemeld",
  checked_in: "Ingecheckt",
  waitlisted: "Wachtlijst",
  offered: "Plek aangeboden",
};

/** Plekken over, alleen tonen als het krap wordt. */
function seatsLeft(e: EventCardData) {
  if (!e.maxAttendees) return null;
  const left = e.maxAttendees - e.seatsTaken;
  return left > 0 && left <= 10 ? left : null;
}

export function EventCard({
  event,
  href,
}: {
  event: EventCardData;
  href?: string;
}) {
  const mine = event.myStatus ? MY_STATUS[event.myStatus] : undefined;
  const flagged =
    event.phase === "sold_out" ||
    event.phase === "cancelled" ||
    event.phase === "live";
  const left = seatsLeft(event);

  return (
    <Link
      href={href ?? `/events/${event.slug}`}
      className="group bg-surface-container-lowest shadow-card hover:shadow-elevated flex h-full flex-col gap-2 rounded-2xl p-4 transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="bg-primary-fixed text-label-sm text-on-primary-fixed rounded-full px-2 py-0.5 uppercase">
            {event.thema ?? (event.format === "online" ? "Online" : "Event")}
          </span>
          <span className="text-body-sm text-secondary flex items-center gap-1">
            <CalendarDays size={14} aria-hidden />
            {formatEventShort(event.startAt, event.endAt, event.timezone)}
          </span>
        </div>
        {flagged ? (
          <span
            className={cn(
              "text-label-sm shrink-0 rounded-full px-2 py-0.5",
              event.phase === "live"
                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                : "bg-error-container text-on-error-container",
            )}
          >
            {PHASE_LABEL[event.phase]}
          </span>
        ) : left ? (
          <span className="bg-error-container text-label-sm text-on-error-container shrink-0 rounded-full px-2 py-0.5">
            Nog {left} {left === 1 ? "plek" : "plekken"}
          </span>
        ) : null}
      </div>

      <div>
        <h3 className="text-title-md text-on-surface group-hover:text-primary-container line-clamp-2 leading-snug transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-body-sm text-secondary mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <div className="text-body-sm text-secondary flex min-w-0 items-center gap-1.5">
          {event.format === "online" ? (
            <Monitor
              size={16}
              className="text-primary-container shrink-0"
              aria-hidden
            />
          ) : (
            <MapPin
              size={16}
              className="text-primary-container shrink-0"
              aria-hidden
            />
          )}
          <span className="text-on-surface truncate font-medium">
            {eventWhere(event)}
          </span>
          {event.distanceKm !== undefined && (
            <span className="shrink-0">
              · {Math.round(event.distanceKm)} km
            </span>
          )}
        </div>
        {mine ? (
          <span className="bg-tertiary-container text-label-md text-on-tertiary-container flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5">
            <CheckCircle2 size={14} aria-hidden />
            {mine}
          </span>
        ) : (
          <span className="text-body-sm text-secondary flex shrink-0 items-center gap-1">
            <Users size={14} aria-hidden />
            {event.seatsTaken}
            {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

/** Grote uitgelichte kaart met beeld en verloop (Evenementen-hero). */
export function FeaturedEventCard({
  event,
  href,
}: {
  event: EventCardData;
  href?: string;
}) {
  const left = seatsLeft(event);
  const mine = event.myStatus ? MY_STATUS[event.myStatus] : undefined;
  return (
    <Link
      href={href ?? `/events/${event.slug}`}
      className="group bg-surface-container-lowest shadow-elevated hover:shadow-floating block overflow-hidden rounded-2xl transition-shadow"
    >
      <div className="from-primary-container to-primary relative h-44 w-full overflow-hidden bg-gradient-to-br sm:h-56">
        {event.coverImageUrl && (
          <Image
            src={event.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="from-inverse-surface/90 via-inverse-surface/30 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-primary-container text-label-sm text-on-primary rounded-full px-2.5 py-1 uppercase shadow-sm">
            Uitgelicht
          </span>
          {left && (
            <span className="bg-surface-container-lowest/90 text-label-sm text-on-surface flex items-center gap-1 rounded-full px-2.5 py-1 backdrop-blur-md">
              <Flame size={13} className="text-primary-container" aria-hidden />{" "}
              Bijna vol
            </span>
          )}
        </div>
        <div className="text-label-md text-inverse-on-surface/90 absolute right-3 bottom-3 left-3 flex items-center gap-2">
          <CalendarDays size={15} aria-hidden />
          {formatEventShort(event.startAt, event.endAt, event.timezone)}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-headline-sm text-on-surface">{event.title}</h3>
          {event.description && (
            <p className="text-body-md text-secondary mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        <div className="bg-surface-container-low text-body-sm text-secondary flex items-center gap-1.5 rounded-lg p-2">
          {event.format === "online" ? (
            <Monitor
              size={18}
              className="text-primary-container shrink-0"
              aria-hidden
            />
          ) : (
            <MapPin
              size={18}
              className="text-primary-container shrink-0"
              aria-hidden
            />
          )}
          <span className="truncate">{eventWhere(event)}</span>
        </div>
        <span className="bg-primary-container text-label-lg text-on-primary shadow-cta flex h-12 w-full items-center justify-center gap-2 rounded-full">
          {mine ??
            (left ? `Aanmelden (nog ${left} plekken)` : "Bekijk & meld je aan")}
          <ArrowRight size={18} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
