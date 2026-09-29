import { describe, it, expect } from "vitest";
import { buildSegmentConditions } from "./segment";

describe("buildSegmentConditions", () => {
  it("returns undefined when no filters are given", () => {
    expect(buildSegmentConditions({})).toBeUndefined();
  });

  it("returns a condition for each supported filter type", () => {
    expect(buildSegmentConditions({ search: "alice" })).toBeDefined();
    expect(buildSegmentConditions({ sector: "Social Impact" })).toBeDefined();
    expect(buildSegmentConditions({ regio: "Amsterdam" })).toBeDefined();
    expect(buildSegmentConditions({ fase: "starter" })).toBeDefined();
    expect(
      buildSegmentConditions({ subscriptionStatus: "active" }),
    ).toBeDefined();
    expect(buildSegmentConditions({ stage: "lead" })).toBeDefined();
    expect(buildSegmentConditions({ status: "active" })).toBeDefined();
    expect(buildSegmentConditions({ weeklyDigestOnly: true })).toBeDefined();
    expect(buildSegmentConditions({ tag: "vip" })).toBeDefined();
    expect(buildSegmentConditions({ cohortRole: "docent" })).toBeDefined();
    expect(buildSegmentConditions({ cohortId: "c1" })).toBeDefined();
    expect(
      buildSegmentConditions({ cohortRole: "cursist", cohortId: "c1" }),
    ).toBeDefined();
  });

  it("combines multiple filters into a single condition", () => {
    const result = buildSegmentConditions({
      sector: "Social Impact",
      regio: "Utrecht",
      fase: "groei",
    });
    expect(result).toBeDefined();
  });

  it("handles search with special characters safely", () => {
    const result = buildSegmentConditions({ search: "test(example)" });
    expect(result).toBeDefined();
  });
});
