import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
import { createTRPCRouter, cohortRoleProcedure } from "@/server/trpc/init";
import {
  assignments,
  cohortMembers,
  cohortSessions,
  submissionFiles,
  submissions,
} from "@/server/db/schema";
import { publicUserColumns } from "@/server/db/user-columns";
import { isLate, sessionCycle } from "@/lib/session-cycle";
import { isBlobUrl } from "@/lib/upload";
import type { db as DbClient } from "@/server/db";

const ALL_ROLES = [
  "cursist",
  "docent",
  "manager",
  "facilitator",
  "alumnus",
] as const;
const STAFF = ["docent", "facilitator", "manager"] as const;
const MAX_FILES = 10;

/** Eigen deadline, anders die van de gekoppelde sessie (standaard 3 dagen vooraf). */
function effectiveDue(
  a: { dueAt: Date | null },
  session: { startsAt: Date; homeworkDueAt: Date | null } | null | undefined,
): Date | null {
  if (a.dueAt) return a.dueAt;
  if (!session) return null;
  return session.homeworkDueAt ?? sessionCycle(session.startsAt).homeworkDueAt;
}

async function requireAssignment(
  db: typeof DbClient,
  cohortId: string,
  assignmentId: string,
) {
  const row = await db.query.assignments.findFirst({
    where: and(
      eq(assignments.id, assignmentId),
      eq(assignments.cohortId, cohortId),
    ),
    with: { session: true },
  });
  if (!row)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Opdracht niet gevonden",
    });
  return row;
}

const fileInput = z.object({
  url: z.string().url().refine(isBlobUrl, "Ongeldige bestandslocatie"),
  name: z.string().trim().min(1).max(200),
  sizeBytes: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(200).optional(),
});

