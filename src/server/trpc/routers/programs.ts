import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  lt,
  max,
  sql,
} from "drizzle-orm";
import { parseEmailList } from "@/lib/email-list";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import {
  auditLog,
  cohortMembers,
  cohorts,
  lessons,
  modules,
  programs,
  users,
} from "@/server/db/schema";
import {
  COHORT_ROLE_LABELS,
  generateInviteCode,
  shiftEditionDates,
} from "@/lib/learning";
import { sendInviteEmail } from "@/lib/email";
import { createResetToken } from "@/server/auth/password-reset";
import { generateReferralCode } from "@/server/auth/config";
import { slugify } from "@/lib/utils";
import type { db as DbClient } from "@/server/db";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Gebruik een hex-kleur zoals #2d6a4f");
const optionalUrl = z.string().url().or(z.literal("")).optional();

const programInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(80).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().max(10_000).optional(),
  color: hexColor.optional(),
  logoUrl: optionalUrl,
  coverImageUrl: optionalUrl,
  status: z.enum(["concept", "gepubliceerd", "gearchiveerd"]).optional(),
  priceCents: z.number().int().min(0).nullable().optional(),
  admissionMode: z.enum(["open", "uitnodiging", "aanmelding"]).optional(),
});

const lessonContent = z.object({
  body: z.string().max(100_000).optional(),
  videoUrl: z.string().url().or(z.literal("")).optional(),
  fileUrl: z.string().url().or(z.literal("")).optional(),
  fileName: z.string().max(200).optional(),
  prompt: z.string().max(2_000).optional(),
  meetingUrl: z.string().url().or(z.literal("")).optional(),
  startsAt: z.string().optional(),
});

const lessonType = z.enum(["tekst", "video", "bestand", "reflectie", "live"]);

const cohortFields = {
  name: z.string().trim().min(2).max(120),
  description: z.string().max(5_000).optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  capacity: z.number().int().min(1).nullable().optional(),
  status: z.enum(["concept", "open", "lopend", "afgerond"]).optional(),
  minLessonPercent: z.number().int().min(0).max(100).optional(),
};

const emptyToNull = (v: string | undefined) => (v === "" ? null : v);

/** Drop undefined keys (the project uses exactOptionalPropertyTypes). */
function defined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}

