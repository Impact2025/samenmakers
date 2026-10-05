import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subDays } from "@/lib/date-utils";
import { withJobRun } from "@/server/monitoring/job-run";
import { isCronAuthorized } from "@/lib/cron-auth";

// Called by Vercel Cron: every day at 02:00
// Permanently anonymises accounts that have been in pending_deletion for 30+ days
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function run(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = subDays(new Date(), 30);

  const toDelete = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(eq(users.status, "pending_deletion"), lte(users.updatedAt, cutoff)),
    );

  console.log(
    `[gdpr-cleanup] ${toDelete.length} accounts scheduled for anonymisation`,
  );

  for (const user of toDelete) {
    await db
      .update(users)
      .set({
        email: `deleted-${user.id}@samenmakers.deleted`,
        naam: null,
        name: "Verwijderd account",
        bio: null,
        missie: null,
        ikZoek: null,
        avatarUrl: null,
        website: null,
        linkedin: null,
        expertise: [],
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  return NextResponse.json({ ok: true, anonymised: toDelete.length });
}

export const GET = (request: Request) =>
  withJobRun("gdpr-cleanup", () => run(request));
