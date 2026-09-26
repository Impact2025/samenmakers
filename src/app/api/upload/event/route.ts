import { put } from "@vercel/blob";
import { auth } from "@/server/auth/config";
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
    return NextResponse.json(
      { error: "Geen bestand meegegeven" },
      { status: 400 },
    );
  }

  // Alleen afbeeldingen: een publieke blob met willekeurig type (bijv. HTML) is een XSS-risico.
  const EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Alleen JPG, PNG of WebP" },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximaal 5 MB" }, { status: 400 });
  }
  const filename = `events/${session.user.id}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
