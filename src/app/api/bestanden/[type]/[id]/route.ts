import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  cohortMaterials,
  cohortMembers,
  submissionFiles,
} from "@/server/db/schema";
import { loadPerson } from "@/server/learning/access";
import {
  canDownloadMaterial,
  canDownloadSubmissionFile,
} from "@/lib/file-access";
import { contentDisposition, isPrivateBlobUrl } from "@/lib/upload";

export const runtime = "nodejs";

// Beveiligde download van huiswerk en lesmateriaal. De bestanden staan niet publiek: elk
// verzoek controleert de sessie en de rol, en het bestand wordt door onze server doorgegeven.
// Een doorgestuurde link werkt daardoor alleen voor wie zelf ingelogd en bevoegd is.

const NOT_FOUND = () =>
  NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

// Afbeeldingen en pdf's mogen in de browser openen; Office-bestanden worden gedownload.
const INLINE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function seatIn(cohortId: string, userId: string) {
  const row = await db.query.cohortMembers.findFirst({
    where: and(
      eq(cohortMembers.cohortId, cohortId),
      eq(cohortMembers.userId, userId),
    ),
  });
  return row ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";
  const { type, id } = await params;
  const now = new Date();

  let file: { url: string; name: string; mimeType: string | null } | null =
    null;

  if (type === "inlevering") {
    const row = await db.query.submissionFiles.findFirst({
      where: eq(submissionFiles.id, id),
      with: {
        submission: {
          columns: { userId: true },
          with: { assignment: { columns: { cohortId: true } } },
        },
      },
    });
    if (!row) return NOT_FOUND();
    const seat = await seatIn(row.submission.assignment.cohortId, userId);
    const allowed = canDownloadSubmissionFile({
      isAdmin,
      userId,
      ownerId: row.submission.userId,
      seat,
      now,
    });
    // Zelfde antwoord als "bestaat niet": niemand hoort te kunnen raden welke bestanden er zijn.
    if (!allowed) return NOT_FOUND();
    file = { url: row.url, name: row.name, mimeType: row.mimeType };
  } else if (type === "materiaal") {
    const row = await db.query.cohortMaterials.findFirst({
      where: eq(cohortMaterials.id, id),
    });
    if (!row) return NOT_FOUND();
    const person = await loadPerson(db, userId);
    if (!person) return NOT_FOUND();
    const seat = await seatIn(row.cohortId, userId);
    if (!canDownloadMaterial({ person, seat, now })) return NOT_FOUND();
    file = { url: row.url, name: row.fileName, mimeType: row.mimeType };
  } else {
    return NOT_FOUND();
  }

  let stream: ReadableStream<Uint8Array> | null = null;
  if (isPrivateBlobUrl(file.url)) {
    const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
    const result = await get(file.url, {
      access: "private",
      useCache: false,
      ...(token ? { token } : {}),
    }).catch(() => null);
    if (result && result.statusCode === 200) stream = result.stream;
  } else {
    // Oudere bestanden uit de tijd van publieke opslag: via dezelfde controle doorgegeven.
    const res = await fetch(file.url).catch(() => null);
    if (res?.ok && res.body) stream = res.body;
  }
  if (!stream) return NOT_FOUND();

  const contentType = file.mimeType ?? "application/octet-stream";
  return new Response(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition(
        file.name,
        INLINE_TYPES.has(contentType),
      ),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Referrer-Policy": "no-referrer",
    },
  });
}
