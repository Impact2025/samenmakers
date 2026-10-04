import "server-only";
import { z } from "zod";
import { and, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { cohortMembers, users } from "@/server/db/schema";

export const segmentSchema = z.object({
  search: z.string().trim().optional(),
  sector: z.string().optional(),
  regio: z.string().optional(),
  fase: z.enum(["starter", "groei", "scale"]).optional(),
  subscriptionStatus: z
    .enum(["none", "active", "past_due", "canceled"])
    .optional(),
  status: z
    .enum(["active", "suspended", "banned", "pending_deletion"])
    .optional(),
  stage: z.enum(["lead", "engaged", "customer", "churned"]).optional(),
  tag: z.string().optional(),
  weeklyDigestOnly: z.boolean().optional(),
  // Onderwijs: rol in een editie (bijv. docenten, facilitators) en/of een specifieke editie.
  cohortRole: z
    .enum(["cursist", "docent", "manager", "facilitator", "alumnus"])
    .optional(),
  cohortId: z.string().min(1).optional(),
});

export type Segment = z.infer<typeof segmentSchema>;

/** Builds a combined WHERE condition for a segment, or undefined for "all". */
export function buildSegmentConditions(input: Segment): SQL | undefined {
  const conds: SQL[] = [];

  // Elk woord moet in minstens één veld voorkomen (naam, e-mail, sector, regio, expertise, tags).
  for (const word of (input.search ?? "").split(/\s+/).filter(Boolean)) {
    const term = `%${word.replace(/[\\%_]/g, "\\$&")}%`;
    const searchCond = or(
      ilike(users.naam, term),
      ilike(users.name, term),
      ilike(users.email, term),
      ilike(users.sector, term),
      ilike(users.regio, term),
      sql`array_to_string(${users.expertise}, ' ') ilike ${term}`,
      sql`array_to_string(${users.crmTags}, ' ') ilike ${term}`,
    );
    if (searchCond) conds.push(searchCond);
  }
  if (input.sector) conds.push(eq(users.sector, input.sector));
  if (input.regio) conds.push(eq(users.regio, input.regio));
  if (input.fase) conds.push(eq(users.fase, input.fase));
  if (input.subscriptionStatus)
    conds.push(eq(users.subscriptionStatus, input.subscriptionStatus));
  if (input.status) conds.push(eq(users.status, input.status));
  if (input.stage) conds.push(eq(users.crmStage, input.stage));
  if (input.tag) conds.push(sql`${input.tag} = ANY(${users.crmTags})`);
  if (input.weeklyDigestOnly) conds.push(eq(users.weeklyDigestEnabled, true));

  if (input.cohortRole || input.cohortId) {
    // Eén lidmaatschap moet aan beide voorwaarden voldoen (rol én editie), niet twee losse.
    const member = [
      sql`${cohortMembers.userId} = ${users.id}`,
      sql`${cohortMembers.status} <> 'uitgeschreven'`,
      ...(input.cohortRole ? [eq(cohortMembers.role, input.cohortRole)] : []),
      ...(input.cohortId ? [eq(cohortMembers.cohortId, input.cohortId)] : []),
    ];
    conds.push(
      sql`EXISTS (SELECT 1 FROM ${cohortMembers} WHERE ${and(...member)})`,
    );
  }

  return conds.length ? and(...conds) : undefined;
}
