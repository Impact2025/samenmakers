import { describe, expect, it } from "vitest";
import {
  cyclePhase,
  dueMailings,
  isLate,
  sessionCycle,
  teacherWindow,
  withinAccessWindow,
} from "./session-cycle";

const d = (s: string) => new Date(`${s}T12:00:00Z`);
const SESSION = d("2026-11-11");

describe("sessionCycle", () => {
  it("zet briefing, mail, deadline en docenttoegang op de afgesproken momenten", () => {
    const c = sessionCycle(SESSION);
    expect(c.briefingAt).toEqual(d("2026-10-21"));
    expect(c.homeworkMailAt).toEqual(d("2026-10-28"));
    expect(c.homeworkDueAt).toEqual(d("2026-11-08"));
    expect(c.teacherAccessFrom).toEqual(d("2026-10-28"));
    expect(c.teacherAccessUntil).toEqual(d("2026-11-25"));
  });
});

describe("teacherWindow", () => {
  it("geeft null zonder sessies", () => {
    expect(teacherWindow([])).toBeNull();
  });

  it("loopt van 2 weken voor de eerste tot 2 weken na de laatste sessie", () => {
    const w = teacherWindow([d("2026-12-02"), d("2026-11-11")])!;
    expect(w.from).toEqual(d("2026-10-28"));
    expect(w.until).toEqual(d("2026-12-16"));
  });
});

describe("withinAccessWindow", () => {
  const window = { from: d("2026-10-28"), until: d("2026-11-25") };
  it("weigert voor het venster en erna", () => {
    expect(withinAccessWindow(window, d("2026-10-27"))).toBe(false);
    expect(withinAccessWindow(window, d("2026-11-26"))).toBe(false);
  });
  it("laat toe binnen het venster, grenzen inbegrepen", () => {
    expect(withinAccessWindow(window, d("2026-10-28"))).toBe(true);
    expect(withinAccessWindow(window, d("2026-11-25"))).toBe(true);
  });
  it("is onbegrensd zonder grenzen", () => {
    expect(
      withinAccessWindow({ from: null, until: null }, d("2030-01-01")),
    ).toBe(true);
  });
});

describe("cyclePhase", () => {
  it.each([
    ["2026-10-01", "voorbereiding"],
    ["2026-10-22", "briefing"],
    ["2026-10-30", "huiswerk"],
    ["2026-11-09", "inleverdeadline"],
    ["2026-11-11", "sessie"],
    ["2026-11-20", "nazorg"],
    ["2026-12-01", "afgerond"],
  ])("op %s is de fase %s", (date, phase) => {
    expect(cyclePhase(SESSION, d(date))).toBe(phase);
  });
});

describe("dueMailings", () => {
  const none = { briefingSentAt: null, homeworkMailSentAt: null };
  it("stuurt niets te vroeg", () => {
    expect(dueMailings(SESSION, none, d("2026-10-20"))).toEqual([]);
  });
  it("stuurt eerst de briefing, later ook het huiswerk", () => {
    expect(dueMailings(SESSION, none, d("2026-10-22"))).toEqual(["briefing"]);
    expect(dueMailings(SESSION, none, d("2026-10-29"))).toEqual([
      "briefing",
      "huiswerk",
    ]);
  });
  it("stuurt niets dubbel", () => {
    const sent = { briefingSentAt: d("2026-10-21"), homeworkMailSentAt: null };
    expect(dueMailings(SESSION, sent, d("2026-10-29"))).toEqual(["huiswerk"]);
  });
  it("stuurt niets meer als de sessie al begonnen is", () => {
    expect(dueMailings(SESSION, none, d("2026-11-12"))).toEqual([]);
  });
});

describe("isLate", () => {
  it("markeert inleveringen na de deadline", () => {
    expect(isLate(d("2026-11-09"), d("2026-11-08"))).toBe(true);
    expect(isLate(d("2026-11-08"), d("2026-11-08"))).toBe(false);
    expect(isLate(d("2026-11-09"), null)).toBe(false);
  });
});
