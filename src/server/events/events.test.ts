// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  derivePhase,
  acceptsRegistrations,
  offerExpiry,
  dueReminder,
  effectiveEnd,
  AUTO_PROMOTE_WINDOW_MS,
} from "./status";
import { buildIcs, escapeText, foldLine, calendarLinks } from "./ics";
import { signCalendarToken, verifyCalendarToken } from "./calendar-token";
import { parsePoint } from "./geocode";
import {
  formatEventWhen,
  fromLocalInputValue,
  toLocalInputValue,
  eventWhere,
} from "@/lib/event-format";

const H = 60 * 60 * 1000;
const now = new Date("2026-10-01T10:00:00Z");
const at = (hoursFromNow: number) => new Date(now.getTime() + hoursFromNow * H);

describe("derivePhase", () => {
  const base = {
    status: "published" as const,
    startAt: at(48),
    endAt: at(50),
    maxAttendees: 10,
  };

  it("concept en geannuleerd gaan voor alles", () => {
    expect(derivePhase({ ...base, status: "draft" }, 0, now)).toBe("draft");
    expect(derivePhase({ ...base, status: "cancelled" }, 10, now)).toBe(
      "cancelled",
    );
  });
  it("open, vol, gaande en afgelopen", () => {
    expect(derivePhase(base, 9, now)).toBe("open");
    expect(derivePhase(base, 10, now)).toBe("sold_out");
    expect(derivePhase({ ...base, startAt: at(-1) }, 0, now)).toBe("live");
    expect(
      derivePhase({ ...base, startAt: at(-5), endAt: at(-1) }, 0, now),
    ).toBe("ended");
  });
  it("zonder maximum nooit vol", () => {
    expect(derivePhase({ ...base, maxAttendees: null }, 5000, now)).toBe(
      "open",
    );
  });
  it("zonder eindtijd duurt een event drie uur", () => {
    expect(effectiveEnd(at(0), null).getTime()).toBe(at(3).getTime());
    expect(derivePhase({ ...base, startAt: at(-2), endAt: null }, 0, now)).toBe(
      "live",
    );
    expect(derivePhase({ ...base, startAt: at(-4), endAt: null }, 0, now)).toBe(
      "ended",
    );
  });
  it("aanmelden alleen bij open of vol (wachtlijst)", () => {
    expect(acceptsRegistrations("open")).toBe(true);
    expect(acceptsRegistrations("sold_out")).toBe(true);
    for (const p of ["draft", "cancelled", "live", "ended"] as const)
      expect(acceptsRegistrations(p)).toBe(false);
  });
});

describe("offerExpiry (wachtlijst 2.0)", () => {
  it("standaard bedenktijd", () => {
    expect(offerExpiry(now, at(72), 24)?.getTime()).toBe(at(24).getTime());
  });
  it("verloopt uiterlijk een uur voor de start", () => {
    expect(offerExpiry(now, at(10), 24)?.getTime()).toBe(at(9).getTime());
  });
  it("vlak voor de start: direct inschrijven (null)", () => {
    expect(
      offerExpiry(now, new Date(now.getTime() + AUTO_PROMOTE_WINDOW_MS), 24),
    ).toBeNull();
    expect(offerExpiry(now, at(1), 24)).toBeNull();
  });
});

describe("dueReminder", () => {
  it("kiest de meest nabije drempel", () => {
    expect(dueReminder(now, at(24 * 6), [])).toBe("7d");
    expect(dueReminder(now, at(20), [])).toBe("1d");
    expect(dueReminder(now, at(0.5), [])).toBe("1h");
  });
  it("stuurt geen oude herinnering na als de volgende drempel al bereikt is", () => {
    expect(dueReminder(now, at(20), ["1d"])).toBeNull();
    expect(dueReminder(now, at(0.5), ["7d", "1d"])).toBe("1h");
  });
  it("niets buiten 7 dagen of na de start", () => {
    expect(dueReminder(now, at(24 * 8), [])).toBeNull();
    expect(dueReminder(now, at(-1), [])).toBeNull();
  });
});

