import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { getStripe } from "@/server/stripe";
import { db } from "@/server/db";
import { users, coupons } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { env } from "@/env";

export async function POST(req: Request) {
  const stripe = getStripe();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional coupon code from the subscription page.
  let couponCode: string | undefined;
  try {
    const body = (await req.json()) as { couponCode?: string };
    couponCode = body.couponCode?.trim().toUpperCase() || undefined;
  } catch {
    // no body — fine
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

  // Resolve a pre-applied promotion code, if a valid one was entered.
  let discount: { promotion_code: string } | undefined;
  if (couponCode) {
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.code, couponCode), eq(coupons.active, true)),
    });
    if (coupon?.stripePromotionCodeId) {
      discount = { promotion_code: coupon.stripePromotionCodeId };
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card", "ideal"],
    line_items: [{ price: env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    // A pre-applied discount and the native code field are mutually exclusive.
    ...(discount ? { discounts: [discount] } : { allow_promotion_codes: true }),
    metadata: { userId: user.id },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/instellingen/abonnement?success=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/instellingen/abonnement`,
    locale: "nl",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
