import { put } from "@vercel/blob";
import { auth } from "@/server/auth/config";
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
    `events/${session.user.id}.${check.ext}`,
    file as File,
    {
      access: "public",
      contentType: check.contentType,
      addRandomSuffix: true,
    },
  );

  return NextResponse.json({ url: blob.url });
}
