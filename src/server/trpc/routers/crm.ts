import { z } from "zod";
import { count, desc, eq, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import {
  users,
  crmActivities,
  matches,
  posts,
  eventAttendees,
} from "@/server/db/schema";
import { segmentSchema, buildSegmentConditions } from "@/server/admin/segment";

export const crmRouter = createTRPCRouter({
  // Filtered contact list.
  contacts: adminProcedure
    .input(segmentSchema.extend({ limit: z.number().min(1).max(200).default(50) }))
    .query(async ({ ctx, input }) => {
      const where = buildSegmentConditions(input);
      const rows = await ctx.db
        .select({
          id: users.id,
          naam: users.naam,
          name: users.name,
          email: users.email,
          sector: users.sector,
          regio: users.regio,
          fase: users.fase,
          subscriptionStatus: users.subscriptionStatus,
          crmStage: users.crmStage,
          crmTags: users.crmTags,
          createdAt: users.createdAt,
          crmLastContactedAt: users.crmLastContactedAt,
        })
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(input.limit);
      return rows;
    }),

  contact: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const [activities, matchCount, postCount, eventCount] = await Promise.all([
        ctx.db.query.crmActivities.findMany({
          where: eq(crmActivities.contactId, input.id),
          orderBy: [desc(crmActivities.createdAt)],
          limit: 50,
          with: { admin: { columns: { naam: true, name: true } } },
        }),
        ctx.db
          .select({ c: count() })
          .from(matches)
          .where(or(eq(matches.userId, input.id), eq(matches.targetId, input.id))),
        ctx.db.select({ c: count() }).from(posts).where(eq(posts.authorId, input.id)),
        ctx.db
          .select({ c: count() })
          .from(eventAttendees)
          .where(eq(eventAttendees.userId, input.id)),
      ]);

      return {
        user,
        activities,
        stats: {
          matches: Number(matchCount[0]?.c ?? 0),
          posts: Number(postCount[0]?.c ?? 0),
          events: Number(eventCount[0]?.c ?? 0),
        },
      };
    }),

  addNote: adminProcedure
    .input(z.object({ contactId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(crmActivities).values({
        contactId: input.contactId,
        adminId: ctx.userId,
        type: "note",
        content: input.content,
      });
      await ctx.db
        .update(users)
        .set({ crmLastContactedAt: new Date() })
        .where(eq(users.id, input.contactId));
      return { success: true };
    }),

  setStage: adminProcedure
    .input(
      z.object({
        contactId: z.string(),
        stage: z.enum(["lead", "engaged", "customer", "churned"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ crmStage: input.stage, updatedAt: new Date() })
        .where(eq(users.id, input.contactId));
      await ctx.db.insert(crmActivities).values({
        contactId: input.contactId,
        adminId: ctx.userId,
        type: "stage_change",
        content: `Fase gewijzigd naar "${input.stage}".`,
      });
      return { success: true };
    }),

  addTag: adminProcedure
    .input(z.object({ contactId: z.string(), tag: z.string().min(1).max(40) }))
    .mutation(async ({ ctx, input }) => {
      const tag = input.tag.trim();
      // Append only if not already present.
      await ctx.db
        .update(users)
        .set({
          crmTags: sql`(
            select array_agg(distinct t) from unnest(array_append(${users.crmTags}, ${tag})) as t
          )`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.contactId));
      await ctx.db.insert(crmActivities).values({
        contactId: input.contactId,
        adminId: ctx.userId,
        type: "tag",
        content: `Tag toegevoegd: "${tag}".`,
      });
      return { success: true };
    }),

  removeTag: adminProcedure
    .input(z.object({ contactId: z.string(), tag: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          crmTags: sql`array_remove(${users.crmTags}, ${input.tag})`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.contactId));
      return { success: true };
    }),

  // Distinct tags across all contacts (for filter dropdown).
  tags: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ tag: sql<string>`distinct unnest(${users.crmTags})` })
      .from(users);
    return rows.map((r) => r.tag).filter(Boolean).sort();
  }),
});
