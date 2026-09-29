import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { createTRPCRouter, cohortRoleProcedure } from "@/server/trpc/init";
import { attendance, cohortMembers, cohortSessions } from "@/server/db/schema";
import { publicUserColumns } from "@/server/db/user-columns";
import { cyclePhase, sessionCycle, teacherWindow } from "@/lib/session-cycle";
import type { db as DbClient } from "@/server/db";

const ALL_ROLES = [
  "cursist",
  "docent",
  "manager",
  "facilitator",
  "alumnus",
] as const;
// De facilitator plant sessies en registreert aanwezigheid; de manager mag hetzelfde.
const PLANNERS = ["facilitator", "manager"] as const;

/**
 * Houdt het toegangsvenster van een docent in sync met zijn sessies:
 * 2 weken voor de eerste tot 2 weken na de laatste. Een bestaand lidmaatschap met een
 * andere rol (bijv. cursist) blijft ongemoeid.
 */
export async function syncTeacherAccess(
  db: typeof DbClient,
  cohortId: string,
  teacherId: string,
) {
  const rows = await db
    .select({ startsAt: cohortSessions.startsAt })
    .from(cohortSessions)
    .where(
      and(
        eq(cohortSessions.cohortId, cohortId),
        eq(cohortSessions.teacherId, teacherId),
      ),
    );
  const window = teacherWindow(rows.map((r) => r.startsAt));

  const existing = await db.query.cohortMembers.findFirst({
    where: and(
      eq(cohortMembers.cohortId, cohortId),
      eq(cohortMembers.userId, teacherId),
    ),
  });
  if (existing && existing.role !== "docent") return;

  if (!existing) {
    if (!window) return;
    await db.insert(cohortMembers).values({
      cohortId,
      userId: teacherId,
      role: "docent",
      accessFrom: window.from,
      accessUntil: window.until,
    });
    return;
  }
  await db
    .update(cohortMembers)
    .set({
      accessFrom: window?.from ?? null,
      accessUntil: window?.until ?? null,
    })
    .where(eq(cohortMembers.id, existing.id));
}

const sessionInput = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  startsAt: z.coerce.date(),
  location: z.string().trim().max(200).optional(),
  meetingUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  teacherId: z.string().min(1).nullable().optional(),
});

async function requireSession(
  db: typeof DbClient,
  cohortId: string,
  sessionId: string,
) {
  const session = await db.query.cohortSessions.findFirst({
    where: and(
      eq(cohortSessions.id, sessionId),
      eq(cohortSessions.cohortId, cohortId),
    ),
  });
  if (!session)
    throw new TRPCError({ code: "NOT_FOUND", message: "Sessie niet gevonden" });
  return session;
}

