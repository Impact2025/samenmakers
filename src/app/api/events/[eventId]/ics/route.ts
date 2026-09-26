import { NextResponse } from "next/server";
import { and, eq, or, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { auth } from "@/server/auth/config";
import { eventIcs } from "@/server/events/notify";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const e = await db.query.events.findFirst({
    where: and(
      or(eq(events.id, eventId), eq(events.slug, eventId)),
      inArray(events.status, ["published", "cancelled"]),
    ),
  });
  if (!e) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (e.visibility === "members") {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Inloggen vereist" }, { status: 401 });
  }

  const filename = `${e.slug.slice(0, 60)}.ics`;
  return new NextResponse(eventIcs(e), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
