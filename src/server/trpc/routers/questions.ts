import { z } from "zod";
import { eq, and, desc, ilike } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, proProcedure } from "@/server/trpc/init";
import { questions, questionAnswers } from "@/server/db/schema";

export const questionsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        sector: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.sector) conditions.push(eq(questions.sector, input.sector));
      if (input.search) conditions.push(ilike(questions.title, `%${input.search}%`));

      const rows = await ctx.db.query.questions.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(questions.createdAt)],
        limit: input.limit + 1,
        with: {
          author: true,
          answers: { with: { author: true } },
        },
      });

      const hasMore = rows.length > input.limit;
      return {
        items: hasMore ? rows.slice(0, input.limit) : rows,
        nextCursor: hasMore ? rows[input.limit - 1]?.id : undefined,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.questions.findFirst({
        where: eq(questions.id, input.id),
        with: {
          author: true,
          answers: {
            with: { author: true },
            orderBy: (a, { desc, asc }) => [desc(a.isAccepted), asc(a.createdAt)],
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        content: z.string().max(2000).optional(),
        sector: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [question] = await ctx.db
        .insert(questions)
        .values({ ...input, authorId: ctx.userId })
        .returning();
      return question;
    }),

  answer: proProcedure
    .input(
      z.object({
        questionId: z.string(),
        content: z.string().min(10).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [answer] = await ctx.db
        .insert(questionAnswers)
        .values({ ...input, authorId: ctx.userId })
        .returning();
      return answer;
    }),

  acceptAnswer: protectedProcedure
    .input(z.object({ answerId: z.string(), questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.query.questions.findFirst({
        where: and(
          eq(questions.id, input.questionId),
          eq(questions.authorId, ctx.userId),
        ),
      });
      if (!question) throw new Error("Geen toegang");

      await ctx.db
        .update(questionAnswers)
        .set({ isAccepted: false })
        .where(eq(questionAnswers.questionId, input.questionId));

      await ctx.db
        .update(questionAnswers)
        .set({ isAccepted: true })
        .where(eq(questionAnswers.id, input.answerId));

      await ctx.db
        .update(questions)
        .set({ isResolved: true })
        .where(eq(questions.id, input.questionId));

      return { success: true };
    }),
});
