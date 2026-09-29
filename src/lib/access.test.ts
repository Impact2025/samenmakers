import { describe, expect, it } from "vitest";
import {
  canMessage,
  canViewLibrary,
  classCohortIds,
  isAlumnus,
  type Membership,
  type Person,
} from "./access";

const m = (over: Partial<Membership> = {}): Membership => ({
  cohortId: "lsi",
  role: "cursist",
  status: "actief",
  cohortStatus: "lopend",
  ...over,
});
const person = (memberships: Membership[] = [], isAdmin = false): Person => ({
  isAdmin,
  memberships,
});

const cursistA = person([m()]);
const cursistB = person([m()]);
const cursistOtherClass = person([m({ cohortId: "lso" })]);
const docent = person([m({ role: "docent" })]);
const lid = person();

describe("canMessage", () => {
  it("laat klasgenoten elkaar berichten", () => {
    expect(canMessage(cursistA, cursistB)).toBe(true);
  });
  it("houdt cursisten binnen de eigen klas", () => {
    expect(canMessage(cursistA, cursistOtherClass)).toBe(false);
    expect(canMessage(cursistA, lid)).toBe(false);
  });
  it("werkt symmetrisch: een lid kan een cursist niet benaderen", () => {
    expect(canMessage(lid, cursistA)).toBe(false);
  });
  it("laat cursisten wel hun docent en facilitator berichten", () => {
    const facilitator = person([m({ role: "facilitator" })]);
    expect(canMessage(cursistA, docent)).toBe(true);
    expect(canMessage(facilitator, cursistA)).toBe(true);
  });
  it("laat alle leden en alumni elkaar berichten", () => {
    const alumnus = person([m({ role: "alumnus", cohortStatus: "afgerond" })]);
    expect(canMessage(lid, alumnus)).toBe(true);
    expect(canMessage(alumnus, lid)).toBe(true);
  });
  it("laat een afgeronde cursist weer vrij berichten", () => {
    const done = person([m({ status: "afgerond", cohortStatus: "afgerond" })]);
    expect(canMessage(done, lid)).toBe(true);
  });
  it("laat beheerders altijd door", () => {
    expect(canMessage(person([], true), cursistA)).toBe(true);
    expect(canMessage(cursistA, person([], true))).toBe(true);
  });
  it("telt een uitgeschreven klasgenoot niet als klas", () => {
    const gone = person([m({ status: "uitgeschreven" })]);
    expect(canMessage(cursistA, gone)).toBe(false);
  });
});

describe("classCohortIds", () => {
  it("geldt alleen voor lopende of open edities", () => {
    expect(classCohortIds(person([m({ cohortStatus: "concept" })])).size).toBe(
      0,
    );
    expect(classCohortIds(person([m({ cohortStatus: "afgerond" })])).size).toBe(
      0,
    );
    expect(classCohortIds(cursistA).has("lsi")).toBe(true);
  });
  it("geldt niet voor docenten", () => {
    expect(classCohortIds(docent).size).toBe(0);
  });
});

describe("kennisbank", () => {
  it("is dicht voor cursisten tijdens de opleiding", () => {
    expect(isAlumnus(cursistA)).toBe(false);
    expect(canViewLibrary(cursistA)).toBe(false);
  });
  it("is dicht voor gewone leden en docenten", () => {
    expect(canViewLibrary(lid)).toBe(false);
    expect(canViewLibrary(docent)).toBe(false);
  });
  it("gaat open na afronding van de opleiding", () => {
    const done = person([m({ status: "afgerond" })]);
    expect(canViewLibrary(done)).toBe(true);
  });
  it("is open voor alumni en beheerders", () => {
    expect(canViewLibrary(person([m({ role: "alumnus" })]))).toBe(true);
    expect(canViewLibrary(person([], true))).toBe(true);
  });
  it("blijft dicht na uitschrijven", () => {
    expect(
      canViewLibrary(person([m({ role: "alumnus", status: "uitgeschreven" })])),
    ).toBe(false);
  });
});
