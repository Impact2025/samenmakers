import { z } from "zod";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, proProcedure } from "@/server/trpc/init";
import { events, eventAttendees } from "@/server/db/schema";
import { slugify } from "@/lib/utils";
import { createNotification } from "@/lib/notify";

export const eventsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        upcoming: z.boolean().default(true),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(events.isPublished, true)];
      if (input.upcoming) conditions.push(gte(events.startAt, new Date()));

      const rows = await ctx.db.query.events.findMany({
        where: and(...conditions),
        orderBy: input.upcoming
          ? [asc(events.startAt)]
          : [desc(events.startAt)],
        limit: input.limit + 1,
        with: { organiser: true, attendees: true },
      });

      const hasMore = rows.length > input.limit;
      return {
        items: hasMore ? rows.slice(0, input.limit) : rows,
        nextCursor: hasMore
          ? rows[input.limit - 1]?.id
          : undefined,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.events.findFirst({
        where: eq(events.id, input.id),
        with: {
          organiser: true,
          attendees: { with: { user: true } },
        },
      });
    }),

  create: proProcedure
    .input(
      z.object({
        title: z.string().min(3).max(120),
        description: z.string().max(2000).optional(),
        location: z.string().max(200).optional(),
        isOnline: z.boolean().default(false),
        meetingUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
        startAt: z.string().datetime(),
        endAt: z.string().datetime().optional(),
        maxAttendees: z.number().int().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title) + "-" + Date.now();
      const [event] = await ctx.db
        .insert(events)
        .values({
          ...input,
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : undefined,
          slug,
          organiserId: ctx.userId,
          isPublished: false,
        })
        .returning();
      return event;
    }),

  rsvp: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
        with: { attendees: true },
      });

      if (!event) throw new Error("Event niet gevonden");

      const isFull =
        event.maxAttendees !== null &&
        event.attendees.filter((a) => a.status === "registered").length >=
          event.maxAttendees;

      await ctx.db.insert(eventAttendees).values({
        eventId: input.eventId,
        userId: ctx.userId,
        status: isFull ? "waitlisted" : "registered",
      }).onConflictDoNothing();

      return { status: isFull ? "waitlisted" : "registered" };
    }),

  cancelRsvp: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const eventRecord = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      await ctx.db
        .delete(eventAttendees)
        .where(
          and(
            eq(eventAttendees.eventId, input.eventId),
            eq(eventAttendees.userId, ctx.userId),
          ),
        );

      // Promote first waitlisted attendee if a spot opened
      const [next] = await ctx.db
        .select()
        .from(eventAttendees)
        .where(
          and(
            eq(eventAttendees.eventId, input.eventId),
            eq(eventAttendees.status, "waitlisted"),
          ),
        )
        .orderBy(asc(eventAttendees.createdAt))
        .limit(1);

      if (next) {
        await ctx.db
          .update(eventAttendees)
          .set({ status: "registered" })
          .where(eq(eventAttendees.id, next.id));

        void createNotification(ctx.db, {
          userId: next.userId,
          type: "event_reminder",
          title: "Plek vrijgekomen!",
          body: `Je staat nu ingeschreven voor ${eventRecord?.title ?? "het event"}.`,
          url: `/events/${input.eventId}`,
        });
      }

      return { success: true };
    }),
});
