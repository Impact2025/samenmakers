import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({ confirm: z.literal("VERWIJDER") });

/**
 * Markeert het account voor verwijdering (30 dagen bedenktijd; daarna anonimiseert
 * de gdpr-cleanup-job). Opnieuw inloggen binnen die termijn annuleert de aanvraag.
 * Alleen POST vanaf onze eigen origin, zodat een link of <img> op een andere site
 * dit niet kan triggeren.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.headers.get("origin");
  if (
    origin &&
    origin !== new URL(req.url).origin &&
    origin !== process.env.NEXT_PUBLIC_APP_URL
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Typ "VERWIJDER" om te bevestigen' },
      { status: 400 },
    );
  }

  await db
    .update(users)
    .set({ status: "pending_deletion", updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
