// Datum/tijd van events altijd in de tijdzone van het event tonen — de server
// draait in UTC, dus `toLocaleString` zonder timeZone geeft de verkeerde tijd.

export const DEFAULT_EVENT_TZ = "Europe/Amsterdam";

export function formatEventWhen(
  startAt: Date | string,
  endAt: Date | string | null | undefined,
  timeZone: string = DEFAULT_EVENT_TZ,
): string {
  const start = new Date(startAt);
  const day = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  });
  const time = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
  if (!endAt) return `${day.format(start)}, ${time.format(start)}`;
  const end = new Date(endAt);
  const sameDay = day.format(start) === day.format(end);
  return sameDay
    ? `${day.format(start)}, ${time.format(start)}–${time.format(end)}`
    : `${day.format(start)} ${time.format(start)} t/m ${day.format(end)} ${time.format(end)}`;
}

export function eventDateParts(
  startAt: Date | string,
  timeZone: string = DEFAULT_EVENT_TZ,
) {
  const d = new Date(startAt);
  return {
    month: new Intl.DateTimeFormat("nl-NL", {
      month: "short",
      timeZone,
    }).format(d),
    day: new Intl.DateTimeFormat("nl-NL", { day: "numeric", timeZone }).format(
      d,
    ),
  };
}

export const FORMAT_LABEL = {
  in_person: "Op locatie",
  online: "Online",
  hybrid: "Hybride",
} as const;

export function eventWhere(e: {
  format: "in_person" | "online" | "hybrid";
  location: string | null;
}): string {
  if (e.format === "online") return "Online";
  const place = e.location ?? "Locatie volgt";
  return e.format === "hybrid" ? `${place} + online` : place;
}

/** Converteert een UTC-instant naar de waarde van een <input type="datetime-local"> in `timeZone`. */
export function toLocalInputValue(
  d: Date | string,
  timeZone: string = DEFAULT_EVENT_TZ,
): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(d));
  return parts.replace(" ", "T");
}

/**
 * Omgekeerde van toLocalInputValue: "2026-10-01T19:30" in `timeZone` naar een UTC-Date.
 * Zo is de invoer onafhankelijk van de tijdzone van de browser.
 */
export function fromLocalInputValue(
  value: string,
  timeZone: string = DEFAULT_EVENT_TZ,
): Date {
  const asUtc = new Date(value + ":00Z");
  // Verschil tussen wat UTC-tijd en de zonetijd op dat moment laten zien.
  const shown = new Date(toLocalInputValue(asUtc, timeZone) + ":00Z");
  const offset = shown.getTime() - asUtc.getTime();
  const guess = new Date(asUtc.getTime() - offset);
  // Tweede iteratie corrigeert rond zomer-/wintertijdovergangen.
  const shown2 = new Date(toLocalInputValue(guess, timeZone) + ":00Z");
  return new Date(guess.getTime() - (shown2.getTime() - asUtc.getTime()));
}
