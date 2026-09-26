// Pure eventlogica (geen DB) — gedeeld door router, pagina's en jobs, en getest.

/** Aanmeldstatussen die een plek innemen. */
export const SEAT_HOLDING_STATUSES = [
  "registered",
  "checked_in",
  "offered",
] as const;

export type StoredEventStatus = "draft" | "published" | "cancelled";

/** Afgeleide fase zoals een bezoeker die ziet (plan §4.2 "Statussen"). */
export type EventPhase =
  | "draft"
  | "cancelled"
  | "open"
  | "sold_out"
  | "live"
  | "ended";

export const PHASE_LABEL: Record<EventPhase, string> = {
  draft: "Concept",
  cancelled: "Geannuleerd",
  open: "Open voor aanmelding",
  sold_out: "Vol — wachtlijst",
  live: "Nu bezig",
  ended: "Afgelopen",
};

/** Zonder eindtijd nemen we aan dat een event drie uur duurt. */
export const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;

export function effectiveEnd(startAt: Date, endAt: Date | null): Date {
  return endAt ?? new Date(startAt.getTime() + DEFAULT_DURATION_MS);
}

export function derivePhase(
  e: {
    status: StoredEventStatus;
    startAt: Date;
    endAt: Date | null;
    maxAttendees: number | null;
  },
  seatsTaken: number,
  now: Date = new Date(),
): EventPhase {
  if (e.status === "draft") return "draft";
  if (e.status === "cancelled") return "cancelled";
  if (now >= effectiveEnd(e.startAt, e.endAt)) return "ended";
  if (now >= e.startAt) return "live";
  if (e.maxAttendees !== null && seatsTaken >= e.maxAttendees)
    return "sold_out";
  return "open";
}

/** Aanmelden (of op de wachtlijst) kan tot de start van het event. */
export function acceptsRegistrations(phase: EventPhase): boolean {
  return phase === "open" || phase === "sold_out";
}

/** Onder deze marge voor de start heeft een aanbod met bedenktijd geen zin: direct inschrijven. */
export const AUTO_PROMOTE_WINDOW_MS = 3 * 60 * 60 * 1000;

/**
 * Vervaltijd van een wachtlijstaanbod. `null` betekent: niet aanbieden maar direct
 * inschrijven, omdat het event te dichtbij is. Het aanbod verloopt uiterlijk een uur
 * voor de start, zodat er nog tijd is om de plek door te geven.
 */
export function offerExpiry(
  now: Date,
  startAt: Date,
  offerHours: number,
): Date | null {
  const untilStart = startAt.getTime() - now.getTime();
  if (untilStart <= AUTO_PROMOTE_WINDOW_MS) return null;
  const latest = startAt.getTime() - 60 * 60 * 1000;
  return new Date(
    Math.min(now.getTime() + offerHours * 60 * 60 * 1000, latest),
  );
}

export type ReminderKey = "7d" | "1d" | "1h";

const REMINDERS: { key: ReminderKey; beforeMs: number }[] = [
  { key: "7d", beforeMs: 7 * 24 * 60 * 60 * 1000 },
  { key: "1d", beforeMs: 24 * 60 * 60 * 1000 },
  { key: "1h", beforeMs: 60 * 60 * 1000 },
];

/**
 * Welke herinnering nu aan de beurt is. De job draait elk uur; we sturen alleen de
 * meest nabije nog niet verstuurde herinnering, zodat iemand die zich twee dagen van
 * tevoren aanmeldt niet alsnog een "over een week"-mail krijgt.
 */
export function dueReminder(
  now: Date,
  startAt: Date,
  alreadySent: readonly string[],
): ReminderKey | null {
  const untilStart = startAt.getTime() - now.getTime();
  if (untilStart <= 0) return null;
  // Van klein naar groot: de eerste drempel waar we binnen zitten is de relevante.
  for (const r of [...REMINDERS].reverse()) {
    if (untilStart <= r.beforeMs) {
      return alreadySent.includes(r.key) ? null : r.key;
    }
  }
  return null;
}
