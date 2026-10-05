import { z } from "zod";
import { publicUserColumns } from "@/server/db/user-columns";
import {
  eq,
  desc,
  asc,
  gte,
  count,
  sql,
  and,
  or,
  ilike,
  isNotNull,
  ne,
} from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import {
  users,
  matches,
  messages,
  posts,
  events,
  auditLog,
  reportedContent,
  cohorts,
  cohortMembers,
  platformSettings,
  memberships,
  loginEvents,
  feedPosts,
  submissions,
  jobRuns,
} from "@/server/db/schema";
import { subDays } from "@/lib/date-utils";
import { isValidPrice, isActiveMember } from "@/lib/membership";
import { loadPrices, PRICE_KEYS } from "@/server/settings";
import { TRPCError } from "@trpc/server";
import { checkUserChange } from "@/lib/admin-guards";
import { JOBS, evaluateJobHealth } from "@/lib/job-health";
import { createResetToken } from "@/server/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export const adminRouter = createTRPCRouter({
  // Platform analytics
  analytics: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const [
      totalUsers,
      newUsersThisMonth,
      totalMatches,
      mutualMatches,
      totalMessages,
      activeUsersThisWeek,
      totalPosts,
      totalEvents,
      proUsers,
      totalCohorts,
      totalCohortMembers,
    ] = await Promise.all([
      ctx.db.select({ count: count() }).from(users),
      ctx.db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo)),
      ctx.db.select({ count: count() }).from(matches),
      ctx.db
        .select({ count: count() })
        .from(matches)
        .where(eq(matches.status, "matched")),
      ctx.db.select({ count: count() }).from(messages),
      ctx.db
        .select({ count: sql<number>`count(distinct ${messages.senderId})` })
        .from(messages)
        .where(gte(messages.createdAt, sevenDaysAgo)),
      ctx.db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.isPublished, true)),
      ctx.db
        .select({ count: count() })
        .from(events)
        .where(eq(events.isPublished, true)),
      ctx.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.subscriptionStatus, "active")),
      ctx.db.select({ count: count() }).from(cohorts),
      ctx.db.select({ count: count() }).from(cohortMembers),
    ]);

    const totalMatchCount = Number(totalMatches[0]?.count ?? 0);
    const mutualMatchCount = Number(mutualMatches[0]?.count ?? 0);

    return {
      totalUsers: Number(totalUsers[0]?.count ?? 0),
      newUsersThisMonth: Number(newUsersThisMonth[0]?.count ?? 0),
      matchRate:
        totalMatchCount > 0
          ? Math.round((mutualMatchCount / totalMatchCount) * 100)
          : 0,
      totalMessages: Number(totalMessages[0]?.count ?? 0),
      activeUsersThisWeek: Number(activeUsersThisWeek[0]?.count ?? 0),
      totalPosts: Number(totalPosts[0]?.count ?? 0),
      totalEvents: Number(totalEvents[0]?.count ?? 0),
      proUsers: Number(proUsers[0]?.count ?? 0),
      mrr: Number(proUsers[0]?.count ?? 0) * 9,
      totalCohorts: Number(totalCohorts[0]?.count ?? 0),
      totalCohortMembers: Number(totalCohortMembers[0]?.count ?? 0),
    };
  }),

  // Ledenbeheer: aantallen per groep, logins en activiteit (7 en 30 dagen).
  membership: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const d7 = subDays(now, 7);
    const d30 = subDays(now, 30);
    const n = (rows: { count: number | string }[]) =>
      Number(rows[0]?.count ?? 0);

    const loginCounts = (since: Date) =>
      ctx.db
        .select({
          total: count(),
          unique: sql<number>`count(distinct ${loginEvents.userId})`,
        })
        .from(loginEvents)
        .where(gte(loginEvents.createdAt, since));

    const [accounts, roleRows, logins7, logins30, feed7, subs7, msgs7] =
      await Promise.all([
        ctx.db
          .select({ count: count() })
          .from(users)
          .where(eq(users.status, "active")),
        ctx.db
          .select({
            role: cohortMembers.role,
            count: sql<number>`count(distinct ${cohortMembers.userId})`,
          })
          .from(cohortMembers)
          .where(sql`${cohortMembers.status} <> 'uitgeschreven'`)
          .groupBy(cohortMembers.role),
        loginCounts(d7),
        loginCounts(d30),
        ctx.db
          .select({ count: count() })
          .from(feedPosts)
          .where(gte(feedPosts.createdAt, d7)),
        ctx.db
          .select({ count: count() })
          .from(submissions)
          .where(gte(submissions.submittedAt, d7)),
        ctx.db
          .select({ count: count() })
          .from(messages)
          .where(gte(messages.createdAt, d7)),
      ]);

    const byRole = Object.fromEntries(
      roleRows.map((r) => [r.role, Number(r.count)]),
    ) as Record<string, number>;

    return {
      accounts: n(accounts),
      cursisten: byRole.cursist ?? 0,
      docenten: byRole.docent ?? 0,
      facilitators: byRole.facilitator ?? 0,
      managers: byRole.manager ?? 0,
      alumni: byRole.alumnus ?? 0,
      logins7: {
        total: Number(logins7[0]?.total ?? 0),
        unique: Number(logins7[0]?.unique ?? 0),
      },
      logins30: {
        total: Number(logins30[0]?.total ?? 0),
        unique: Number(logins30[0]?.unique ?? 0),
      },
      feedPosts7: n(feed7),
      submissions7: n(subs7),
      messages7: n(msgs7),
    };
  }),

  // Prijzen die de admin bepaalt: jaarlidmaatschap en standaardprijs per event.
  prices: adminProcedure.query(async ({ ctx }) => {
    const [prices, rows] = await Promise.all([
      loadPrices(ctx.db),
      ctx.db.select().from(memberships),
    ]);
    const now = new Date();
    return {
      ...prices,
      activeMembers: rows.filter((m) => isActiveMember(m, now)).length,
    };
  }),

  setPrices: adminProcedure
    .input(
      z.object({
        membershipCents: z.number().int(),
        eventCents: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !isValidPrice(input.membershipCents) ||
        !isValidPrice(input.eventCents)
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vul een bedrag in tussen €0,50 en €10.000",
        });
      const rows = [
        { key: PRICE_KEYS.membership, valueCents: input.membershipCents },
        { key: PRICE_KEYS.event, valueCents: input.eventCents },
      ];
      for (const r of rows) {
        await ctx.db
          .insert(platformSettings)
          .values({ ...r, updatedBy: ctx.userId })
          .onConflictDoUpdate({
            target: platformSettings.key,
            set: {
              valueCents: r.valueCents,
              updatedBy: ctx.userId,
              updatedAt: new Date(),
            },
          });
      }
      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "set_prices",
        targetType: "settings",
        details: JSON.stringify(input),
      });
      return { ok: true };
    }),

  // User management
  users: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
        q: z.string().trim().max(100).optional(),
        status: z
          .enum(["active", "suspended", "banned", "pending_deletion"])
          .optional(),
        role: z.enum(["user", "admin"]).optional(),
        subscriptionStatus: z
          .enum(["none", "active", "past_due", "canceled"])
          .optional(),
        sector: z.string().max(100).optional(),
        sort: z.enum(["nieuwst", "oudst", "naam", "email"]).default("nieuwst"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(users.status, input.status));
      if (input.role) conditions.push(eq(users.role, input.role));
      if (input.subscriptionStatus)
        conditions.push(eq(users.subscriptionStatus, input.subscriptionStatus));
      if (input.sector) conditions.push(eq(users.sector, input.sector));

      // Elk woord moet in minstens één veld voorkomen (naam, e-mail, sector, regio, expertise).
      for (const word of (input.q ?? "").split(/\s+/).filter(Boolean)) {
        const pattern = `%${word.replace(/[\\%_]/g, "\\$&")}%`;
        conditions.push(
          or(
            ilike(users.naam, pattern),
            ilike(users.name, pattern),
            ilike(users.email, pattern),
            ilike(users.sector, pattern),
            ilike(users.regio, pattern),
            sql`array_to_string(${users.expertise}, ' ') ilike ${pattern}`,
          ),
        );
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const orderBy = {
        nieuwst: [desc(users.createdAt)],
        oudst: [asc(users.createdAt)],
        naam: [asc(sql`lower(coalesce(${users.naam}, ${users.name}))`)],
        email: [asc(users.email)],
      }[input.sort];

      const [items, [totaal], sectorRows] = await Promise.all([
        ctx.db.query.users.findMany({
          where,
          orderBy,
          limit: input.limit,
          offset: input.offset,
        }),
        ctx.db.select({ n: count() }).from(users).where(where),
        ctx.db
          .selectDistinct({ sector: users.sector })
          .from(users)
          .where(isNotNull(users.sector))
          .orderBy(asc(users.sector)),
      ]);

      return {
        items,
        total: totaal?.n ?? 0,
        sectors: sectorRows.map((r) => r.sector!).filter(Boolean),
      };
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isFeatured: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        status: z
          .enum(["active", "suspended", "banned", "pending_deletion"])
          .optional(),
        role: z.enum(["user", "admin"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const target = await ctx.db.query.users.findFirst({
        where: eq(users.id, id),
        columns: { role: true },
      });
      if (!target)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gebruiker niet gevonden",
        });
      const [others] = await ctx.db
        .select({ n: count() })
        .from(users)
        .where(
          and(
            eq(users.role, "admin"),
            eq(users.status, "active"),
            ne(users.id, id),
          ),
        );
      const blocked = checkUserChange({
        actorId: ctx.userId,
        targetId: id,
        targetRole: target.role,
        change: { status: data.status, role: data.role },
        otherActiveAdmins: others?.n ?? 0,
      });
      if (blocked)
        throw new TRPCError({ code: "BAD_REQUEST", message: blocked });

      await ctx.db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id));

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "update_user",
        targetType: "user",
        targetId: id,
        details: JSON.stringify(data),
      });

      return { success: true };
    }),

  // Content moderation
  pendingContent: adminProcedure.query(async ({ ctx }) => {
    const [unpublishedPosts, unpublishedEvents, pendingReports] =
      await Promise.all([
        ctx.db.query.posts.findMany({
          where: eq(posts.isPublished, false),
          with: { author: { columns: publicUserColumns } },
          limit: 20,
        }),
        ctx.db.query.events.findMany({
          where: eq(events.isPublished, false),
          with: { organiser: { columns: publicUserColumns } },
          limit: 20,
        }),
        ctx.db.query.reportedContent.findMany({
          where: eq(reportedContent.status, "pending"),
          limit: 20,
        }),
      ]);
    return { unpublishedPosts, unpublishedEvents, pendingReports };
  }),

  publishPost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({ isPublished: true, publishedAt: new Date() })
        .where(eq(posts.id, input.id));
      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "publish_post",
        targetType: "post",
        targetId: input.id,
      });
      return { success: true };
    }),

  publishEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(events)
        .set({ isPublished: true })
        .where(eq(events.id, input.id));
      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "publish_event",
        targetType: "event",
        targetId: input.id,
      });
      return { success: true };
    }),

  resolveReport: adminProcedure
    .input(
      z.object({ id: z.string(), status: z.enum(["resolved", "dismissed"]) }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reportedContent)
        .set({
          status: input.status,
          resolvedBy: ctx.userId,
          resolvedAt: new Date(),
        })
        .where(eq(reportedContent.id, input.id));
      return { success: true };
    }),

  // Cohort management
  createCohort: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      const [cohort] = await ctx.db
        .insert(cohorts)
        .values({ ...input, inviteCode, createdBy: ctx.userId })
        .returning();
      return cohort;
    }),

  // Ondersteuning: stuur de gebruiker een resetlink (zelfde veilige flow als "wachtwoord vergeten").
  sendPasswordReset: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: { email: true, naam: true, name: true, status: true },
      });
      if (!user?.email)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gebruiker niet gevonden",
        });
      if (user.status === "suspended" || user.status === "banned")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit account is geschorst of geblokkeerd.",
        });
      const token = await createResetToken(user.email);
      const url = new URL(
        "/wachtwoord-reset/nieuw",
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      );
      url.searchParams.set("email", user.email.toLowerCase());
      url.searchParams.set("token", token);
      await sendPasswordResetEmail({
        to: user.email,
        naam: user.naam ?? user.name,
        url: url.toString(),
      });
      return { success: true };
    }),

  // Ondersteuning: e-mailadres handmatig als bevestigd markeren (bijv. bij een bounce).
  markEmailVerified: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ emailVerified: new Date(), updatedAt: new Date() })
        .where(eq(users.id, input.id));
      return { success: true };
    }),

  // Systeemstatus: geplande taken, recente fouten en wat er nu aandacht vraagt.
  systemStatus: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const since = subDays(now, 9);
    const runs = await ctx.db
      .select({
        job: jobRuns.job,
        status: jobRuns.status,
        startedAt: jobRuns.startedAt,
        durationMs: jobRuns.durationMs,
        error: jobRuns.error,
      })
      .from(jobRuns)
      .where(gte(jobRuns.startedAt, since))
      .orderBy(desc(jobRuns.startedAt));

    const problems = evaluateJobHealth(runs, now);
    const jobs = JOBS.map((j) => {
      const last = runs.find((r) => r.job === j.name) ?? null;
      return {
        name: j.name,
        maxAgeHours: j.maxAgeHours,
        last,
        problem: problems.find((p) => p.job === j.name) ?? null,
      };
    });
    const failures = runs.filter((r) => r.status === "error").slice(0, 10);

    const [pendingReports, pendingDeletion, pastDue] = await Promise.all([
      ctx.db
        .select({ n: count() })
        .from(reportedContent)
        .where(eq(reportedContent.status, "pending")),
      ctx.db
        .select({ n: count() })
        .from(users)
        .where(eq(users.status, "pending_deletion")),
      ctx.db
        .select({ n: count() })
        .from(memberships)
        .where(eq(memberships.status, "past_due")),
    ]);

    return {
      generatedAt: now,
      jobs,
      problems,
      failures,
      queue: {
        pendingReports: pendingReports[0]?.n ?? 0,
        pendingDeletion: pendingDeletion[0]?.n ?? 0,
        pastDueMemberships: pastDue[0]?.n ?? 0,
      },
    };
  }),

  // Audit log
  auditLog: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx }) => {
      return ctx.db.query.auditLog.findMany({
        orderBy: [desc(auditLog.createdAt)],
        limit: 50,
        with: {
          admin: { columns: { id: true, name: true, naam: true, email: true } },
        },
      });
    }),
});
