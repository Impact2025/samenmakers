import { describe, expect, it } from "vitest";
import { derivePersona } from "./persona";
import type { Membership, Person } from "./access";

const m = (over: Partial<Membership>): Membership => ({
  cohortId: "c1",
  role: "cursist",
  status: "actief",
  cohortStatus: "lopend",
  ...over,
});
const person = (...memberships: Membership[]): Person => ({
  isAdmin: false,
  memberships,
});

describe("derivePersona", () => {
  it("zonder lidmaatschap is iemand een lid", () => {
    expect(derivePersona(person())).toBe("lid");
  });
  it("cursist in een lopende editie", () => {
    expect(derivePersona(person(m({})))).toBe("cursist");
  });
  it("docent in een lopende editie", () => {
    expect(derivePersona(person(m({ role: "docent" })))).toBe("docent");
  });
  it("facilitator en manager tellen als docent", () => {
    expect(derivePersona(person(m({ role: "facilitator" })))).toBe("docent");
    expect(derivePersona(person(m({ role: "manager" })))).toBe("docent");
  });
  it("docent weegt zwaarder dan cursist", () => {
    expect(
      derivePersona(person(m({}), m({ cohortId: "c2", role: "docent" }))),
    ).toBe("docent");
  });
  it("afgeronde cursist en alumnus zijn alumnus", () => {
    expect(
      derivePersona(
        person(m({ status: "afgerond", cohortStatus: "afgerond" })),
      ),
    ).toBe("alumnus");
    expect(derivePersona(person(m({ role: "alumnus" })))).toBe("alumnus");
  });
  it("uitgeschreven telt niet mee", () => {
    expect(derivePersona(person(m({ status: "uitgeschreven" })))).toBe("lid");
  });
  it("docent van alleen een afgeronde editie blijft docent", () => {
    expect(
      derivePersona(person(m({ role: "docent", cohortStatus: "afgerond" }))),
    ).toBe("docent");
  });
});
