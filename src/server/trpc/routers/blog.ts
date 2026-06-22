import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/trpc/init";
import { posts, auditLog } from "@/server/db/schema";
import { slugify } from "@/lib/utils";
import { analyzeSeo } from "@/lib/seo/analyze";
import { generateBlogDraft } from "@/lib/ai/blog";

const categoryEnum = z.enum(["blog", "kennisbank", "tool", "funding"]);

const seoFields = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(20),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  category: categoryEnum,
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(200).optional(),
  focusKeyword: z.string().max(100).optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  aiGenerated: z.boolean().optional(),
});

function computeSeo(input: {
  title: string;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  excerpt?: string | undefined;
  content: string;
  focusKeyword?: string | undefined;
  slug?: string | undefined;
}) {
  const r = analyzeSeo(input);
  return { seoScore: r.score, readingTime: r.readingTime };
}

export const blogRouter = createTRPCRouter({
  // List every post (published + concept) for the admin overview.
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      orderBy: [desc(posts.updatedAt)],
      with: { author: { columns: { naam: true, name: true } } },
      limit: 100,
    });
  }),

  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  // AI draft generation via OpenRouter.
  generate: adminProcedure
    .input(
      z.object({
        topic: z.string().min(3),
        focusKeyword: z.string().min(2),
        category: categoryEnum.default("blog"),
        tone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingPosts = await ctx.db.query.posts.findMany({
        where: eq(posts.isPublished, true),
        columns: { title: true, slug: true },
        orderBy: [desc(posts.publishedAt)],
        limit: 30,
      });

      const draft = await generateBlogDraft({
        topic: input.topic,
        focusKeyword: input.focusKeyword,
        category: input.category,
        tone: input.tone,
        existingPosts,
      });

      if (!draft) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "AI niet beschikbaar. Stel OPENROUTER_API_KEY in om te genereren.",
        });
      }
      return draft;
    }),

  create: adminProcedure
    .input(seoFields)
    .mutation(async ({ ctx, input }) => {
      const slug =
        (input.slug && slugify(input.slug)) ||
        slugify(input.title) + "-" + Date.now().toString(36);
      const { seoScore, readingTime } = computeSeo({ ...input, slug });

      const [post] = await ctx.db
        .insert(posts)
        .values({
          authorId: ctx.userId,
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          coverImageUrl: input.coverImageUrl || null,
          category: input.category,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          focusKeyword: input.focusKeyword,
          keywords: input.keywords ?? [],
          canonicalUrl: input.canonicalUrl || null,
          ogImageUrl: input.ogImageUrl || input.coverImageUrl || null,
          seoScore,
          readingTime,
          aiGenerated: input.aiGenerated ?? false,
          isPublished: false,
        })
        .returning();

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "create_post",
        targetType: "post",
        targetId: post!.id,
      });
      return post;
    }),

  update: adminProcedure
    .input(seoFields.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const slug = data.slug ? slugify(data.slug) : undefined;
      const { seoScore, readingTime } = computeSeo({ ...data, slug });

      await ctx.db
        .update(posts)
        .set({
          title: data.title,
          ...(slug ? { slug } : {}),
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl || null,
          category: data.category,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          focusKeyword: data.focusKeyword,
          keywords: data.keywords ?? [],
          canonicalUrl: data.canonicalUrl || null,
          ogImageUrl: data.ogImageUrl || data.coverImageUrl || null,
          seoScore,
          readingTime,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id));

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "update_post",
        targetType: "post",
        targetId: id,
      });
      return { success: true };
    }),

  setPublished: adminProcedure
    .input(z.object({ id: z.string(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id));

      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: input.isPublished ? "publish_post" : "unpublish_post",
        targetType: "post",
        targetId: input.id,
      });
      return { success: true };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "delete_post",
        targetType: "post",
        targetId: input.id,
      });
      return { success: true };
    }),
});
