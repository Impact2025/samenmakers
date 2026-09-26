import { and, asc, eq, inArray } from "drizzle-orm";
import type { Database } from "@/server/db";
import { lessonProgress, lessons, modules } from "@/server/db/schema";
import type { ProgressStatus } from "@/lib/learning";

/** A program's modules with their lessons, both in curriculum order. */
export async function loadCurriculum(db: Database, programId: string) {
  const mods = await db.query.modules.findMany({
    where: eq(modules.programId, programId),
    orderBy: [asc(modules.position), asc(modules.createdAt)],
    with: {
      lessons: { orderBy: [asc(lessons.position), asc(lessons.createdAt)] },
    },
  });
  const flat = mods.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
  );
  return { modules: mods, lessons: flat };
}

/** Lesson status per lesson for one learner in one edition. */
export async function loadStatusMap(
  db: Database,
  userId: string,
  cohortId: string,
): Promise<Map<string, ProgressStatus>> {
  const rows = await db
    .select({
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.cohortId, cohortId),
      ),
    );
  return new Map(rows.map((r) => [r.lessonId, r.status]));
}

/** Progress rows for many learners in one edition, grouped by user. */
export async function loadStatusMapsForCohort(
  db: Database,
  cohortId: string,
  userIds: string[],
) {
  const byUser = new Map<
    string,
    { status: Map<string, ProgressStatus>; lastActivity: Date | null }
  >();
  if (userIds.length === 0) return byUser;
  const rows = await db
    .select({
      userId: lessonProgress.userId,
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
      updatedAt: lessonProgress.updatedAt,
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.cohortId, cohortId),
        inArray(lessonProgress.userId, userIds),
      ),
    );
  for (const r of rows) {
    const entry = byUser.get(r.userId) ?? {
      status: new Map(),
      lastActivity: null,
    };
    entry.status.set(r.lessonId, r.status);
    if (!entry.lastActivity || r.updatedAt > entry.lastActivity)
      entry.lastActivity = r.updatedAt;
    byUser.set(r.userId, entry);
  }
  return byUser;
}
