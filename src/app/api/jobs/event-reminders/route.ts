import { db } from "@/server/db";
import { events, eventAttendees, users, notifications } from "@/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

// Called by Vercel Cron: every day at 09:00
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Events starting in ~24 hours
  const upcomingEvents = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(and(gte(events.startAt, tomorrow), lte(events.startAt, dayAfter)));

  let notificationCount = 0;

  for (const event of upcomingEvents) {
    const attendees = await db
      .select({ userId: eventAttendees.userId })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, event.id));

    for (const { userId } of attendees) {
      await db.insert(notifications).values({
        userId,
        type: "event_reminder",
        title: "Herinnering: event morgen",
        body: `"${event.title}" begint morgen. Vergeet het niet!`,
        url: `/events/${event.id}`,
      });
      notificationCount++;
    }
  }

  console.log(`[event-reminders] ${upcomingEvents.length} events, ${notificationCount} notifications sent`);

  return NextResponse.json({ ok: true, events: upcomingEvents.length, notifications: notificationCount });
}
