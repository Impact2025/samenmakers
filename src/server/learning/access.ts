import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { cohortMembers, users } from "@/server/db/schema";
import type { Person } from "@/lib/access";

/** Rol en lidmaatschappen van één gebruiker, in de vorm die src/lib/access.ts verwacht. */
export async function loadPerson(
  db: Database,
  userId: string,
): Promise<Person | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true, status: true },
  });
  if (!user) return null;
  const rows = await db.query.cohortMembers.findMany({
    where: eq(cohortMembers.userId, userId),
    with: { cohort: { columns: { status: true } } },
  });
  return {
    isAdmin: user.role === "admin",
    memberships: rows.map((r) => ({
      cohortId: r.cohortId,
      role: r.role,
      status: r.status,
      cohortStatus: r.cohort.status,
    })),
  };
}
