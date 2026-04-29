import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled";

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
