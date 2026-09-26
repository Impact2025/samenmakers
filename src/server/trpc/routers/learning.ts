import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, count, eq, ne } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  cohortRoleProcedure,
} from "@/server/trpc/init";
import {
  cohortMembers,
  cohorts,
  lessonProgress,
  lessons,
} from "@/server/db/schema";
import {
  loadCurriculum,
  loadStatusMap,
  loadStatusMapsForCohort,
} from "@/server/learning/curriculum";
import { computeProgress, findNextLesson, moduleWindow } from "@/lib/learning";
import type { db as DbClient } from "@/server/db";

const ALL_ROLES = ["cursist", "docent", "manager", "alumnus"] as const;
const STAFF_ROLES = ["docent", "manager"] as const;

async function requireEdition(db: typeof DbClient, cohortId: string) {
  const cohort = await db.query.cohorts.findFirst({
    where: eq(cohorts.id, cohortId),
    with: { program: true },
  });
  if (!cohort?.program)
    throw new TRPCError({ code: "NOT_FOUND", message: "Editie niet gevonden" });
  return { ...cohort, program: cohort.program };
}

export const learningRouter = createTRPCRouter({
  // "Mijn leren": every edition the user takes part in, with progress and next step.
  home: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.query.cohortMembers.findMany({
      where: and(
        eq(cohortMembers.userId, ctx.userId),
        ne(cohortMembers.status, "uitgeschreven"),
      ),
      with: { cohort: { with: { program: true } } },
    });

    const editions = await Promise.all(
      memberships
        .filter((m) => m.cohort.program)
        .map(async (m) => {
          const cohort = m.cohort;
          const program = cohort.program!;
          const { modules: mods, lessons: flat } = await loadCurriculum(
            ctx.db,
            program.id,
          );
          const status = await loadStatusMap(ctx.db, ctx.userId, cohort.id);
          const next = findNextLesson(flat, status);
          const now = new Date();
          const currentModule =
            mods.find((mod) => {
              const w = moduleWindow(
                cohort.startDate,
                mod.startOffsetDays,
                mod.endOffsetDays,
              );
              return w.start && w.end && w.start <= now && now <= w.end;
            }) ?? null;
          const currentWindow = currentModule
            ? moduleWindow(
                cohort.startDate,
                currentModule.startOffsetDays,
                currentModule.endOffsetDays,
              )
            : null;
          return {
            membershipId: m.id,
            role: m.role,
            enrollmentStatus: m.status,
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
              tagline: program.tagline,
              color: program.color,
              logoUrl: program.logoUrl,
              coverImageUrl: program.coverImageUrl,
            },
            progress: computeProgress(flat, status),
            nextLesson: next
              ? {
                  id: next.id,
                  title: next.title,
                  moduleTitle: next.moduleTitle,
                  type: next.type,
                }
              : null,
            currentModule: currentModule
              ? {
                  title: currentModule.title,
                  endsAt: currentWindow?.end ?? null,
                }
              : null,
            lessonCount: flat.length,
          };
        }),
    );

    return {
      learning: editions.filter(
        (e) => e.role === "cursist" || e.role === "alumnus",
      ),
      teaching: editions.filter(
        (e) => e.role === "docent" || e.role === "manager",
      ),
    };
  }),

  // Leerpad of one edition.
  cohort: cohortRoleProcedure(ALL_ROLES).query(async ({ ctx, input }) => {
    const cohort = await requireEdition(ctx.db, input.cohortId);
    const { modules: mods, lessons: flat } = await loadCurriculum(
      ctx.db,
      cohort.program.id,
    );
    const status = await loadStatusMap(ctx.db, ctx.userId, cohort.id);
    const next = findNextLesson(flat, status);

    return {
      cohort: {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        status: cohort.status,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
      },
      program: cohort.program,
      role: ctx.membership?.role ?? null,
      isStaff:
        ctx.isAdmin ||
        (ctx.membership
          ? STAFF_ROLES.includes(ctx.membership.role as never)
          : false),
      progress: computeProgress(flat, status),
      nextLessonId: next?.id ?? null,
      modules: mods.map((mod) => {
        const w = moduleWindow(
          cohort.startDate,
          mod.startOffsetDays,
          mod.endOffsetDays,
        );
        return {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          startsAt: w.start,
          endsAt: w.end,
          progress: computeProgress(mod.lessons, status),
          lessons: mod.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            durationMinutes: l.durationMinutes,
            isRequired: l.isRequired,
            status: status.get(l.id) ?? ("open" as const),
          })),
        };
      }),
    };
  }),

  lesson: cohortRoleProcedure(ALL_ROLES)
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cohort = await requireEdition(ctx.db, input.cohortId);
      const { lessons: flat } = await loadCurriculum(ctx.db, cohort.program.id);
      const idx = flat.findIndex((l) => l.id === input.lessonId);
      if (idx === -1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Les niet gevonden",
        });
      const lesson = flat[idx]!;

      const progress = await ctx.db.query.lessonProgress.findFirst({
        where: and(
          eq(lessonProgress.userId, ctx.userId),
          eq(lessonProgress.lessonId, lesson.id),
          eq(lessonProgress.cohortId, cohort.id),
        ),
      });

      const status = await loadStatusMap(ctx.db, ctx.userId, cohort.id);
      const prev = flat[idx - 1];
      const nxt = flat[idx + 1];
      return {
        cohort: { id: cohort.id, name: cohort.name },
        program: {
          id: cohort.program.id,
          name: cohort.program.name,
          color: cohort.program.color,
        },
        lesson,
        position: { index: idx + 1, total: flat.length },
        status: progress?.status ?? ("open" as const),
        note: progress?.note ?? "",
        progress: computeProgress(flat, status),
        prev: prev ? { id: prev.id, title: prev.title } : null,
        next: nxt ? { id: nxt.id, title: nxt.title } : null,
      };
    }),

  // Record that a learner opened a lesson (open → bezig). Never downgrades "klaar".
  startLesson: cohortRoleProcedure(ALL_ROLES)
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertLessonInEdition(ctx.db, input.cohortId, input.lessonId);
      await ctx.db
        .insert(lessonProgress)
        .values({
          userId: ctx.userId,
          lessonId: input.lessonId,
          cohortId: input.cohortId,
          status: "bezig",
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  setLessonStatus: cohortRoleProcedure(ALL_ROLES)
    .input(z.object({ lessonId: z.string(), done: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertLessonInEdition(ctx.db, input.cohortId, input.lessonId);
      const now = new Date();
      const status = input.done ? ("klaar" as const) : ("bezig" as const);
      await ctx.db
        .insert(lessonProgress)
        .values({
          userId: ctx.userId,
          lessonId: input.lessonId,
          cohortId: input.cohortId,
          status,
          completedAt: input.done ? now : null,
        })
        .onConflictDoUpdate({
          target: [
            lessonProgress.userId,
            lessonProgress.lessonId,
            lessonProgress.cohortId,
          ],
          set: { status, completedAt: input.done ? now : null, updatedAt: now },
        });
      return { success: true, status };
    }),

  saveNote: cohortRoleProcedure(ALL_ROLES)
    .input(z.object({ lessonId: z.string(), note: z.string().max(10_000) }))
    .mutation(async ({ ctx, input }) => {
      await assertLessonInEdition(ctx.db, input.cohortId, input.lessonId);
      const now = new Date();
      await ctx.db
        .insert(lessonProgress)
        .values({
          userId: ctx.userId,
          lessonId: input.lessonId,
          cohortId: input.cohortId,
          status: "bezig",
          note: input.note,
        })
        .onConflictDoUpdate({
          target: [
            lessonProgress.userId,
            lessonProgress.lessonId,
            lessonProgress.cohortId,
          ],
          set: { note: input.note, updatedAt: now },
        });
      return { success: true };
    }),

  // Join an edition with its invite code (bestaande `inviteCode`).
  joinByCode: protectedProcedure
    .input(z.object({ code: z.string().trim().min(4).max(32) }))
    .mutation(async ({ ctx, input }) => {
      const cohort = await ctx.db.query.cohorts.findFirst({
        where: eq(cohorts.inviteCode, input.code.toUpperCase()),
      });
      if (!cohort?.programId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Onbekende uitnodigingscode",
        });
      }
      if (cohort.status !== "open" && cohort.status !== "lopend") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deze editie staat niet open voor inschrijving",
        });
      }

      const existing = await ctx.db.query.cohortMembers.findFirst({
        where: and(
          eq(cohortMembers.cohortId, cohort.id),
          eq(cohortMembers.userId, ctx.userId),
        ),
      });
      if (existing && existing.status !== "uitgeschreven")
        return { cohortId: cohort.id, alreadyMember: true };

      if (cohort.capacity != null) {
        const [row] = await ctx.db
          .select({ n: count() })
          .from(cohortMembers)
          .where(
            and(
              eq(cohortMembers.cohortId, cohort.id),
              eq(cohortMembers.role, "cursist"),
              ne(cohortMembers.status, "uitgeschreven"),
            ),
          );
        if (Number(row?.n ?? 0) >= cohort.capacity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Deze editie is vol",
          });
        }
      }

      if (existing) {
        await ctx.db
          .update(cohortMembers)
          .set({ status: "actief", role: "cursist" })
          .where(eq(cohortMembers.id, existing.id));
      } else {
        await ctx.db
          .insert(cohortMembers)
          .values({ cohortId: cohort.id, userId: ctx.userId, role: "cursist" })
          .onConflictDoNothing();
      }
      return { cohortId: cohort.id, alreadyMember: false };
    }),

  // Cursistoverzicht for docenten and programmamanagers.
  participants: cohortRoleProcedure(STAFF_ROLES).query(
    async ({ ctx, input }) => {
      const cohort = await requireEdition(ctx.db, input.cohortId);
      const { lessons: flat } = await loadCurriculum(ctx.db, cohort.program.id);
      const members = await ctx.db.query.cohortMembers.findMany({
        where: eq(cohortMembers.cohortId, cohort.id),
        with: { user: true },
      });
      const learners = members.filter(
        (m) => m.role === "cursist" || m.role === "alumnus",
      );
      const maps = await loadStatusMapsForCohort(
        ctx.db,
        cohort.id,
        learners.map((m) => m.userId),
      );

      const now = Date.now();
      return {
        cohort: {
          id: cohort.id,
          name: cohort.name,
          startDate: cohort.startDate,
        },
        program: {
          id: cohort.program.id,
          name: cohort.program.name,
          color: cohort.program.color,
        },
        lessonCount: flat.length,
        staff: members
          .filter((m) => m.role === "docent" || m.role === "manager")
          .map((m) => ({
            id: m.id,
            role: m.role,
            naam: m.user.naam ?? m.user.name ?? m.user.email ?? "Onbekend",
            avatarUrl: m.user.avatarUrl,
          })),
        learners: learners
          .map((m) => {
            const entry = maps.get(m.userId);
            const progress = computeProgress(flat, entry?.status ?? new Map());
            const lastActivity = entry?.lastActivity ?? null;
            const inactiveDays = lastActivity
              ? Math.floor((now - lastActivity.getTime()) / 86_400_000)
              : Math.floor((now - m.joinedAt.getTime()) / 86_400_000);
            return {
              membershipId: m.id,
              userId: m.userId,
              naam: m.user.naam ?? m.user.name ?? m.user.email ?? "Onbekend",
              avatarUrl: m.user.avatarUrl,
              status: m.status,
              progress,
              lastActivity,
              // Simple phase-1 risk signal: active learner, no activity for 14+ days.
              atRisk:
                m.status === "actief" &&
                progress.percent < 100 &&
                inactiveDays >= 14,
            };
          })
          .sort((a, b) => a.progress.percent - b.progress.percent),
      };
    },
  ),
});

async function assertLessonInEdition(
  db: typeof DbClient,
  cohortId: string,
  lessonId: string,
) {
  const cohort = await requireEdition(db, cohortId);
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { module: true },
  });
  if (!lesson || lesson.module.programId !== cohort.program.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Les hoort niet bij deze editie",
    });
  }
}
