import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users, cohortMembers } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
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

export const adminProcedure = t.procedure.use(isAdmin);

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
      if (!allowed && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Je hebt geen toegang tot deze editie",
        });
      }
      return next({ ctx: { ...ctx, membership: membership ?? null, isAdmin } });
    });
}
