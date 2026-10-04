import { describe, it, expect } from "vitest";
import type { Person } from "./access";
import {
  canDownloadMaterial,
  canDownloadSubmissionFile,
  isActiveStaff,
  type CohortSeat,
} from "./file-access";

const now = new Date("2026-10-20T12:00:00Z");
const day = 86_400_000;

const seat = (over: Partial<CohortSeat> = {}): CohortSeat => ({
  role: "docent",
  status: "actief",
  accessFrom: new Date(now.getTime() - 14 * day),
  accessUntil: new Date(now.getTime() + 14 * day),
  ...over,
});

const person = (over: Partial<Person> = {}): Person => ({
  isAdmin: false,
  memberships: [],
  ...over,
});

describe("isActiveStaff", () => {
  it("laat docent, facilitator en manager toe", () => {
    for (const role of ["docent", "facilitator", "manager"] as const) {
      expect(
        isActiveStaff(seat({ role, accessFrom: null, accessUntil: null }), now),
      ).toBe(true);
    }
  });

  it("weigert cursisten en alumni", () => {
    expect(isActiveStaff(seat({ role: "cursist" }), now)).toBe(false);
    expect(isActiveStaff(seat({ role: "alumnus" }), now)).toBe(false);
  });

  it("weigert een docent buiten het toegangsvenster", () => {
    const before = seat({ accessFrom: new Date(now.getTime() + day) });
    const after = seat({ accessUntil: new Date(now.getTime() - day) });
    expect(isActiveStaff(before, now)).toBe(false);
    expect(isActiveStaff(after, now)).toBe(false);
  });

  it("weigert uitgeschreven staf en niet-leden", () => {
    expect(isActiveStaff(seat({ status: "uitgeschreven" }), now)).toBe(false);
    expect(isActiveStaff(null, now)).toBe(false);
  });
});

describe("canDownloadSubmissionFile", () => {
  const base = { userId: "u2", ownerId: "u1", now };

  it("laat de eigenaar zijn eigen inlevering zien", () => {
    expect(
      canDownloadSubmissionFile({
        ...base,
        userId: "u1",
        isAdmin: false,
        seat: null,
      }),
    ).toBe(true);
  });

  it("laat staf van de editie toe", () => {
    expect(
      canDownloadSubmissionFile({ ...base, isAdmin: false, seat: seat() }),
    ).toBe(true);
  });

  it("laat beheerders toe", () => {
    expect(
      canDownloadSubmissionFile({ ...base, isAdmin: true, seat: null }),
    ).toBe(true);
  });

  it("weigert een klasgenoot", () => {
    expect(
      canDownloadSubmissionFile({
        ...base,
        isAdmin: false,
        seat: seat({ role: "cursist" }),
      }),
    ).toBe(false);
  });

  it("weigert een docent van een andere editie (geen plek in deze editie)", () => {
    expect(
      canDownloadSubmissionFile({ ...base, isAdmin: false, seat: null }),
    ).toBe(false);
  });

  it("weigert een docent nadat zijn toegang is verlopen", () => {
    const expired = seat({ accessUntil: new Date(now.getTime() - day) });
    expect(
      canDownloadSubmissionFile({ ...base, isAdmin: false, seat: expired }),
    ).toBe(false);
  });
});

describe("canDownloadMaterial", () => {
  it("laat staf van de editie toe", () => {
    expect(canDownloadMaterial({ person: person(), seat: seat(), now })).toBe(
      true,
    );
  });

  it("laat alumni toe via de kennisbank", () => {
    const alumnus = person({
      memberships: [
        {
          cohortId: "c9",
          role: "alumnus",
          status: "actief",
          cohortStatus: "afgerond",
        },
      ],
    });
    expect(canDownloadMaterial({ person: alumnus, seat: null, now })).toBe(
      true,
    );
  });

  it("laat cursisten tijdens de opleiding niet bij het materiaal", () => {
    const cursist = person({
      memberships: [
        {
          cohortId: "c1",
          role: "cursist",
          status: "actief",
          cohortStatus: "lopend",
        },
      ],
    });
    expect(
      canDownloadMaterial({
        person: cursist,
        seat: seat({ role: "cursist" }),
        now,
      }),
    ).toBe(false);
  });

  it("laat beheerders toe en weigert vreemden", () => {
    expect(
      canDownloadMaterial({
        person: person({ isAdmin: true }),
        seat: null,
        now,
      }),
    ).toBe(true);
    expect(canDownloadMaterial({ person: person(), seat: null, now })).toBe(
      false,
    );
  });
});