describe("ICS", () => {
  const ev = {
    id: "abc",
    title: "Impact borrel; Utrecht, editie 3",
    description: "Regel 1\nRegel 2",
    location: "Stadhuisbrug 1, Utrecht",
    url: "https://samenmakers.nl/events/impact-borrel",
    startAt: new Date("2026-10-01T17:00:00Z"),
    endAt: null,
  };

  it("escapet speciale tekens", () => {
    expect(escapeText("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });
  it("vouwt lange regels op max 75 octets, ook met multibyte", () => {
    const line = "DESCRIPTION:" + "é".repeat(100);
    const folded = foldLine(line).split("\r\n");
    const enc = new TextEncoder();
    for (const l of folded)
      expect(enc.encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.map((l, i) => (i === 0 ? l : l.slice(1))).join("")).toBe(
      line,
    );
  });
  it("bouwt een geldige VEVENT met UTC-tijden en standaardduur", () => {
    const ics = buildIcs([ev], { now: new Date("2026-09-01T00:00:00Z") });
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("UID:abc@samenmakers.nl");
    expect(ics).toContain("DTSTART:20261001T170000Z");
    expect(ics).toContain("DTEND:20261001T200000Z");
    expect(ics).toContain("SUMMARY:Impact borrel\\; Utrecht\\, editie 3");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("markeert geannuleerde events", () => {
    const ics = buildIcs([{ ...ev, cancelled: true }]);
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics).toContain("SUMMARY:GEANNULEERD: ");
  });
  it("Google- en Outlook-links bevatten titel en tijden", () => {
    const { google, outlook } = calendarLinks(ev);
    expect(new URL(google).searchParams.get("dates")).toBe(
      "20261001T170000Z/20261001T200000Z",
    );
    expect(new URL(outlook).searchParams.get("subject")).toBe(ev.title);
  });
});

describe("agenda-token", () => {
  const key = "k".repeat(40);
  it("rondreis en weigert vervalsing", () => {
    const t = signCalendarToken("user-123", key);
    expect(verifyCalendarToken(t, key)).toBe("user-123");
    expect(verifyCalendarToken(t, "ander-geheim-".repeat(4))).toBeNull();
    const [, sig] = t.split(".");
    const forged = `${Buffer.from("user-999").toString("base64url")}.${sig}`;
    expect(verifyCalendarToken(forged, key)).toBeNull();
    expect(verifyCalendarToken("rommel", key)).toBeNull();
  });
});

describe("geocode.parsePoint", () => {
  it("leest PDOK WKT (lon lat)", () => {
    expect(parsePoint("POINT(5.1214 52.0907)")).toEqual({
      longitude: 5.1214,
      latitude: 52.0907,
    });
    expect(parsePoint("onzin")).toBeNull();
  });
});

describe("event-format", () => {
  it("toont tijden in de eventtijdzone, niet die van de server", () => {
    // 17:00 UTC = 19:00 in Amsterdam (zomertijd)
    expect(
      formatEventWhen(
        "2026-07-01T17:00:00Z",
        "2026-07-01T19:30:00Z",
        "Europe/Amsterdam",
      ),
    ).toMatch(/19:00–21:30$/);
  });
  it("datetime-local rondreis over zomer- en wintertijd", () => {
    for (const iso of [
      "2026-07-01T17:00:00.000Z",
      "2026-12-01T18:00:00.000Z",
      "2026-03-29T01:30:00.000Z",
    ]) {
      const local = toLocalInputValue(iso, "Europe/Amsterdam");
      expect(fromLocalInputValue(local, "Europe/Amsterdam").toISOString()).toBe(
        iso,
      );
    }
    // 25 okt 02:30 bestaat twee keer (klok gaat terug); beide instants tonen dezelfde lokale tijd.
    const ambiguous = fromLocalInputValue(
      "2026-10-25T02:30",
      "Europe/Amsterdam",
    );
    expect(toLocalInputValue(ambiguous, "Europe/Amsterdam")).toBe(
      "2026-10-25T02:30",
    );
    expect(toLocalInputValue("2026-12-01T18:00:00Z", "Europe/Amsterdam")).toBe(
      "2026-12-01T19:00",
    );
    expect(
      fromLocalInputValue("2026-07-01T19:00", "Europe/Amsterdam").toISOString(),
    ).toBe("2026-07-01T17:00:00.000Z");
  });
  it("locatietekst per vorm", () => {
    expect(eventWhere({ format: "online", location: "X" })).toBe("Online");
    expect(eventWhere({ format: "hybrid", location: "Utrecht" })).toBe(
      "Utrecht + online",
    );
    expect(eventWhere({ format: "in_person", location: null })).toBe(
      "Locatie volgt",
    );
  });
});
