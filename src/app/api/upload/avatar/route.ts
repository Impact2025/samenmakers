import { put } from "@vercel/blob";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const check = await validateImage(file);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  // Type en extensie komen uit de bestandsinhoud, nooit uit wat de client opgeeft.
  const blob = await put(
    `avatars/${session.user.id}.${check.ext}`,
    file as File,
    {
      access: "public",
      contentType: check.contentType,
      addRandomSuffix: true,
    },
  );

  await db
    .update(users)
    .set({ avatarUrl: blob.url, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ url: blob.url });
}
