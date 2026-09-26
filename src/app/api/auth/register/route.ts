import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users, referrals } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";
import { checkAuthLimit, clientIp } from "@/lib/ratelimit";
import { generateReferralCode } from "@/server/auth/config";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
  referralCode: z.string().trim().max(32).optional(),
});

export async function POST(req: Request) {
  if (!(await checkAuthLimit("register", `ip:${clientIp(req)}`))) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een uur opnieuw." },
      { status: 429 },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  }

  const { name, email, password, referralCode } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${email}`,
    columns: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Dit e-mailadres is al in gebruik" },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  let referrerId: string | undefined;
  if (referralCode) {
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referralCode.toUpperCase()),
      columns: { id: true },
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
      referralCode: generateReferralCode(),
      referredById: referrerId,
      // Auto-verify: email was provided directly, no magic-link flow for credentials
      emailVerified: new Date(),
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  // Race: tegelijk dezelfde aanmelding → de tweede krijgt netjes een 409.
  if (!newUser) {
    return NextResponse.json(
      { error: "Dit e-mailadres is al in gebruik" },
      { status: 409 },
    );
  }

  if (referrerId) {
    await db.insert(referrals).values({
      referrerId,
      referredId: newUser.id,
    });
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ email, naam: name }).catch(console.error);

  return NextResponse.json({ success: true }, { status: 201 });
}
