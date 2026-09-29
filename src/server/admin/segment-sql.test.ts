import { describe, expect, it } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { buildSegmentConditions } from "./segment";

const render = (input: Parameters<typeof buildSegmentConditions>[0]) => {
  const cond = buildSegmentConditions(input);
  return new PgDialect().sqlToQuery(cond!);
};

describe("segment: rol en editie", () => {
  it("vraagt rol en editie van hetzelfde lidmaatschap", () => {
    const { sql, params } = render({ cohortRole: "docent", cohortId: "c1" });
    expect(sql).toContain('EXISTS (SELECT 1 FROM "cohort_members" WHERE');
    expect(sql).toContain('"cohort_members"."user_id" = "users"."id"');
    expect(sql).toContain("<> 'uitgeschreven'");
    expect(sql).toContain('"cohort_members"."role" = $1');
    expect(sql).toContain('"cohort_members"."cohort_id" = $2');
    expect(params).toEqual(["docent", "c1"]);
  });

  it("filtert alleen op rol als er geen editie is gekozen", () => {
    const { sql, params } = render({ cohortRole: "cursist" });
    expect(sql).toContain('"cohort_members"."role" = $1');
    expect(sql).not.toContain("cohort_id");
    expect(params).toEqual(["cursist"]);
  });
});