export const assignmentsRouter = createTRPCRouter({
  // Cursist: eigen opdrachten met status. Staf: alle opdrachten met inleverstand.
  list: cohortRoleProcedure(ALL_ROLES).query(async ({ ctx, input }) => {
    const rows = await ctx.db.query.assignments.findMany({
      where: eq(assignments.cohortId, input.cohortId),
      orderBy: [asc(assignments.createdAt)],
      with: { session: true },
    });
    const ids = rows.map((r) => r.id);
    const isStaff =
      ctx.isAdmin ||
      (ctx.membership !== null &&
        (STAFF as readonly string[]).includes(ctx.membership.role));

    if (isStaff) {
      const learnerCount = await ctx.db
        .select({ n: count() })
        .from(cohortMembers)
        .where(
          and(
            eq(cohortMembers.cohortId, input.cohortId),
            eq(cohortMembers.role, "cursist"),
            ne(cohortMembers.status, "uitgeschreven"),
          ),
        );
      const counts = ids.length
        ? await ctx.db
            .select({ assignmentId: submissions.assignmentId, n: count() })
            .from(submissions)
            .where(inArray(submissions.assignmentId, ids))
            .groupBy(submissions.assignmentId)
        : [];
      const byAssignment = new Map(counts.map((c) => [c.assignmentId, c.n]));
      return rows.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sessionTitle: a.session?.title ?? null,
        dueAt: effectiveDue(a, a.session),
        submittedCount: byAssignment.get(a.id) ?? 0,
        learnerCount: learnerCount[0]?.n ?? 0,
        mine: null,
      }));
    }

    const mine = ids.length
      ? await ctx.db.query.submissions.findMany({
          where: and(
            inArray(submissions.assignmentId, ids),
            eq(submissions.userId, ctx.userId),
          ),
          with: { files: true },
        })
      : [];
    const mineBy = new Map(mine.map((s) => [s.assignmentId, s]));
    return rows.map((a) => {
      const s = mineBy.get(a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        sessionTitle: a.session?.title ?? null,
        dueAt: effectiveDue(a, a.session),
        submittedCount: 0,
        learnerCount: 0,
        mine: s
          ? {
              id: s.id,
              status: s.status,
              isLate: s.isLate,
              text: s.text,
              feedback: s.feedback,
              submittedAt: s.submittedAt,
              files: s.files.map((f) => ({
                id: f.id,
                url: f.url,
                name: f.name,
              })),
            }
          : null,
      };
    });
  }),

  create: cohortRoleProcedure(STAFF)
    .input(
      z.object({
        title: z.string().trim().min(2).max(200),
        description: z.string().trim().max(4000).optional(),
        sessionId: z.string().min(1).optional(),
        dueAt: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.sessionId) {
        const session = await ctx.db.query.cohortSessions.findFirst({
          where: and(
            eq(cohortSessions.id, input.sessionId),
            eq(cohortSessions.cohortId, input.cohortId),
          ),
        });
        if (!session)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Sessie hoort niet bij deze editie",
          });
      }
      const [row] = await ctx.db
        .insert(assignments)
        .values({
          cohortId: input.cohortId,
          sessionId: input.sessionId ?? null,
          title: input.title,
          description: input.description ?? null,
          dueAt: input.dueAt ?? null,
          createdBy: ctx.userId,
        })
        .returning();
      return row!;
    }),

  // Alleen cursisten leveren in. Opnieuw inleveren vervangt de vorige inlevering.
  submit: cohortRoleProcedure(["cursist"])
    .input(
      z.object({
        assignmentId: z.string().min(1),
        text: z.string().trim().max(10_000).optional(),
        files: z.array(fileInput).max(MAX_FILES).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.text && input.files.length === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voeg tekst of een bestand toe",
        });
      const assignment = await requireAssignment(
        ctx.db,
        input.cohortId,
        input.assignmentId,
      );
      const now = new Date();
      const late = isLate(now, effectiveDue(assignment, assignment.session));

      const [row] = await ctx.db
        .insert(submissions)
        .values({
          assignmentId: assignment.id,
          userId: ctx.userId,
          text: input.text ?? null,
          isLate: late,
          submittedAt: now,
        })
        .onConflictDoUpdate({
          target: [submissions.assignmentId, submissions.userId],
          set: {
            text: input.text ?? null,
            isLate: late,
            submittedAt: now,
            // Nieuwe versie: eerdere beoordeling vervalt, docent moet opnieuw kijken.
            status: "ingeleverd",
            feedback: null,
            reviewedBy: null,
            reviewedAt: null,
          },
        })
        .returning();

      await ctx.db
        .delete(submissionFiles)
        .where(eq(submissionFiles.submissionId, row!.id));
      if (input.files.length > 0) {
        await ctx.db.insert(submissionFiles).values(
          input.files.map((f) => ({
            submissionId: row!.id,
            url: f.url,
            name: f.name,
            sizeBytes: f.sizeBytes ?? null,
            mimeType: f.mimeType ?? null,
          })),
        );
      }
      return { id: row!.id, isLate: late };
    }),

  // Staf: alle inleveringen van één opdracht, plus wie nog niets heeft ingeleverd.
  submissions: cohortRoleProcedure(STAFF)
    .input(z.object({ assignmentId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const assignment = await requireAssignment(
        ctx.db,
        input.cohortId,
        input.assignmentId,
      );
      const learners = await ctx.db.query.cohortMembers.findMany({
        where: and(
          eq(cohortMembers.cohortId, input.cohortId),
          eq(cohortMembers.role, "cursist"),
          ne(cohortMembers.status, "uitgeschreven"),
        ),
        with: { user: { columns: publicUserColumns } },
      });
      const subs = await ctx.db.query.submissions.findMany({
        where: eq(submissions.assignmentId, assignment.id),
        with: { files: true },
      });
      const subBy = new Map(subs.map((s) => [s.userId, s]));
      return {
        assignment: {
          id: assignment.id,
          title: assignment.title,
          dueAt: effectiveDue(assignment, assignment.session),
        },
        rows: learners
          .map((l) => {
            const s = subBy.get(l.userId);
            return {
              userId: l.userId,
              naam: l.user.naam ?? l.user.name ?? "Cursist",
              submission: s
                ? {
                    id: s.id,
                    status: s.status,
                    isLate: s.isLate,
                    text: s.text,
                    feedback: s.feedback,
                    submittedAt: s.submittedAt,
                    files: s.files.map((f) => ({
                      id: f.id,
                      url: f.url,
                      name: f.name,
                    })),
                  }
                : null,
            };
          })
          .sort((a, b) => a.naam.localeCompare(b.naam, "nl")),
      };
    }),

  review: cohortRoleProcedure(STAFF)
    .input(
      z.object({
        submissionId: z.string().min(1),
        feedback: z.string().trim().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // De inlevering moet bij een opdracht van deze editie horen.
      const sub = await ctx.db.query.submissions.findFirst({
        where: eq(submissions.id, input.submissionId),
        with: { assignment: true },
      });
      if (!sub || sub.assignment.cohortId !== input.cohortId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inlevering niet gevonden",
        });
      await ctx.db
        .update(submissions)
        .set({
          status: "beoordeeld",
          feedback: input.feedback,
          reviewedBy: ctx.userId,
          reviewedAt: new Date(),
        })
        .where(eq(submissions.id, sub.id));
      return { ok: true };
    }),
});
