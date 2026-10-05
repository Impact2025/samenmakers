import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users, cohortMembers, auditLog } from "@/server/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import superjson from "superjson";
import { withinAccessWindow } from "@/lib/session-cycle";
import { z, ZodError } from "zod";
export async function createTRPCContext(opts: { req: Request }) {
  const session = await auth();
  return { db, session, req: opts.req };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Public — no auth required
export const publicProcedure = t.procedure;

// Protected — must be signed in
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Pro — must have active subscription (or be admin)
const isPro = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.session.user.isPro && ctx.session.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Pro abonnement vereist",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});

export const proProcedure = t.procedure.use(isPro);

// Pro of onderwijsstaf — docenten, facilitators en managers van een editie hoeven geen
// Pro-abonnement te hebben om de community te helpen met antwoorden en artikelen.
const isProOrStaff = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const { isPro: pro, role } = ctx.session.user;
  if (!pro && role !== "admin") {
    const seat = await ctx.db.query.cohortMembers.findFirst({
      where: and(
        eq(cohortMembers.userId, ctx.session.user.id),
        inArray(cohortMembers.role, ["docent", "facilitator", "manager"]),
        ne(cohortMembers.status, "uitgeschreven"),
      ),
      columns: { id: true },
    });
    if (!seat) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Pro abonnement vereist",
      });
    }
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});

export const proOrStaffProcedure = t.procedure.use(isProOrStaff);

// Admin — must have role "admin"
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});

// Elke beheerhandeling (mutation) komt in de audit log, ook als de procedure zelf niets
// vastlegt. Procedures die al met meer detail loggen staan hieronder en worden overgeslagen.
const MANUALLY_AUDITED = new Set([
  "admin.setPrices",
  "admin.updateUser",
  "admin.publishPost",
  "admin.publishEvent",
  "blog.create",
  "blog.update",
  "blog.setPublished",
  "blog.remove",
  "campaigns.send",
  "coupons.create",
  "coupons.remove",
  "programs.create",
  "programs.update",
  "programs.delete",
  "programs.moduleDelete",
  "programs.lessonDelete",
  "programs.cohortCreate",
  "programs.cohortUpdate",
  "programs.cohortDuplicate",
  "programs.memberAdd",
  "programs.memberImport",
  "programs.memberUpdate",
  "programs.memberRemove",
]);

const auditMutations = t.middleware(
  async ({ ctx, path, type, getRawInput, next }) => {
    const result = await next();
    if (type !== "mutation" || !result.ok || MANUALLY_AUDITED.has(path))
      return result;
    try {
      const raw = (await getRawInput()) as Record<string, unknown> | undefined;
      const targetId =
        typeof raw?.id === "string"
          ? raw.id
          : typeof raw?.cohortId === "string"
            ? raw.cohortId
            : null;
      await db.insert(auditLog).values({
        adminId: ctx.session!.user.id,
        action: path,
        targetType: path.split(".")[0] ?? null,
        targetId,
        // Lange velden (mailinhoud, artikeltekst) afkappen: de log is een spoor, geen archief.
        details: JSON.stringify(raw ?? {}, (_k, v) =>
          typeof v === "string" && v.length > 200 ? `${v.slice(0, 200)}…` : v,
        ).slice(0, 2000),
      });
    } catch (e) {
      console.error("[audit] vastleggen mislukt", path, e);
    }
    return result;
  },
);

export const adminProcedure = t.procedure.use(isAdmin).use(auditMutations);

// Helper: get current user's DB row (cached per request via React cache)
export async function getCurrentUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

// Cohort role — must be a (non-unsubscribed) member of the edition with one of
// the given roles. Platform admins always pass. Roles live on the membership,
// so a docent in one edition can be a cursist in another.
type CohortRole = (typeof cohortMembers.$inferSelect)["role"];

export function cohortRoleProcedure(roles: readonly CohortRole[]) {
  return protectedProcedure
    .input(z.object({ cohortId: z.string().min(1) }))
    .use(async ({ ctx, input, next }) => {
      const membership = await ctx.db.query.cohortMembers.findFirst({
        where: and(
          eq(cohortMembers.cohortId, input.cohortId),
          eq(cohortMembers.userId, ctx.userId),
        ),
      });
      const isAdmin = ctx.session.user.role === "admin";
      const allowed =
        membership &&
        membership.status !== "uitgeschreven" &&
        roles.includes(membership.role);
      // Tijdelijke toegang (docenten): buiten het venster geen toegang.
      const inWindow =
        !membership ||
        withinAccessWindow(
          { from: membership.accessFrom, until: membership.accessUntil },
          new Date(),
        );
      if (allowed && !inWindow && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Je toegang tot deze editie is (nog) niet actief",
        });
      }
      if (!allowed && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Je hebt geen toegang tot deze editie",
        });
      }
      return next({ ctx: { ...ctx, membership: membership ?? null, isAdmin } });
    });
}
