import { describe, expect, it } from "vitest";
import { dueLessonIds, learnerSignal } from "./teaching";

const day = 86_400_000;
const start = new Date("2026-01-01T00:00:00Z");
const modules = [
  {
    startOffsetDays: 0,
    endOffsetDays: 13,
    lessons: [
      { id: "a", isRequired: true },
      { id: "b", isRequired: false },
    ],
  },
  {
    startOffsetDays: 14,
    endOffsetDays: 27,
    lessons: [{ id: "c", isRequired: true }],
  },
  {
    startOffsetDays: 28,
    endOffsetDays: null,
    lessons: [{ id: "d", isRequired: true }],
  },
];

describe("dueLessonIds", () => {
  it("telt alleen verplichte lessen van verstreken modules", () => {
    expect(
      dueLessonIds(modules, start, new Date(start.getTime() + 20 * day)),
    ).toEqual(["a"]);
    expect(
      dueLessonIds(modules, start, new Date(start.getTime() + 40 * day)),
    ).toEqual(["a", "c"]);
  });
  it("geeft niets zonder startdatum of vóór het einde van een module", () => {
    expect(dueLessonIds(modules, null, new Date())).toEqual([]);
    expect(
      dueLessonIds(modules, start, new Date(start.getTime() + 5 * day)),
    ).toEqual([]);
  });
  it("telt alle lessen als niets verplicht is", () => {
    const m = [
      {
        startOffsetDays: 0,
        endOffsetDays: 1,
        lessons: [{ id: "x", isRequired: false }],
      },
    ];
    expect(dueLessonIds(m, start, new Date(start.getTime() + 5 * day))).toEqual(
      ["x"],
    );
  });
});

describe("learnerSignal", () => {
  const base = {
    percent: 40,
    doneLessonIds: new Set(["a"]),
    dueIds: ["a", "c"],
    inactiveDays: 2,
    status: "actief",
  };
  it("klaar bij 100%", () =>
    expect(learnerSignal({ ...base, percent: 100 })).toBe("klaar"));
  it("achter bij gemiste verplichte les", () =>
    expect(learnerSignal(base)).toBe("achter"));
  it("op schema als alles wat verlopen is klaar is", () =>
    expect(learnerSignal({ ...base, doneLessonIds: new Set(["a", "c"]) })).toBe(
      "op_schema",
    ));
  it("inactief weegt zwaarder dan achter", () =>
    expect(learnerSignal({ ...base, inactiveDays: 20 })).toBe("inactief"));
  it("gepauzeerde cursist geeft geen alarm", () =>
    expect(learnerSignal({ ...base, status: "gepauzeerd" })).toBe("op_schema"));
});
