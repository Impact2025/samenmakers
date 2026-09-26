// iCalendar (RFC 5545) generator — geen dependency nodig voor dit subset.
import { effectiveEnd } from "./status";

export interface IcsEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url: string;
  startAt: Date;
  endAt: Date | null;
  updatedAt?: Date;
  cancelled?: boolean;
}

function formatUtc(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Regels langer dan 75 octets vouwen (RFC 5545 §3.1), UTF-8-veilig. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // vervolgregels beginnen met een spatie
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(
  items: IcsEvent[],
  opts: { calendarName?: string; host?: string; now?: Date } = {},
): string {
  const host = opts.host ?? "samenmakers.nl";
  const stamp = formatUtc(opts.now ?? new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Samenmakers//Events//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  if (opts.calendarName) {
    lines.push(`X-WR-CALNAME:${escapeText(opts.calendarName)}`);
    lines.push("REFRESH-INTERVAL;VALUE=DURATION:PT6H");
  }
  for (const e of items) {
    const desc = [e.description?.trim(), e.url].filter(Boolean).join("\n\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatUtc(e.startAt)}`,
      `DTEND:${formatUtc(effectiveEnd(e.startAt, e.endAt))}`,
      `SUMMARY:${escapeText(e.cancelled ? `GEANNULEERD: ${e.title}` : e.title)}`,
      `DESCRIPTION:${escapeText(desc)}`,
      `URL:${e.url}`,
    );
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    if (e.updatedAt) lines.push(`LAST-MODIFIED:${formatUtc(e.updatedAt)}`);
    lines.push(
      `STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** "Toevoegen aan agenda"-links voor diensten zonder ICS-import. */
export function calendarLinks(e: IcsEvent) {
  const start = formatUtc(e.startAt);
  const end = formatUtc(effectiveEnd(e.startAt, e.endAt));
  const details = [e.description?.slice(0, 500), e.url]
    .filter(Boolean)
    .join("\n\n");
  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", e.title);
  google.searchParams.set("dates", `${start}/${end}`);
  google.searchParams.set("details", details);
  if (e.location) google.searchParams.set("location", e.location);

  const outlook = new URL("https://outlook.live.com/calendar/0/action/compose");
  outlook.searchParams.set("rru", "addevent");
  outlook.searchParams.set("subject", e.title);
  outlook.searchParams.set("startdt", e.startAt.toISOString());
  outlook.searchParams.set(
    "enddt",
    effectiveEnd(e.startAt, e.endAt).toISOString(),
  );
  outlook.searchParams.set("body", details);
  if (e.location) outlook.searchParams.set("location", e.location);

  return { google: google.toString(), outlook: outlook.toString() };
}
