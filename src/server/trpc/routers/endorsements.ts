import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { endorsements } from "@/server/db/schema";

export const endorsementsRouter = createTRPCRouter({
  forUser: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [counts, mine] = await Promise.all([
        ctx.db
          .select({ skill: endorsements.skill, count: count() })
          .from(endorsements)
          .where(eq(endorsements.targetId, input.targetId))
          .groupBy(endorsements.skill),
        ctx.db
          .select({ skill: endorsements.skill })
          .from(endorsements)
          .where(and(eq(endorsements.endorserId, ctx.userId), eq(endorsements.targetId, input.targetId))),
      ]);

      const endorsed = new Set(mine.map((e) => e.skill));
      return counts.map((r) => ({
        skill: r.skill,
        count: Number(r.count),
        endorsedByMe: endorsed.has(r.skill),
      }));
    }),

  toggle: protectedProcedure
    .input(z.object({ targetId: z.string(), skill: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Je kunt jezelf niet endorsen" });
      }

      const existing = await ctx.db.query.endorsements.findFirst({
        where: and(
          eq(endorsements.endorserId, ctx.userId),
          eq(endorsements.targetId, input.targetId),
          eq(endorsements.skill, input.skill),
        ),
      });

      if (existing) {
        await ctx.db.delete(endorsements).where(eq(endorsements.id, existing.id));
        return { endorsed: false };
      }

      await ctx.db.insert(endorsements).values({
        endorserId: ctx.userId,
        targetId: input.targetId,
        skill: input.skill,
      });
      return { endorsed: true };
    }),
});