export const sessionsRouter = createTRPCRouter({
  // Alle sessies van een editie, met cyclus-momenten en (voor staf) aanwezigheidstelling.
  list: cohortRoleProcedure(ALL_ROLES).query(async ({ ctx, input }) => {
    const rows = await ctx.db.query.cohortSessions.findMany({
      where: eq(cohortSessions.cohortId, input.cohortId),
      orderBy: [asc(cohortSessions.startsAt)],
      with: { teacher: { columns: publicUserColumns } },
    });
    const now = new Date();
    return rows.map((s) => {
      const cycle = sessionCycle(s.startsAt);
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        startsAt: s.startsAt,
        location: s.location,
        meetingUrl: s.meetingUrl,
        teacher: s.teacher
          ? { id: s.teacher.id, naam: s.teacher.naam ?? s.teacher.name }
          : null,
        homeworkDueAt: s.homeworkDueAt ?? cycle.homeworkDueAt,
        phase: cyclePhase(s.startsAt, now),
        briefingSentAt: s.briefingSentAt,
        homeworkMailSentAt: s.homeworkMailSentAt,
      };
    });
  }),

  create: cohortRoleProcedure(PLANNERS)
    .input(sessionInput)
    .mutation(async ({ ctx, input }) => {
      const { cohortId, teacherId, meetingUrl, ...rest } = input;
      const [row] = await ctx.db
        .insert(cohortSessions)
        .values({
          ...rest,
          cohortId,
          meetingUrl: meetingUrl || null,
          teacherId: teacherId ?? null,
          homeworkDueAt: sessionCycle(rest.startsAt).homeworkDueAt,
        })
        .returning();
      if (teacherId) await syncTeacherAccess(ctx.db, cohortId, teacherId);
      return row!;
    }),

  update: cohortRoleProcedure(PLANNERS)
    .input(sessionInput.extend({ sessionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { cohortId, sessionId, teacherId, meetingUrl, ...rest } = input;
      const current = await requireSession(ctx.db, cohortId, sessionId);
      // Verschoven sessie: standaarddeadline schuift mee, een eigen deadline blijft staan.
      const usedDefault =
        !current.homeworkDueAt ||
        current.homeworkDueAt.getTime() ===
          sessionCycle(current.startsAt).homeworkDueAt.getTime();
      await ctx.db
        .update(cohortSessions)
        .set({
          ...rest,
          meetingUrl: meetingUrl || null,
          teacherId: teacherId ?? null,
          ...(usedDefault
            ? { homeworkDueAt: sessionCycle(rest.startsAt).homeworkDueAt }
            : {}),
        })
        .where(eq(cohortSessions.id, sessionId));
      // Oude en nieuwe docent allebei bijwerken (venster kan krimpen of groeien).
      for (const id of new Set([current.teacherId, teacherId ?? null])) {
        if (id) await syncTeacherAccess(ctx.db, cohortId, id);
      }
      return { ok: true };
    }),

  remove: cohortRoleProcedure(PLANNERS)
    .input(z.object({ sessionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const current = await requireSession(
        ctx.db,
        input.cohortId,
        input.sessionId,
      );
      await ctx.db
        .delete(cohortSessions)
        .where(eq(cohortSessions.id, input.sessionId));
      if (current.teacherId)
        await syncTeacherAccess(ctx.db, input.cohortId, current.teacherId);
      return { ok: true };
    }),

  // Aanwezigheidslijst van één sessie: alle actieve cursisten met hun status (of null).
  attendance: cohortRoleProcedure([...PLANNERS, "docent"])
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await requireSession(ctx.db, input.cohortId, input.sessionId);
      const learners = await ctx.db.query.cohortMembers.findMany({
        where: and(
          eq(cohortMembers.cohortId, input.cohortId),
          eq(cohortMembers.role, "cursist"),
          ne(cohortMembers.status, "uitgeschreven"),
        ),
        with: { user: { columns: publicUserColumns } },
      });
      const marks = await ctx.db
        .select()
        .from(attendance)
        .where(eq(attendance.sessionId, input.sessionId));
      const byUser = new Map(marks.map((m) => [m.userId, m.status]));
      return learners
        .map((l) => ({
          userId: l.userId,
          naam: l.user.naam ?? l.user.name ?? "Cursist",
          avatarUrl: l.user.avatarUrl,
          status: byUser.get(l.userId) ?? null,
        }))
        .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
    }),

  markAttendance: cohortRoleProcedure(PLANNERS)
    .input(
      z.object({
        sessionId: z.string().min(1),
        userId: z.string().min(1),
        status: z.enum(["aanwezig", "afwezig", "geoorloofd"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSession(ctx.db, input.cohortId, input.sessionId);
      // Alleen deelnemers van deze editie kunnen als aanwezig worden gemarkeerd.
      const member = await ctx.db.query.cohortMembers.findFirst({
        where: and(
          eq(cohortMembers.cohortId, input.cohortId),
          eq(cohortMembers.userId, input.userId),
        ),
      });
      if (!member)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Geen deelnemer van deze editie",
        });
      await ctx.db
        .insert(attendance)
        .values({
          sessionId: input.sessionId,
          userId: input.userId,
          status: input.status,
          markedBy: ctx.userId,
        })
        .onConflictDoUpdate({
          target: [attendance.sessionId, attendance.userId],
          set: {
            status: input.status,
            markedBy: ctx.userId,
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    }),
});
