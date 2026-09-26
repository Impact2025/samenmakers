import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createResetToken } from "@/server/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkAuthLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
});

// Antwoordt altijd hetzelfde, zodat niet te achterhalen is welke adressen een account hebben.
const OK = () => NextResponse.json({ success: true });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Vul een geldig e-mailadres in" },
      { status: 400 },
    );
  }
  const { email } = parsed.data;

  const [byIp, byEmail] = await Promise.all([
    checkAuthLimit("reset", `ip:${clientIp(req)}`),
    checkAuthLimit("reset", email),
  ]);
  if (!byIp) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het later opnieuw." },
      { status: 429 },
    );
  }
  if (!byEmail) return OK();

  const user = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${email}`,
    columns: { email: true, naam: true, name: true, status: true },
  });
  if (!user?.email || user.status === "suspended" || user.status === "banned")
    return OK();

  try {
    const token = await createResetToken(email);
    const url = new URL(
      "/wachtwoord-reset/nieuw",
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    );
    url.searchParams.set("email", email);
    url.searchParams.set("token", token);
    await sendPasswordResetEmail({
      to: user.email,
      naam: user.naam ?? user.name,
      url: url.toString(),
    });
  } catch (e) {
    console.error("[password-reset] versturen mislukt:", e);
  }
  return OK();
}
