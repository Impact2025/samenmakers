import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { bookmarks, connectionNotes, profileViews } from "@/server/db/schema";
import { createNotification } from "@/lib/notify";

export const connectionsRouter = createTRPCRouter({
  // Bookmark a profile
  bookmark: protectedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.bookmarks.findFirst({
        where: and(
          eq(bookmarks.userId, ctx.userId),
          eq(bookmarks.targetUserId, input.targetUserId),
        ),
      });

      if (existing) {
        await ctx.db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
        return { bookmarked: false };
      }

      await ctx.db.insert(bookmarks).values({
        userId: ctx.userId,
        targetUserId: input.targetUserId,
      });
      return { bookmarked: true };
    }),

  // List saved profiles
  myBookmarks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.bookmarks.findMany({
      where: and(
        eq(bookmarks.userId, ctx.userId),
        // Only profile bookmarks (not post bookmarks)
        isNull(bookmarks.postId),
      ),
      with: { user: true },
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });
  }),

  // Save/update private note on a connection
  saveNote: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
        content: z.string().max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(connectionNotes)
        .values({
          userId: ctx.userId,
          targetUserId: input.targetUserId,
          content: input.content,
        })
        .onConflictDoUpdate({
          target: [connectionNotes.userId, connectionNotes.targetUserId],
          set: { content: input.content, updatedAt: new Date() },
        });
      return { success: true };
    }),

  // Get note for a specific connection
  getNote: protectedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.connectionNotes.findFirst({
        where: and(
          eq(connectionNotes.userId, ctx.userId),
          eq(connectionNotes.targetUserId, input.targetUserId),
        ),
      });
    }),

  // Record a profile view + notify owner (Pro only)
  recordView: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.profileId === ctx.userId) return;

      await ctx.db
        .insert(profileViews)
        .values({ viewerId: ctx.userId, profileId: input.profileId })
        .onConflictDoUpdate({
          target: [profileViews.viewerId, profileViews.profileId],
          set: { createdAt: new Date() },
        });

      // Notify profile owner (only visible if they are Pro)
      void createNotification(ctx.db, {
        userId: input.profileId,
        type: "profile_view",
        title: "Iemand bekeek je profiel",
        body: "Upgrade naar Pro om te zien wie jouw profiel bezocht.",
        url: "/instellingen",
      });
    }),

  // Who viewed my profile (Pro feature)
  myProfileViews: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.profileViews.findMany({
      where: eq(profileViews.profileId, ctx.userId),
      with: { viewer: true },
      orderBy: (pv, { desc }) => [desc(pv.createdAt)],
      limit: 50,
    });
  }),
});
