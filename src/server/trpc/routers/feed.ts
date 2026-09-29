import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { cohorts, feedPosts, users } from "@/server/db/schema";
import { publicUserColumns } from "@/server/db/user-columns";
import { canModerateFeed, canUseFeed } from "@/lib/access";
import { loadPerson } from "@/server/learning/access";
import { createNotification } from "@/lib/notify";
import type { db as DbClient } from "@/server/db";

// cohortId leeg = de alumni-feed.
const scope = z.object({ cohortId: z.string().min(1).optional() });

async function requireFeedAccess(
  db: typeof DbClient,
  userId: string,
  cohortId: string | null,
) {
  const person = await loadPerson(db, userId);
  if (!person || !canUseFeed(person, cohortId))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Je hebt geen toegang tot deze feed",
    });
  return person;
}

export const feedRouter = createTRPCRouter({
  list: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    const cohortId = input.cohortId ?? null;
    const person = await requireFeedAccess(ctx.db, ctx.userId, cohortId);
    const rows = await ctx.db.query.feedPosts.findMany({
      where: cohortId
        ? eq(feedPosts.cohortId, cohortId)
        : isNull(feedPosts.cohortId),
      orderBy: [desc(feedPosts.createdAt)],
      limit: 50,
      with: { author: { columns: publicUserColumns } },
    });
    const moderator = canModerateFeed(person, cohortId);
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      author: {
        id: r.author.id,
        naam: r.author.naam ?? r.author.name ?? "Lid",
        avatarUrl: r.author.avatarUrl,
      },
      canDelete: moderator || r.authorId === ctx.userId,
    }));
  }),

  create: protectedProcedure
    .input(
      scope.extend({
        kind: z.enum(["hulpvraag", "aanbod"]),
        title: z.string().trim().min(3).max(150),
        body: z.string().trim().min(3).max(3000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cohortId = input.cohortId ?? null;
      await requireFeedAccess(ctx.db, ctx.userId, cohortId);
      const [post] = await ctx.db
        .insert(feedPosts)
        .values({
          cohortId,
          authorId: ctx.userId,
          kind: input.kind,
          title: input.title,
          body: input.body,
        })
        .returning({ id: feedPosts.id });

      // Geen voormoderatie, wel een melding aan de beheerders.
      const [admins, cohort, author] = await Promise.all([
        ctx.db.query.users.findMany({
          where: and(eq(users.role, "admin"), eq(users.status, "active")),
          columns: { id: true },
        }),
        cohortId
          ? ctx.db.query.cohorts.findFirst({
              where: eq(cohorts.id, cohortId),
              columns: { name: true },
            })
          : Promise.resolve(null),
        ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.userId),
          columns: { naam: true, name: true },
        }),
      ]);
      const where = cohort ? `klas ${cohort.name}` : "de alumni-feed";
      await Promise.all(
        admins
          .filter((a) => a.id !== ctx.userId)
          .map((a) =>
            createNotification(ctx.db, {
              userId: a.id,
              type: "system",
              title: `Nieuwe post in ${where}`,
              body: `${author?.naam ?? author?.name ?? "Een lid"}: ${input.title}`,
              url: cohortId ? `/leren/${cohortId}/klas` : "/alumni",
            }),
          ),
      );
      return post!;
    }),

  remove: protectedProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.feedPosts.findFirst({
        where: eq(feedPosts.id, input.postId),
      });
      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Niet gevonden" });
      const person = await requireFeedAccess(ctx.db, ctx.userId, post.cohortId);
      if (
        post.authorId !== ctx.userId &&
        !canModerateFeed(person, post.cohortId)
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Je kunt alleen je eigen berichten verwijderen",
        });
      await ctx.db.delete(feedPosts).where(eq(feedPosts.id, post.id));
      return { ok: true };
    }),
});
