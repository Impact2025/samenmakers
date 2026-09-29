import { and, eq, inArray, ne } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { cohortMembers } from "@/server/db/schema";
import {
  loadCurriculum,
  loadStatusMapsForCohort,
} from "@/server/learning/curriculum";
import { computeProgress, moduleWindow } from "@/lib/learning";
import {
  dueLessonIds,
  learnerSignal,
  type LearnerSignal,
} from "@/lib/teaching";
import { publicUserColumns } from "@/server/db/user-columns";

const DAY = 86_400_000;

export const teachingRouter = createTRPCRouter({
  /**
   * Docentdashboard: per lopende editie waar de gebruiker docent of manager is,
   * de gezondheid van de groep, wie aandacht nodig heeft en de eerstvolgende live sessie.
   */
  overview: protectedProcedure.query(async ({ ctx }) => {
    const mine = await ctx.db.query.cohortMembers.findMany({
      where: and(
        eq(cohortMembers.userId, ctx.userId),
        inArray(cohortMembers.role, ["docent", "manager", "facilitator"]),
        ne(cohortMembers.status, "uitgeschreven"),
      ),
      with: { cohort: { with: { program: true } } },
    });

    const now = new Date();
    const editions = await Promise.all(
      mine
        .filter((m) => m.cohort.program && m.cohort.status !== "afgerond")
        .map(async (m) => {
          const cohort = m.cohort;
          const program = cohort.program!;
          const { modules, lessons: flat } = await loadCurriculum(
            ctx.db,
            program.id,
          );

          const members = await ctx.db.query.cohortMembers.findMany({
            where: eq(cohortMembers.cohortId, cohort.id),
            with: { user: { columns: publicUserColumns } },
          });
          const learners = members.filter(
            (x) => x.role === "cursist" && x.status !== "uitgeschreven",
          );
          const maps = await loadStatusMapsForCohort(
            ctx.db,
            cohort.id,
            learners.map((l) => l.userId),
          );

          const dueIds = dueLessonIds(modules, cohort.startDate, now);
          const rows = learners.map((l) => {
            const entry = maps.get(l.userId);
            const status = entry?.status ?? new Map();
            const progress = computeProgress(flat, status);
            const last = entry?.lastActivity ?? null;
            const inactiveDays = Math.floor(
              (now.getTime() - (last ?? l.joinedAt).getTime()) / DAY,
            );
            const done = new Set(
              [...status.entries()]
                .filter(([, s]) => s === "klaar")
                .map(([id]) => id),
            );
            const signal = learnerSignal({
              percent: progress.percent,
              doneLessonIds: done,
              dueIds,
              inactiveDays,
              status: l.status,
            });
            return {
              userId: l.userId,
              naam: l.user.naam ?? l.user.name ?? "Cursist",
              avatarUrl: l.user.avatarUrl,
              percent: progress.percent,
              inactiveDays,
              signal,
            };
          });

          const counts: Record<LearnerSignal, number> = {
            klaar: 0,
            op_schema: 0,
            achter: 0,
            inactief: 0,
          };
          for (const r of rows) counts[r.signal]++;
          const avgPercent =
            rows.length === 0
              ? 0
              : Math.round(
                  rows.reduce((n, r) => n + r.percent, 0) / rows.length,
                );

          const attention = rows
            .filter((r) => r.signal === "inactief" || r.signal === "achter")
            .sort((a, b) =>
              a.signal === b.signal
                ? a.percent - b.percent
                : a.signal === "inactief"
                  ? -1
                  : 1,
            )
            .slice(0, 5);

          const nextLive =
            flat
              .filter(
                (l) =>
                  l.type === "live" &&
                  l.content.startsAt &&
                  new Date(l.content.startsAt) >= now,
              )
              .map((l) => ({
                lessonId: l.id,
                title: l.title,
                moduleTitle: l.moduleTitle,
                startsAt: new Date(l.content.startsAt!),
                meetingUrl: l.content.meetingUrl ?? null,
              }))
              .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ??
            null;

          const currentModule =
            modules.find((mod) => {
              const w = moduleWindow(
                cohort.startDate,
                mod.startOffsetDays,
                mod.endOffsetDays,
              );
              return w.start && w.end && w.start <= now && now <= w.end;
            })?.title ?? null;

          return {
            role: m.role,
            cohort: {
              id: cohort.id,
              name: cohort.name,
              status: cohort.status,
              startDate: cohort.startDate,
              endDate: cohort.endDate,
            },
            program: {
              id: program.id,
              name: program.name,
              color: program.color,
            },
            learnerCount: rows.length,
            avgPercent,
            counts,
            attention,
            nextLive,
            currentModule,
          };
        }),
    );

    return editions;
  }),
});
