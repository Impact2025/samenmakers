import { describe, expect, it } from "vitest";
import { checkUserChange } from "./admin-guards";

const base = {
  actorId: "a",
  targetId: "b",
  targetRole: "user",
  otherActiveAdmins: 2,
};

describe("checkUserChange", () => {
  it("staat gewone wijzigingen toe", () => {
    expect(
      checkUserChange({ ...base, change: { status: "suspended" } }),
    ).toBeNull();
    expect(checkUserChange({ ...base, change: { role: "admin" } })).toBeNull();
  });
  it("weigert jezelf schorsen of bannen", () => {
    for (const status of ["suspended", "banned", "pending_deletion"] as const)
      expect(
        checkUserChange({ ...base, targetId: "a", change: { status } }),
      ).toMatch(/eigen account/);
  });
  it("staat jezelf activeren wel toe", () => {
    expect(
      checkUserChange({ ...base, targetId: "a", change: { status: "active" } }),
    ).toBeNull();
  });
  it("weigert je eigen adminrol in te trekken", () => {
    expect(
      checkUserChange({
        ...base,
        targetId: "a",
        targetRole: "admin",
        change: { role: "user" },
      }),
    ).toMatch(/eigen beheerdersrol/);
  });
  it("beschermt de laatste beheerder", () => {
    expect(
      checkUserChange({
        ...base,
        targetRole: "admin",
        otherActiveAdmins: 0,
        change: { status: "banned" },
      }),
    ).toMatch(/laatste actieve beheerder/);
    expect(
      checkUserChange({
        ...base,
        targetRole: "admin",
        otherActiveAdmins: 1,
        change: { status: "banned" },
      }),
    ).toBeNull();
  });
});
