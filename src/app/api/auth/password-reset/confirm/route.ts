import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { consumeResetToken } from "@/server/auth/password-reset";
import { checkAuthLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  token: z.string().min(20).max(200),
  password: z.string().min(8, "Minimaal 8 tekens").max(200),
});

export async function POST(req: Request) {
  if (!(await checkAuthLimit("reset", `confirm:${clientIp(req)}`))) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige gegevens" },
      { status: 400 },
    );
  }
  const { email, token, password } = parsed.data;

  if (!(await consumeResetToken(email, token))) {
    return NextResponse.json(
      { error: "Deze link is verlopen of al gebruikt. Vraag een nieuwe aan." },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  // De link bewijst bezit van het e-mailadres, dus markeren we het ook als geverifieerd.
  await db
    .update(users)
    .set({
      password: hashed,
      emailVerified: sql`coalesce(${users.emailVerified}, now())`,
      updatedAt: new Date(),
    })
    .where(sql`lower(${users.email}) = ${email}`);

  return NextResponse.json({ success: true });
}
