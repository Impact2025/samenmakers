import { NextResponse } from "next/server";
import { and, eq, gte, inArray, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  events,
  eventAttendees,
  eventIssuedTickets,
  users,
} from "@/server/db/schema";
import { verifyCalendarToken } from "@/server/events/calendar-token";
import { buildIcs } from "@/server/events/ics";
import { eventUrl } from "@/server/events/notify";
import { eventWhere } from "@/lib/event-format";
import { subDays } from "@/lib/date-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Persoonlijke agenda-feed (webcal://…/api/calendar/<token>): alle events waarvoor
// het lid een plek heeft, plus geannuleerde zodat ze uit de agenda verdwijnen.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const userId = verifyCalendarToken(token.replace(/\.ics$/, ""));
  if (!userId)
    return NextResponse.json({ error: "Ongeldige link" }, { status: 404 });

  const rows = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      description: events.description,
      location: events.location,
      format: events.format,
      startAt: events.startAt,
      endAt: events.endAt,
      updatedAt: events.updatedAt,
      status: events.status,
    })
    .from(eventAttendees)
    .innerJoin(events, eq(events.id, eventAttendees.eventId))
    .where(
      and(
        eq(eventAttendees.userId, userId),
        inArray(eventAttendees.status, ["registered", "checked_in", "offered"]),
        inArray(events.status, ["published", "cancelled"]),
        gte(events.startAt, subDays(new Date(), 30)),
      ),
    )
    .limit(500);

  // Plus events waarvoor het lid een ticket heeft (op account of e-mailadres).
  const me = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true },
  });
  const ticketRows = await db
    .selectDistinct({
      id: events.id,
      slug: events.slug,
      title: events.title,
      description: events.description,
      location: events.location,
      format: events.format,
      startAt: events.startAt,
      endAt: events.endAt,
      updatedAt: events.updatedAt,
      status: events.status,
    })
    .from(eventIssuedTickets)
    .innerJoin(events, eq(events.id, eventIssuedTickets.eventId))
    .where(
      and(
        eq(eventIssuedTickets.status, "valid"),
        me?.email
          ? or(
              eq(eventIssuedTickets.userId, userId),
              sql`lower(${eventIssuedTickets.holderEmail}) = ${me.email.toLowerCase()}`,
            )
          : eq(eventIssuedTickets.userId, userId),
        inArray(events.status, ["published", "cancelled"]),
        gte(events.startAt, subDays(new Date(), 30)),
      ),
    )
    .limit(500);
  const all = [
    ...new Map([...rows, ...ticketRows].map((r) => [r.id, r])).values(),
  ];

  const ics = buildIcs(
    all.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: eventWhere(e),
      url: eventUrl(e),
      startAt: e.startAt,
      endAt: e.endAt,
      updatedAt: e.updatedAt,
      cancelled: e.status === "cancelled",
    })),
    { calendarName: "We Shape the Future events" },
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=900",
    },
  });
}
