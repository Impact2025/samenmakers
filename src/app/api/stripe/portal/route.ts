import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

export async function POST() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Geen abonnement gevonden" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/instellingen/abonnement`,
  });

  return NextResponse.json({ url: portalSession.url });
}
