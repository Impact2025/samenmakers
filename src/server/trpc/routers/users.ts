import { z } from "zod";
import { eq, and, ne, notInArray, ilike, or, sql } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc/init";
import { users, matches, blockedUsers, bookmarks } from "@/server/db/schema";
import { SECTOREN, REGIO_S, FASEN } from "@/lib/constants";

export const usersRouter = createTRPCRouter({
  // Get own profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });
  }),

  // Get user by id (for app internal use)
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
    }),

  // Get user by username/naam (for public profile)
  byNaam: publicProcedure
    .input(z.object({ naam: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.naam, input.naam),
      });
    }),

  // Discover / search with filters + cursor pagination
  list: protectedProcedure
    .input(
      z.object({
        sector: z.string().optional(),
        regio: z.string().optional(),
        fase: z.enum(["starter", "groei", "scale"]).optional(),
        mentorshipRole: z
          .enum(["mentor", "mentee", "both", "none"])
          .optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(24),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { sector, regio, fase, mentorshipRole, search, cursor, limit } =
        input;

      // Get IDs to exclude: self + blocked
      const blocked = await ctx.db
        .select({ blockedId: blockedUsers.blockedId })
        .from(blockedUsers)
        .where(eq(blockedUsers.blockerId, ctx.userId));

      const excludeIds = [
        ctx.userId,
        ...blocked.map((b) => b.blockedId),
      ];

      const conditions = [
        notInArray(users.id, excludeIds),
        eq(users.status, "active"),
      ];

      if (sector) conditions.push(eq(users.sector, sector));
      if (regio) conditions.push(eq(users.regio, regio));
      if (fase) conditions.push(eq(users.fase, fase));
      if (mentorshipRole)
        conditions.push(eq(users.mentorshipRole, mentorshipRole));
      if (search) {
        conditions.push(
          or(
            ilike(users.naam, `%${search}%`),
            ilike(users.missie, `%${search}%`),
            ilike(users.bio, `%${search}%`),
          )!,
        );
      }
      if (cursor) conditions.push(ne(users.id, cursor));

      const rows = await ctx.db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(
          sql`${users.isFeatured} DESC, ${users.createdAt} DESC`,
        )
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor };
    }),

  // Update own profile
  update: protectedProcedure
    .input(
      z.object({
        naam: z.string().min(2).max(80).optional(),
        bio: z.string().max(500).optional(),
        missie: z.string().max(300).optional(),
        ikZoek: z.string().max(300).optional(),
        sector: z.enum(SECTOREN).optional(),
        regio: z.enum(REGIO_S).optional(),
        fase: z.enum(["starter", "groei", "scale"]).optional(),
        website: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        expertise: z.array(z.string().max(30)).max(8).optional(),
        mentorshipRole: z
          .enum(["mentor", "mentee", "both", "none"])
          .optional(),
        profileVisibility: z.enum(["public", "members"]).optional(),
        weeklyDigestEnabled: z.boolean().optional(),
        avatarUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const completeness = calculateCompleteness(input);
      await ctx.db
        .update(users)
        .set({ ...input, profileCompleteness: completeness, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),

  // Profile completeness score
  completeness: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });
    return user?.profileCompleteness ?? 0;
  }),

  // Mutual connections count
  mutualCount: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Users who are matched with BOTH ctx.userId and targetId
      const myMatches = await ctx.db
        .select({ otherId: matches.targetId })
        .from(matches)
        .where(
          and(
            eq(matches.userId, ctx.userId),
            eq(matches.status, "matched"),
          ),
        );

      if (myMatches.length === 0) return 0;

      const myMatchIds = myMatches.map((m) => m.otherId);

      const mutual = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(matches)
        .where(
          and(
            eq(matches.userId, input.targetId),
            eq(matches.status, "matched"),
            notInArray(matches.targetId, myMatchIds),
          ),
        );

      return Number(mutual[0]?.count ?? 0);
    }),
});

function calculateCompleteness(
  profile: Record<string, unknown>,
): number {
  const fields = [
    "naam",
    "bio",
    "missie",
    "ikZoek",
    "sector",
    "regio",
    "fase",
    "avatarUrl",
    "expertise",
    "linkedin",
  ];
  const filled = fields.filter((f) => {
    const v = profile[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && v !== "";
  });
  return Math.round((filled.length / fields.length) * 100);
}
