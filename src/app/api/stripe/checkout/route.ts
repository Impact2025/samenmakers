import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      ...(user.email ? { email: user.email } : {}),
      ...(user.naam ?? user.name ? { name: (user.naam ?? user.name)! } : {}),
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card", "ideal"],
    line_items: [
      {
        price: env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/instellingen/abonnement?success=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/instellingen/abonnement`,
    locale: "nl",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
