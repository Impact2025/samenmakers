import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  createTRPCRouter,
  cohortRoleProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import {
  cohortMaterials,
  cohortSessions,
  cohorts,
  programs,
} from "@/server/db/schema";
import { canViewLibrary } from "@/lib/access";
import { loadPerson } from "@/server/learning/access";
import { isBlobUrl } from "@/lib/upload";

const STAFF = ["docent", "facilitator", "manager"] as const;

export const materialsRouter = createTRPCRouter({
  // Staf: materiaal van één editie (docenten alleen binnen hun toegangsvenster).
  list: cohortRoleProcedure(STAFF).query(async ({ ctx, input }) => {
    const rows = await ctx.db.query.cohortMaterials.findMany({
      where: eq(cohortMaterials.cohortId, input.cohortId),
      orderBy: [desc(cohortMaterials.createdAt)],
      with: { session: { columns: { title: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      fileName: r.fileName,
      sessionTitle: r.session?.title ?? null,
      createdAt: r.createdAt,
      mine: r.uploadedBy === ctx.userId,
    }));
  }),

  add: cohortRoleProcedure(STAFF)
    .input(
      z.object({
        title: z.string().trim().min(2).max(200),
        description: z.string().trim().max(2000).optional(),
        sessionId: z.string().min(1).optional(),
        url: z.string().url().refine(isBlobUrl, "Ongeldige bestandslocatie"),
        fileName: z.string().trim().min(1).max(200),
        mimeType: z.string().max(200).optional(),
        sizeBytes: z.number().int().nonnegative().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.sessionId) {
        const session = await ctx.db.query.cohortSessions.findFirst({
          where: and(
            eq(cohortSessions.id, input.sessionId),
            eq(cohortSessions.cohortId, input.cohortId),
          ),
          columns: { id: true },
        });
        if (!session)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Sessie hoort niet bij deze editie",
          });
      }
      const [row] = await ctx.db
        .insert(cohortMaterials)
        .values({
          cohortId: input.cohortId,
          sessionId: input.sessionId ?? null,
          title: input.title,
          description: input.description ?? null,
          url: input.url,
          fileName: input.fileName,
          mimeType: input.mimeType ?? null,
          sizeBytes: input.sizeBytes ?? null,
          uploadedBy: ctx.userId,
        })
        .returning({ id: cohortMaterials.id });
      return row!;
    }),

  // Docenten verwijderen alleen hun eigen materiaal; facilitator en manager alles.
  remove: cohortRoleProcedure(STAFF)
    .input(z.object({ materialId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.query.cohortMaterials.findFirst({
        where: and(
          eq(cohortMaterials.id, input.materialId),
          eq(cohortMaterials.cohortId, input.cohortId),
        ),
      });
      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Niet gevonden" });
      const role = ctx.membership?.role;
      const mayRemoveAll =
        ctx.isAdmin || role === "facilitator" || role === "manager";
      if (!mayRemoveAll && row.uploadedBy !== ctx.userId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Je kunt alleen je eigen materiaal verwijderen",
        });
      await ctx.db
        .delete(cohortMaterials)
        .where(eq(cohortMaterials.id, row.id));
      return { ok: true };
    }),

  // Kennisbank: al het lesmateriaal, alleen voor alumni (en beheerders).
  library: protectedProcedure
    .input(z.object({ search: z.string().trim().max(100).optional() }))
    .query(async ({ ctx, input }) => {
      const person = await loadPerson(ctx.db, ctx.userId);
      if (!person || !canViewLibrary(person))
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "De kennisbank is er voor alumni na afronding van de opleiding",
        });
      const term = input.search ? `%${input.search}%` : null;
      return ctx.db
        .select({
          id: cohortMaterials.id,
          title: cohortMaterials.title,
          description: cohortMaterials.description,
          url: cohortMaterials.url,
          fileName: cohortMaterials.fileName,
          createdAt: cohortMaterials.createdAt,
          cohortName: cohorts.name,
          programName: programs.name,
          sessionTitle: cohortSessions.title,
        })
        .from(cohortMaterials)
        .innerJoin(cohorts, eq(cohorts.id, cohortMaterials.cohortId))
        .leftJoin(programs, eq(programs.id, cohorts.programId))
        .leftJoin(
          cohortSessions,
          eq(cohortSessions.id, cohortMaterials.sessionId),
        )
        .where(
          term
            ? or(
                ilike(cohortMaterials.title, term),
                ilike(cohortMaterials.description, term),
              )
            : undefined,
        )
        .orderBy(desc(cohortMaterials.createdAt))
        .limit(200);
    }),
});
