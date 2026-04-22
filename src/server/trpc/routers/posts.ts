import { z } from "zod";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, proProcedure, adminProcedure } from "@/server/trpc/init";
import { posts, postComments, postReactions, bookmarks } from "@/server/db/schema";
import { slugify } from "@/lib/utils";

export const postsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        category: z
          .enum(["blog", "kennisbank", "tool", "funding"])
          .optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(posts.isPublished, true)];
      if (input.category) conditions.push(eq(posts.category, input.category));
      if (input.search) conditions.push(ilike(posts.title, `%${input.search}%`));

      const rows = await ctx.db.query.posts.findMany({
        where: and(...conditions),
        orderBy: [desc(posts.publishedAt)],
        limit: input.limit + 1,
        with: { author: true },
      });

      const hasMore = rows.length > input.limit;
      return {
        items: hasMore ? rows.slice(0, input.limit) : rows,
        nextCursor: hasMore ? rows[input.limit - 1]?.id : undefined,
      };
    }),

  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.posts.findFirst({
        where: and(eq(posts.slug, input.slug), eq(posts.isPublished, true)),
        with: {
          author: true,
          comments: { with: { author: true }, orderBy: (c, { asc }) => [asc(c.createdAt)] },
          reactions: true,
        },
      });
    }),

  create: proProcedure
    .input(
      z.object({
        title: z.string().min(3).max(160),
        excerpt: z.string().max(300).optional(),
        content: z.string().min(50),
        coverImageUrl: z.string().url().optional(),
        category: z.enum(["blog", "kennisbank", "tool", "funding"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title) + "-" + Date.now();
      const [post] = await ctx.db
        .insert(posts)
        .values({
          ...input,
          slug,
          authorId: ctx.userId,
          isPublished: false,
        })
        .returning();
      return post;
    }),

  comment: protectedProcedure
    .input(z.object({ postId: z.string(), content: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .insert(postComments)
        .values({ ...input, authorId: ctx.userId })
        .returning();
      return comment;
    }),

  react: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.postReactions.findFirst({
        where: and(
          eq(postReactions.postId, input.postId),
          eq(postReactions.userId, ctx.userId),
        ),
      });

      if (existing) {
        await ctx.db
          .delete(postReactions)
          .where(eq(postReactions.id, existing.id));
        return { liked: false };
      }

      await ctx.db
        .insert(postReactions)
        .values({ postId: input.postId, userId: ctx.userId });
      return { liked: true };
    }),

  bookmark: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.bookmarks.findFirst({
        where: and(
          eq(bookmarks.postId, input.postId),
          eq(bookmarks.userId, ctx.userId),
        ),
      });

      if (existing) {
        await ctx.db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
        return { bookmarked: false };
      }

      await ctx.db.insert(bookmarks).values({
        postId: input.postId,
        userId: ctx.userId,
      });
      return { bookmarked: true };
    }),

  publish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({ isPublished: true, publishedAt: new Date() })
        .where(eq(posts.id, input.id));
      return { success: true };
    }),
});
