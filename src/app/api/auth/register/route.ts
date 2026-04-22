import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users, referrals } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  }

  const { name, email, password, referralCode } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json({ error: "Dit e-mailadres is al in gebruik" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  let referrerId: string | undefined;
  if (referralCode) {
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referralCode),
    });
    if (referrer) referrerId = referrer.id;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashed,
      naam: name,
      referralCode: newReferralCode,
      referredById: referrerId,
      // Auto-verify: email was provided directly, no magic-link flow for credentials
      emailVerified: new Date(),
    })
    .returning({ id: users.id });

  if (referrerId && newUser) {
    await db.insert(referrals).values({
      referrerId,
      referredId: newUser.id,
    });
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ email, naam: name }).catch(console.error);

  return NextResponse.json({ success: true }, { status: 201 });
}
