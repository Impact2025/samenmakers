import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { users, coupons, couponRedemptions } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@/env";
import {
  handleCheckoutCompleted,
  handleChargeRefunded,
  expireOrder,
} from "@/server/events/orders";
import { syncConnectStatus } from "@/server/events/connect";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  // Connect-events (account.updated) komen via een apart Connect-endpoint met eigen secret.
  let event: Stripe.Event | null = null;
  for (const secret of [
    env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
  ]) {
    if (!secret) continue;
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret);
      break;
    } catch {
      // volgende secret proberen
    }
  }
  if (!event)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  // Tickets (events fase 2). Fouten → 500, zodat Stripe het opnieuw probeert; alles is idempotent.
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.kind === "event_order")
          await handleCheckoutCompleted(db, s);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.kind === "event_order" && s.metadata.orderId)
          await expireOrder(db, s.metadata.orderId);
        break;
      }
      case "charge.refunded":
        await handleChargeRefunded(db, event.data.object as Stripe.Charge);
        break;
      case "account.updated":
        await syncConnectStatus(db, event.data.object as Stripe.Account);
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] ${event.type} mislukt:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId;
      const applied = s.discounts?.[0];
      const promoId =
        typeof applied?.promotion_code === "string"
          ? applied.promotion_code
          : null;
      const couponStripeId =
        typeof applied?.coupon === "string" ? applied.coupon : null;

      if (userId && (promoId ?? couponStripeId)) {
        const ours = await db.query.coupons.findFirst({
          where: promoId
            ? eq(coupons.stripePromotionCodeId, promoId)
            : eq(coupons.stripeCouponId, couponStripeId!),
        });
        if (ours) {
          await db.insert(couponRedemptions).values({
            couponId: ours.id,
            userId,
            stripeSessionId: s.id,
            amountDiscounted: s.total_details?.amount_discount ?? null,
          });
          await db
            .update(coupons)
            .set({ timesRedeemed: sql`${coupons.timesRedeemed} + 1` })
            .where(eq(coupons.id, ours.id));
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : "canceled";

      await db
        .update(users)
        .set({
          subscriptionStatus: status,
          subscriptionId: sub.id,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await db
        .update(users)
        .set({
          subscriptionStatus: "canceled",
          subscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await db
        .update(users)
        .set({ subscriptionStatus: "past_due", updatedAt: new Date() })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