export const programsRouter = createTRPCRouter({
  // ---------- Programs ----------
  list: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.programs.findMany({
      orderBy: [desc(programs.createdAt)],
      with: {
        modules: { columns: { id: true } },
        cohorts: { columns: { id: true, status: true } },
      },
    });
    return rows.map((p) => ({
      ...p,
      moduleCount: p.modules.length,
      cohortCount: p.cohorts.length,
      activeCohortCount: p.cohorts.filter(
        (c) => c.status === "open" || c.status === "lopend",
      ).length,
    }));
  }),

  byId: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        with: {
          modules: {
            orderBy: [asc(modules.position), asc(modules.createdAt)],
            with: {
              lessons: {
                orderBy: [asc(lessons.position), asc(lessons.createdAt)],
              },
            },
          },
          cohorts: {
            orderBy: [desc(cohorts.createdAt)],
            with: { members: { columns: { role: true, status: true } } },
          },
        },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...program,
        cohorts: program.cohorts.map(({ members, ...c }) => ({
          ...c,
          learnerCount: members.filter(
            (m) => m.role === "cursist" && m.status !== "uitgeschreven",
          ).length,
          staffCount: members.filter(
            (m) =>
              m.role === "docent" ||
              m.role === "manager" ||
              m.role === "facilitator",
          ).length,
        })),
      };
    }),

  create: adminProcedure
    .input(programInput)
    .mutation(async ({ ctx, input }) => {
      const slug = await uniqueSlug(ctx.db, slugify(input.slug || input.name));
      const [program] = await ctx.db
        .insert(programs)
        .values({
          ...input,
          slug,
          logoUrl: emptyToNull(input.logoUrl),
          coverImageUrl: emptyToNull(input.coverImageUrl),
          createdBy: ctx.userId,
        })
        .returning();
      await audit(ctx, "create_program", "program", program!.id, {
        name: input.name,
      });
      return program!;
    }),

  update: adminProcedure
    .input(programInput.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const patch: Partial<typeof programs.$inferInsert> = {
        ...defined({
          ...data,
          logoUrl:
            data.logoUrl === undefined ? undefined : emptyToNull(data.logoUrl),
          coverImageUrl:
            data.coverImageUrl === undefined
              ? undefined
              : emptyToNull(data.coverImageUrl),
        }),
        updatedAt: new Date(),
      };
      if (data.slug !== undefined)
        patch.slug = await uniqueSlug(
          ctx.db,
          slugify(data.slug || data.name || ""),
          id,
        );
      await ctx.db.update(programs).set(patch).where(eq(programs.id, id));
      await audit(ctx, "update_program", "program", id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ n: count() })
        .from(cohorts)
        .where(eq(cohorts.programId, input.id));
      if (Number(row?.n ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Dit programma heeft edities. Archiveer het in plaats van te verwijderen.",
        });
      }
      await ctx.db.delete(programs).where(eq(programs.id, input.id));
      await audit(ctx, "delete_program", "program", input.id);
      return { success: true };
    }),

  // ---------- Modules ----------
  moduleCreate: adminProcedure
    .input(
      z.object({
        programId: z.string(),
        title: z.string().trim().min(1).max(200),
        description: z.string().max(5_000).optional(),
        startOffsetDays: z.number().int().nullable().optional(),
        endOffsetDays: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ m: max(modules.position) })
        .from(modules)
        .where(eq(modules.programId, input.programId));
      const [mod] = await ctx.db
        .insert(modules)
        .values({ ...input, position: (row?.m ?? -1) + 1 })
        .returning();
      return mod!;
    }),

  moduleUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().max(5_000).optional(),
        startOffsetDays: z.number().int().nullable().optional(),
        endOffsetDays: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(modules).set(data).where(eq(modules.id, id));
      return { success: true };
    }),

  moduleDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(modules).where(eq(modules.id, input.id));
      await audit(ctx, "delete_module", "module", input.id);
      return { success: true };
    }),

  moduleMove: adminProcedure
    .input(z.object({ id: z.string(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const mod = await ctx.db.query.modules.findFirst({
        where: eq(modules.id, input.id),
      });
      if (!mod) throw new TRPCError({ code: "NOT_FOUND" });
      const neighbour = await ctx.db.query.modules.findFirst({
        where: and(
          eq(modules.programId, mod.programId),
          input.direction === "up"
            ? lt(modules.position, mod.position)
            : gt(modules.position, mod.position),
        ),
        orderBy: [
          input.direction === "up"
            ? desc(modules.position)
            : asc(modules.position),
        ],
      });
      if (!neighbour) return { success: true };
      await ctx.db.batch([
        ctx.db
          .update(modules)
          .set({ position: neighbour.position })
          .where(eq(modules.id, mod.id)),
        ctx.db
          .update(modules)
          .set({ position: mod.position })
          .where(eq(modules.id, neighbour.id)),
      ]);
      return { success: true };
    }),

  // ---------- Lessons ----------
  lessonCreate: adminProcedure
    .input(
      z.object({
        moduleId: z.string(),
        title: z.string().trim().min(1).max(200),
        type: lessonType.default("tekst"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ m: max(lessons.position) })
        .from(lessons)
        .where(eq(lessons.moduleId, input.moduleId));
      const [lesson] = await ctx.db
        .insert(lessons)
        .values({ ...input, content: {}, position: (row?.m ?? -1) + 1 })
        .returning();
      return lesson!;
    }),

  lessonById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
        with: { module: { with: { program: true } } },
      });
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
      return lesson;
    }),

  lessonUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(200).optional(),
        type: lessonType.optional(),
        content: lessonContent.optional(),
        durationMinutes: z
          .number()
          .int()
          .min(0)
          .max(10_000)
          .nullable()
          .optional(),
        isRequired: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const { content, ...rest } = data;
      await ctx.db
        .update(lessons)
        .set({
          ...defined(rest),
          ...(content ? { content: defined(content) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(lessons.id, id));
      return { success: true };
    }),

  lessonDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(lessons).where(eq(lessons.id, input.id));
      await audit(ctx, "delete_lesson", "lesson", input.id);
      return { success: true };
    }),

  lessonMove: adminProcedure
    .input(z.object({ id: z.string(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
      });
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
      const neighbour = await ctx.db.query.lessons.findFirst({
        where: and(
          eq(lessons.moduleId, lesson.moduleId),
          input.direction === "up"
            ? lt(lessons.position, lesson.position)
            : gt(lessons.position, lesson.position),
        ),
        orderBy: [
          input.direction === "up"
            ? desc(lessons.position)
            : asc(lessons.position),
        ],
      });
      if (!neighbour) return { success: true };
      await ctx.db.batch([
        ctx.db
          .update(lessons)
          .set({ position: neighbour.position })
          .where(eq(lessons.id, lesson.id)),
        ctx.db
          .update(lessons)
          .set({ position: lesson.position })
          .where(eq(lessons.id, neighbour.id)),
      ]);
      return { success: true };
    }),

  // ---------- Editions (cohorts) ----------
  cohortCreate: adminProcedure
    .input(z.object({ programId: z.string(), ...cohortFields }))
    .mutation(async ({ ctx, input }) => {
      const { minLessonPercent, ...data } = input;
      const [cohort] = await ctx.db
        .insert(cohorts)
        .values({
          ...data,
          inviteCode: generateInviteCode(),
          completionRules:
            minLessonPercent != null ? { minLessonPercent } : null,
          createdBy: ctx.userId,
        })
        .returning();
      await audit(ctx, "create_cohort", "cohort", cohort!.id, {
        programId: input.programId,
        name: input.name,
      });
      return cohort!;
    }),

  cohortById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const cohort = await ctx.db.query.cohorts.findFirst({
        where: eq(cohorts.id, input.id),
        with: {
          program: true,
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  naam: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      if (!cohort) throw new TRPCError({ code: "NOT_FOUND" });
      return cohort;
    }),

  cohortUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        ...cohortFields,
        name: cohortFields.name.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, minLessonPercent, ...data } = input;
      await ctx.db
        .update(cohorts)
        .set({
          ...data,
          ...(minLessonPercent !== undefined
            ? { completionRules: { minLessonPercent } }
            : {}),
        })
        .where(eq(cohorts.id, id));
      await audit(ctx, "update_cohort", "cohort", id, input);
      return { success: true };
    }),

  cohortRegenerateCode: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inviteCode = generateInviteCode();
      await ctx.db
        .update(cohorts)
        .set({ inviteCode })
        .where(eq(cohorts.id, input.id));
      return { inviteCode };
    }),

  // New edition based on an existing one: settings + staff, dates shifted.
  // Modules and lessons belong to the program, so they come along automatically.
  cohortDuplicate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2).max(120),
        startDate: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.query.cohorts.findFirst({
        where: eq(cohorts.id, input.id),
        with: { members: true },
      });
      if (!source) throw new TRPCError({ code: "NOT_FOUND" });
      const dates = shiftEditionDates(
        source.startDate,
        source.endDate,
        input.startDate,
      );
      const [copy] = await ctx.db
        .insert(cohorts)
        .values({
          name: input.name,
          description: source.description,
          programId: source.programId,
          capacity: source.capacity,
          completionRules: source.completionRules,
          isPublic: source.isPublic,
          status: "concept",
          ...dates,
          inviteCode: generateInviteCode(),
          createdBy: ctx.userId,
        })
        .returning();
      // Docenten horen bij sessies en krijgen daar hun tijdvenster; die nemen we niet mee.
      const staff = source.members.filter(
        (m) => m.role === "manager" || m.role === "facilitator",
      );
      if (staff.length > 0) {
        await ctx.db
          .insert(cohortMembers)
          .values(
            staff.map((m) => ({
              cohortId: copy!.id,
              userId: m.userId,
              role: m.role,
            })),
          )
          .onConflictDoNothing();
      }
      await audit(ctx, "duplicate_cohort", "cohort", copy!.id, {
        from: source.id,
      });
      return copy!;
    }),

  // ---------- Members ----------
  // Voegt iemand toe aan een editie. Bestaat het account nog niet, dan wordt het aangemaakt en
  // krijgt de persoon een uitnodiging om zelf een wachtwoord te kiezen.
  memberAdd: adminProcedure
    .input(
      z.object({
        cohortId: z.string(),
        email: z.string().trim().email(),
        naam: z.string().trim().max(80).optional(),
        role: z
          .enum(["cursist", "docent", "manager", "facilitator", "alumnus"])
          .default("cursist"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cohort = await ctx.db.query.cohorts.findFirst({
        where: eq(cohorts.id, input.cohortId),
        columns: { id: true, name: true },
      });
      if (!cohort)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Editie niet gevonden",
        });
      const email = input.email.toLowerCase();
      const found = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.email})`, email),
        columns: { id: true, status: true },
      });
      if (found && found.status !== "active")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit account is geschorst of geblokkeerd.",
        });
      const invited = found
        ? null
        : await inviteNewUser(ctx, {
            email,
            naam: input.naam,
            role: input.role,
            cohort,
          });
      const userId = found?.id ?? invited!.id;
      await ctx.db
        .insert(cohortMembers)
        .values({ cohortId: input.cohortId, userId, role: input.role })
        .onConflictDoUpdate({
          target: [cohortMembers.cohortId, cohortMembers.userId],
          set: { role: input.role, status: "actief" },
        });
      await audit(ctx, "add_cohort_member", "cohort", input.cohortId, {
        userId,
        role: input.role,
        invited: !found,
      });
      return { success: true, invited: !found };
    }),

  // Meerdere bestaande gebruikers in één keer aan een editie koppelen (geplakte lijst).
  // Bestaande leden blijven ongemoeid; onbekende adressen komen terug om uit te nodigen.
  memberImport: adminProcedure
    .input(
      z.object({
        cohortId: z.string(),
        emails: z.string().max(20_000),
        // Maak onbekende adressen aan en nodig ze uit.
        invite: z.boolean().default(false),
        role: z
          .enum(["cursist", "docent", "manager", "facilitator", "alumnus"])
          .default("cursist"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { emails, truncated } = parseEmailList(input.emails);
      if (emails.length === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Geen e-mailadressen gevonden in de tekst.",
        });
      const found = await ctx.db.query.users.findMany({
        where: inArray(sql`lower(${users.email})`, emails),
        columns: { id: true, email: true },
      });
      const existing = await ctx.db.query.cohortMembers.findMany({
        where: eq(cohortMembers.cohortId, input.cohortId),
        columns: { userId: true },
      });
      const already = new Set(existing.map((m) => m.userId));
      const toAdd = found.filter((u) => !already.has(u.id));
      if (toAdd.length > 0)
        await ctx.db
          .insert(cohortMembers)
          .values(
            toAdd.map((u) => ({
              cohortId: input.cohortId,
              userId: u.id,
              role: input.role,
            })),
          )
          .onConflictDoNothing();
      const foundEmails = new Set(found.map((u) => u.email?.toLowerCase()));
      let notFound = emails.filter((e) => !foundEmails.has(e));
      let invitedCount = 0;
      if (input.invite && notFound.length > 0) {
        const cohort = await ctx.db.query.cohorts.findFirst({
          where: eq(cohorts.id, input.cohortId),
          columns: { id: true, name: true },
        });
        if (!cohort)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Editie niet gevonden",
          });
        const failed: string[] = [];
        for (const email of notFound) {
          try {
            const created = await inviteNewUser(ctx, {
              email,
              role: input.role,
              cohort,
            });
            await ctx.db
              .insert(cohortMembers)
              .values({
                cohortId: input.cohortId,
                userId: created.id,
                role: input.role,
              })
              .onConflictDoNothing();
            invitedCount++;
          } catch {
            failed.push(email);
          }
        }
        notFound = failed;
      }
      const result = {
        added: toAdd.length,
        invited: invitedCount,
        alreadyMember: found.length - toAdd.length,
        notFound,
        truncated,
      };
      await audit(ctx, "import_cohort_members", "cohort", input.cohortId, {
        role: input.role,
        ...result,
        notFound: result.notFound.length,
      });
      return result;
    }),

  memberUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z
          .enum(["cursist", "docent", "manager", "facilitator", "alumnus"])
          .optional(),
        status: z
          .enum(["actief", "gepauzeerd", "afgerond", "uitgeschreven"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db
        .update(cohortMembers)
        .set({
          ...data,
          ...(data.status === "afgerond" ? { completedAt: new Date() } : {}),
        })
        .where(eq(cohortMembers.id, id));
      await audit(ctx, "update_cohort_member", "cohort_member", id, data);
      return { success: true };
    }),

  memberRemove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(cohortMembers).where(eq(cohortMembers.id, input.id));
      await audit(ctx, "remove_cohort_member", "cohort_member", input.id);
      return { success: true };
    }),
});

async function uniqueSlug(
  db: typeof DbClient,
  base: string,
  excludeId?: string,
) {
  const root = base || "programma";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const hit = await db.query.programs.findFirst({
      where: eq(programs.slug, candidate),
      columns: { id: true },
    });
    if (!hit || hit.id === excludeId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Maakt een account zonder wachtwoord aan en mailt een activatielink (7 dagen geldig). */
async function inviteNewUser(
  ctx: { db: typeof DbClient },
  opts: {
    email: string;
    naam?: string | undefined;
    role: string;
    cohort: { id: string; name: string };
  },
) {
  const naam = opts.naam?.trim() || opts.email.split("@")[0]!;
  const [created] = await ctx.db
    .insert(users)
    .values({
      name: naam,
      naam,
      email: opts.email,
      referralCode: generateReferralCode(),
      // Zonder wachtwoord kan niemand inloggen. De link in de uitnodiging zet het
      // wachtwoord en markeert het adres dan als geverifieerd (password-reset/confirm).
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  if (!created)
    throw new TRPCError({
      code: "CONFLICT",
      message: "Dit e-mailadres is al in gebruik",
    });

  const token = await createResetToken(opts.email, 7 * 24 * 60 * 60 * 1000);
  const url = new URL(
    "/wachtwoord-reset/nieuw",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  );
  url.searchParams.set("email", opts.email);
  url.searchParams.set("token", token);
  await sendInviteEmail({
    to: opts.email,
    naam,
    rol: (COHORT_ROLE_LABELS[opts.role] ?? opts.role).toLowerCase(),
    editie: opts.cohort.name,
    url: url.toString(),
  });
  return created;
}

async function audit(
  ctx: { db: typeof DbClient; userId: string },
  action: string,
  targetType: string,
  targetId: string,
  details?: unknown,
) {
  await ctx.db.insert(auditLog).values({
    adminId: ctx.userId,
    action,
    targetType,
    targetId,
    details: details ? JSON.stringify(details) : null,
  });
}
