import { put } from "@vercel/blob";
import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { cohortMembers } from "@/server/db/schema";
import { withinAccessWindow } from "@/lib/session-cycle";
import { validateDocument } from "@/lib/upload";

export const runtime = "nodejs";

// Huiswerk (cursisten) en lesmateriaal (docenten, facilitators) voor één editie.
// De editie bepaalt wie mag uploaden; het bestand zelf wordt op inhoud gecontroleerd.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const cohortId = form?.get("cohortId");
  if (typeof cohortId !== "string" || !cohortId) {
    return NextResponse.json({ error: "Editie ontbreekt" }, { status: 400 });
  }

  const isAdmin = session.user.role === "admin";
  const membership = await db.query.cohortMembers.findFirst({
    where: and(
      eq(cohortMembers.cohortId, cohortId),
      eq(cohortMembers.userId, session.user.id),
      ne(cohortMembers.status, "uitgeschreven"),
    ),
  });
  const allowed =
    membership &&
    membership.role !== "alumnus" &&
    withinAccessWindow(
      { from: membership.accessFrom, until: membership.accessUntil },
      new Date(),
    );
  if (!allowed && !isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const file = form?.get("file");
  const check = await validateDocument(file);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const blob = await put(
    `onderwijs/${cohortId}/${session.user.id}.${check.ext}`,
    file as File,
    {
      access: "public",
      contentType: check.contentType,
      addRandomSuffix: true,
    },
  );

  return NextResponse.json({
    url: blob.url,
    name: (file as File).name,
    size: (file as File).size,
    mimeType: check.contentType,
  });
}
