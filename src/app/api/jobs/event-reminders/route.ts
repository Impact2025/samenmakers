import { db } from "@/server/db";
import {
  events,
  eventAttendees,
  eventIssuedTickets,
  eventOrders,
  users,
} from "@/server/db/schema";
import { eq, and, gt, lte, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { dueReminder } from "@/server/events/status";
import { fillOpenSpots } from "@/server/events/booking";
import { notifyFillResult, sendReminder } from "@/server/events/notify";

// Vercel Cron: elk uur (vercel.json).
// 1. Wachtlijst 2.0: verlopen aanbiedingen vervallen, vrije plekken worden aangeboden.
// 2. Herinneringen 1 week, 1 dag en 1 uur vooraf — idempotent via reminders_sent.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const HOUR = 60 * 60 * 1000;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // ── 1. Wachtlijst ──────────────────────────────────────────────────────────
  const waitlistEvents = await db
    .selectDistinct({ event: events })
    .from(events)
    .innerJoin(eventAttendees, eq(eventAttendees.eventId, events.id))
    .where(
      and(
        eq(events.status, "published"),
        gt(events.startAt, now),
        inArray(eventAttendees.status, ["waitlisted", "offered"]),
      ),
    );

  let offered = 0;
  let expired = 0;
  for (const { event } of waitlistEvents) {
    const result = await fillOpenSpots(db, event, now);
    offered += result.offered.length + result.promoted.length;
    expired += result.expired.length;
    await notifyFillResult(db, event, result);
  }

  // ── 2. Herinneringen ──────────────────────────────────────────────────────
  const upcoming = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        gt(events.startAt, now),
        lte(events.startAt, new Date(now.getTime() + 7 * 24 * HOUR)),
      ),
    );

  let reminders = 0;
  for (const event of upcoming) {
    const attendees = await db
      .select({
        id: eventAttendees.id,
        userId: eventAttendees.userId,
        remindersSent: eventAttendees.remindersSent,
        email: users.email,
        naam: users.naam,
        name: users.name,
      })
      .from(eventAttendees)
      .innerJoin(users, eq(users.id, eventAttendees.userId))
      .where(
        and(
          eq(eventAttendees.eventId, event.id),
          inArray(eventAttendees.status, ["registered", "checked_in"]),
        ),
      );

    for (const a of attendees) {
      const key = dueReminder(now, event.startAt, a.remindersSent);
      if (!key) continue;
      // Eerst claimen, dan versturen: overlappende runs sturen nooit dubbel.
      const claimed = await db
        .update(eventAttendees)
        .set({
          remindersSent: sql`array_append(${eventAttendees.remindersSent}, ${key})`,
        })
        .where(
          and(
            eq(eventAttendees.id, a.id),
            sql`NOT (${key} = ANY(${eventAttendees.remindersSent}))`,
          ),
        )
        .returning({ id: eventAttendees.id });
      if (claimed.length === 0) continue;
      await sendReminder(db, event, a.userId, key, {
        email: a.email,
        naam: a.naam ?? a.name ?? "Maker",
      });
      reminders++;
    }

    // Tickethouders (ook gasten), per ticket geclaimd.
    const tickets = await db
      .select({
        id: eventIssuedTickets.id,
        userId: eventIssuedTickets.userId,
        email: eventIssuedTickets.holderEmail,
        naam: eventIssuedTickets.holderName,
        remindersSent: eventIssuedTickets.remindersSent,
      })
      .from(eventIssuedTickets)
      .where(
        and(
          eq(eventIssuedTickets.eventId, event.id),
          eq(eventIssuedTickets.status, "valid"),
        ),
      );
    const mailed = new Set<string>();
    for (const t of tickets) {
      const key = dueReminder(now, event.startAt, t.remindersSent);
      if (!key) continue;
      const claimed = await db
        .update(eventIssuedTickets)
        .set({
          remindersSent: sql`array_append(${eventIssuedTickets.remindersSent}, ${key})`,
        })
        .where(
          and(
            eq(eventIssuedTickets.id, t.id),
            sql`NOT (${key} = ANY(${eventIssuedTickets.remindersSent}))`,
          ),
        )
        .returning({ id: eventIssuedTickets.id });
      // Meerdere tickets op één adres: één mail.
      const dedupe = `${t.email.toLowerCase()}:${key}`;
      if (claimed.length === 0 || mailed.has(dedupe)) continue;
      mailed.add(dedupe);
      await sendReminder(db, event, t.userId, key, {
        email: t.email,
        naam: t.naam.split(" ")[0] ?? t.naam,
      });
      reminders++;
    }
  }

  // Verlopen reserveringen opruimen (ze tellen al niet meer mee; dit houdt de data schoon).
  await db
    .update(eventOrders)
    .set({ status: "expired", updatedAt: now })
    .where(
      and(eq(eventOrders.status, "pending"), lte(eventOrders.expiresAt, now)),
    );

  console.log(
    `[event-reminders] wachtlijst: ${waitlistEvents.length} events, ${offered} aangeboden, ${expired} verlopen; ${reminders} herinneringen`,
  );
  return NextResponse.json({ ok: true, offered, expired, reminders });
}
