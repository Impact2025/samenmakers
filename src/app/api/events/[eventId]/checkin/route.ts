import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  events,
  eventAttendees,
  eventCheckIns,
  users,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({ userId: z.string() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Must be event organiser or admin
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    return NextResponse.json({ error: "Event niet gevonden" }, { status: 404 });
  }

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  const isOrganiser = event.organiserId === session.user.id;
  const isAdmin = me?.role === "admin";

  if (!isOrganiser && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { userId } = parsed.data;

  // Verify the user is registered
  const attendee = await db.query.eventAttendees.findFirst({
    where: and(
      eq(eventAttendees.eventId, eventId),
      eq(eventAttendees.userId, userId),
    ),
  });

  // Alleen wie een bevestigde plek heeft; wachtlijst en open aanbiedingen niet.
  if (
    !attendee ||
    (attendee.status !== "registered" && attendee.status !== "checked_in")
  ) {
    return NextResponse.json(
      { error: "Gebruiker heeft geen bevestigde plek" },
      { status: 400 },
    );
  }
  if (event.status !== "published") {
    return NextResponse.json(
      { error: "Event is niet actief" },
      { status: 400 },
    );
  }

  // Mark checked in
  await db
    .insert(eventCheckIns)
    .values({
      eventId,
      userId,
      checkedInBy: session.user.id,
    })
    .onConflictDoNothing();

  await db
    .update(eventAttendees)
    .set({ status: "checked_in" })
    .where(
      and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, userId),
      ),
    );

  return NextResponse.json({ success: true });
}
