import { z } from "zod";
import { eq, and, notInArray, inArray, ilike, or, sql } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc/init";
import { users, matches, blockedUsers } from "@/server/db/schema";
import { SECTOREN, REGIO_S } from "@/lib/constants";
import {
  publicUserColumns,
  publicUserSelect,
  selfUserColumns,
} from "@/server/db/user-columns";

export const usersRouter = createTRPCRouter({
  // Get own profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
      columns: selfUserColumns,
    });
  }),

  // Get user by id (for app internal use) — alleen publieke velden, geen geblokkeerde/inactieve leden
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const blocked = await ctx.db.query.blockedUsers.findFirst({
        where: and(
          eq(blockedUsers.blockerId, input.id),
          eq(blockedUsers.blockedId, ctx.userId),
        ),
      });
      if (blocked) return undefined;
      return ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.id), eq(users.status, "active")),
        columns: publicUserColumns,
      });
    }),

  // Get user by username/naam (for public profile). Bezoekers zonder account zien
  // alleen profielen die op "public" staan.
  byNaam: publicProcedure
    .input(z.object({ naam: z.string().min(1).max(120) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(eq(users.naam, input.naam), eq(users.status, "active")),
        columns: publicUserColumns,
      });
      if (!user) return undefined;
      if (!ctx.session?.user?.id && user.profileVisibility !== "public")
        return undefined;
      return user;
    }),

  // Discover / search with filters + cursor pagination
  list: protectedProcedure
    .input(
      z.object({
        sector: z.string().optional(),
        regio: z.string().optional(),
        fase: z.enum(["starter", "groei", "scale"]).optional(),
        mentorshipRole: z.enum(["mentor", "mentee", "both", "none"]).optional(),
        search: z.string().max(100).optional(),
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

      const excludeIds = [ctx.userId, ...blocked.map((b) => b.blockedId)];

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
      // Cursor = offset (de sortering op isFeatured+createdAt is niet uniek genoeg voor keyset).
      const offset = cursor ? Math.max(0, Number.parseInt(cursor, 10) || 0) : 0;

      const rows = await ctx.db
        .select(publicUserSelect)
        .from(users)
        .where(and(...conditions))
        .orderBy(
          sql`${users.isFeatured} DESC, ${users.createdAt} DESC, ${users.id}`,
        )
        .limit(limit + 1)
        .offset(offset);

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore ? String(offset + limit) : undefined;

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
        zoektNaar: z.array(z.string().max(30)).max(8).optional(),
        sector: z.enum(SECTOREN).optional(),
        regio: z.enum(REGIO_S).optional(),
        fase: z.enum(["starter", "groei", "scale"]).optional(),
        website: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        expertise: z.array(z.string().max(30)).max(8).optional(),
        mentorshipRole: z.enum(["mentor", "mentee", "both", "none"]).optional(),
        profileVisibility: z.enum(["public", "members"]).optional(),
        weeklyDigestEnabled: z.boolean().optional(),
        avatarUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const completeness = calculateCompleteness(input);
      await ctx.db
        .update(users)
        .set({
          ...input,
          profileCompleteness: completeness,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),

  // Profile completeness score
  completeness: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
      columns: { profileCompleteness: true },
    });
    return user?.profileCompleteness ?? 0;
  }),

  // Mutual connections count (people matched with BOTH me and target)
  mutualCount: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Collect all my match partner IDs (both as initiator and receiver)
      const [asUser, asTarget] = await Promise.all([
        ctx.db
          .select({ id: matches.targetId })
          .from(matches)
          .where(
            and(eq(matches.userId, ctx.userId), eq(matches.status, "matched")),
          ),
        ctx.db
          .select({ id: matches.userId })
          .from(matches)
          .where(
            and(
              eq(matches.targetId, ctx.userId),
              eq(matches.status, "matched"),
            ),
          ),
      ]);
      const myPartnerIds = [
        ...asUser.map((r) => r.id),
        ...asTarget.map((r) => r.id),
      ];
      if (myPartnerIds.length === 0) return 0;

      // Count target's match partners that overlap with mine
      const [targetAsUser, targetAsTarget] = await Promise.all([
        ctx.db
          .select({ id: matches.targetId })
          .from(matches)
          .where(
            and(
              eq(matches.userId, input.targetId),
              eq(matches.status, "matched"),
              inArray(matches.targetId, myPartnerIds),
            ),
          ),
        ctx.db
          .select({ id: matches.userId })
          .from(matches)
          .where(
            and(
              eq(matches.targetId, input.targetId),
              eq(matches.status, "matched"),
              inArray(matches.userId, myPartnerIds),
            ),
          ),
      ]);
      const mutualIds = new Set([
        ...targetAsUser.map((r) => r.id),
        ...targetAsTarget.map((r) => r.id),
      ]);
      mutualIds.delete(ctx.userId);
      mutualIds.delete(input.targetId);
      return mutualIds.size;
    }),
});

function calculateCompleteness(profile: Record<string, unknown>): number {
  const weightedFields = [
    { field: "naam", weight: 15 },
    { field: "avatarUrl", weight: 15 },
    { field: "missie", weight: 15 },
    { field: "zoektNaar", weight: 12 },
    { field: "expertise", weight: 10 },
    { field: "bio", weight: 10 },
    { field: "sector", weight: 8 },
    { field: "ikZoek", weight: 7 },
    { field: "regio", weight: 5 },
    { field: "fase", weight: 3 },
  ];
  let score = 0;
  for (const { field, weight } of weightedFields) {
    const v = profile[field];
    const filled = Array.isArray(v)
      ? v.length > 0
      : v !== undefined && v !== null && v !== "";
    if (filled) score += weight;
  }
  return Math.min(score, 100);
}
