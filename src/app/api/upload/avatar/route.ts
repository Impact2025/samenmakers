import { put } from "@vercel/blob";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Geen bestand meegegeven" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `avatars/${session.user.id}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  await db
    .update(users)
    .set({ avatarUrl: blob.url, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ url: blob.url });
}
