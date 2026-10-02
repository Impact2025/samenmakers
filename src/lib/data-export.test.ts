import { describe, expect, it } from "vitest";
import { exportableTables, redactRow, toCsv } from "./data-export";

describe("data-export", () => {
  it("sluit sessie- en tokentabellen uit", () => {
    const names = exportableTables().map((t) => t.name);
    expect(names).toContain("users");
    for (const hidden of [
      "accounts",
      "sessions",
      "verification_tokens",
      "push_subscriptions",
    ])
      expect(names).not.toContain(hidden);
  });

  it("maskeert wachtwoorden en toegangstokens", () => {
    const row = redactRow({
      id: "1",
      password: "hash",
      accessToken: "x",
      name: "A",
    });
    expect(row).toEqual({
      id: "1",
      password: "[VERWIJDERD]",
      accessToken: "[VERWIJDERD]",
      name: "A",
    });
    expect(redactRow({ password: null })).toEqual({ password: null });
  });

  it("maakt geldige csv met escaping", () => {
    const csv = toCsv([
      {
        a: 'zeg "hoi"',
        b: "x,y",
        c: null,
        d: new Date("2026-10-02T00:00:00Z"),
      },
    ]);
    expect(csv).toBe(
      'a,b,c,d\r\n"zeg ""hoi""","x,y",,2026-10-02T00:00:00.000Z\r\n',
    );
    expect(toCsv([])).toBe("");
  });
});
