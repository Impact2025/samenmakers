import { describe, expect, it } from "vitest";
import { evaluateJobHealth, type JobRunRow } from "./job-health";

const JOBS = [{ name: "a", maxAgeHours: 3 }];
const now = new Date("2026-10-03T12:00:00Z");
const run = (over: Partial<JobRunRow>): JobRunRow => ({
  job: "a",
  status: "ok",
  startedAt: new Date("2026-10-03T11:00:00Z"),
  error: null,
  ...over,
});

describe("evaluateJobHealth", () => {
  it("meldt niets bij een recente geslaagde run", () => {
    expect(evaluateJobHealth([run({})], now, JOBS)).toEqual([]);
  });
  it("meldt een taak die nooit draaide", () => {
    expect(evaluateJobHealth([], now, JOBS)[0]?.kind).toBe("nooit-gedraaid");
  });
  it("meldt een mislukte laatste run met de fout", () => {
    const p = evaluateJobHealth(
      [run({ status: "error", error: "boem" })],
      now,
      JOBS,
    );
    expect(p[0]).toMatchObject({ kind: "mislukt", detail: "boem" });
  });
  it("kijkt naar de laatste run, niet naar een oudere fout", () => {
    const old = run({
      status: "error",
      startedAt: new Date("2026-10-03T08:00:00Z"),
    });
    expect(evaluateJobHealth([old, run({})], now, JOBS)).toEqual([]);
  });
  it("meldt een te oude run", () => {
    const stale = run({ startedAt: new Date("2026-10-03T07:00:00Z") });
    expect(evaluateJobHealth([stale], now, JOBS)[0]?.kind).toBe("te-laat");
  });
});
