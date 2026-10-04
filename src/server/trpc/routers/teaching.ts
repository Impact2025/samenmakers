import { and, asc, count, eq, gte, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { isActiveStaff } from "@/lib/file-access";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import {
  assignments,
  cohortMembers,
  cohortSessions,
  submissions,
  users,
} from "@/server/db/schema";
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
   * Waar iemand docent van is, voor de badge op het profiel. Alleen programmanamen: geen
   * editie- of cursistgegevens, want profielen zijn zichtbaar voor andere leden.
   */
  badges: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.cohortMembers.findMany({
        where: and(
          eq(cohortMembers.userId, input.userId),
          inArray(cohortMembers.role, ["docent", "facilitator"]),
          ne(cohortMembers.status, "uitgeschreven"),
        ),
        with: { cohort: { with: { program: true } } },
      });
      const seen = new Map<
        string,
        { role: "docent" | "facilitator"; program: string; color: string }
      >();
      for (const r of rows) {
        const program = r.cohort.program;
        if (!program || r.cohort.status === "concept") continue;
        const key = `${program.id}:${r.role}`;
        if (!seen.has(key))
          seen.set(key, {
            role: r.role as "docent" | "facilitator",
            program: program.name,
            color: program.color,
          });
      }
      return [...seen.values()];
    }),

  /**
   * Beoordelingswachtrij over alle edities heen: inleveringen zonder feedback, oudste
   * eerst. Alleen edities waar de gebruiker nu actieve staf is (toegangsvenster telt mee).
   */
  reviewQueue: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const seats = await ctx.db.query.cohortMembers.findMany({
      where: and(
        eq(cohortMembers.userId, ctx.userId),
        inArray(cohortMembers.role, ["docent", "facilitator", "manager"]),
        ne(cohortMembers.status, "uitgeschreven"),
      ),
      with: { cohort: { columns: { id: true, name: true } } },
    });
    const active = seats.filter((s) => isActiveStaff(s, now));
    if (active.length === 0) return [];

    const rows = await ctx.db
      .select({
        id: submissions.id,
        submittedAt: submissions.submittedAt,
        isLate: submissions.isLate,
        text: submissions.text,
        cohortId: assignments.cohortId,
        assignmentTitle: assignments.title,
        learnerId: users.id,
        learnerName: users.name,
        learnerNaam: users.naam,
        avatarUrl: users.avatarUrl,
      })
      .from(submissions)
      .innerJoin(assignments, eq(assignments.id, submissions.assignmentId))
      .innerJoin(users, eq(users.id, submissions.userId))
      .where(
        and(
          inArray(
            assignments.cohortId,
            active.map((s) => s.cohortId),
          ),
          eq(submissions.status, "ingeleverd"),
        ),
      )
      .orderBy(asc(submissions.submittedAt))
      .limit(100);

    const cohortName = new Map(active.map((s) => [s.cohortId, s.cohort.name]));
    return rows.map((r) => ({
      id: r.id,
      cohortId: r.cohortId,
      cohortName: cohortName.get(r.cohortId) ?? "",
      assignmentTitle: r.assignmentTitle,
      learner: {
        id: r.learnerId,
        naam: r.learnerNaam ?? r.learnerName ?? "Cursist",
        avatarUrl: r.avatarUrl,
      },
      submittedAt: r.submittedAt,
      isLate: r.isLate,
      excerpt: r.text ? r.text.slice(0, 160) : null,
    }));
  }),

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

          // Wat er nu van de docent verwacht wordt: inleveringen zonder feedback en de
          // eerstvolgende sessie.
          const [[pending], nextSession] = await Promise.all([
            ctx.db
              .select({ n: count() })
              .from(submissions)
              .innerJoin(
                assignments,
                eq(assignments.id, submissions.assignmentId),
              )
              .where(
                and(
                  eq(assignments.cohortId, cohort.id),
                  eq(submissions.status, "ingeleverd"),
                ),
              ),
            ctx.db.query.cohortSessions.findFirst({
              where: and(
                eq(cohortSessions.cohortId, cohort.id),
                gte(cohortSessions.startsAt, now),
              ),
              orderBy: asc(cohortSessions.startsAt),
              columns: {
                id: true,
                title: true,
                startsAt: true,
                location: true,
                meetingUrl: true,
              },
            }),
          ]);

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
            toReview: pending?.n ?? 0,
            nextSession: nextSession ?? null,
          };
        }),
    );

    return editions;
  }),
});
