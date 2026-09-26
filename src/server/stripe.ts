import "server-only";
import Stripe from "stripe";
import { env } from "@/env";

let _stripe: Stripe | null = null;

/** Lazily-initialised singleton Stripe client (avoids build-time init). */
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return _stripe;
}
