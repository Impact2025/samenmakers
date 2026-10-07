import { describe, expect, it } from "vitest";
import { parseEmailList } from "./email-list";

describe("parseEmailList", () => {
  it("splitst op komma, puntkomma, spatie en regel", () => {
    expect(
      parseEmailList("a@x.nl, b@x.nl;c@x.nl\nd@x.nl e@x.nl").emails,
    ).toEqual(["a@x.nl", "b@x.nl", "c@x.nl", "d@x.nl", "e@x.nl"]);
  });
  it("haalt adressen uit 'Naam <adres>' en dedupliceert zonder hoofdletters", () => {
    expect(
      parseEmailList('Sara H <Sara@X.nl>, "Jan" <jan@x.nl>, sara@x.nl').emails,
    ).toEqual(["sara@x.nl", "jan@x.nl"]);
  });
  it("negeert tekst zonder adres", () => {
    expect(parseEmailList("geen adres hier").emails).toEqual([]);
  });
  it("kapt af op het maximum", () => {
    const r = parseEmailList("a@x.nl b@x.nl c@x.nl", 2);
    expect(r.emails).toHaveLength(2);
    expect(r.truncated).toBe(true);
  });
});
