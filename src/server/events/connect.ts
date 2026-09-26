// Stripe Connect (Express) voor organisatoren: onboarding, status en dashboardlink.
// Betalingen lopen als destination charge via het platform; het Connect-account
// heeft daarvoor alleen de capability `transfers` nodig.
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import type { Database } from "@/server/db";
import { users } from "@/server/db/schema";
import { getStripe } from "@/server/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export function isAccountReady(a: Stripe.Account): boolean {
  return !!a.details_submitted && a.capabilities?.transfers === "active";
}

export async function ensureConnectAccount(
  db: Database,
  userId: string,
): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, stripeConnectAccountId: true },
  });
  if (!user) throw new Error("Gebruiker niet gevonden");
  if (user.stripeConnectAccountId) return user.stripeConnectAccountId;

  const account = await getStripe().accounts.create(
    {
      type: "express",
      country: "NL",
      ...(user.email ? { email: user.email } : {}),
      capabilities: { transfers: { requested: true } },
      metadata: { userId },
    },
    { idempotencyKey: `connect-account-${userId}` },
  );
  await db
    .update(users)
    .set({ stripeConnectAccountId: account.id })
    .where(eq(users.id, userId));
  return account.id;
}

export async function onboardingLink(accountId: string): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${APP_URL}/events/uitbetalingen?opnieuw=1`,
    return_url: `${APP_URL}/events/uitbetalingen?terug=1`,
  });
  return link.url;
}

/** Status ophalen bij Stripe en opslaan (ook aangeroepen door de account.updated-webhook). */
export async function syncConnectStatus(
  db: Database,
  account: Stripe.Account | string,
) {
  const a =
    typeof account === "string"
      ? await getStripe().accounts.retrieve(account)
      : account;
  const ready = isAccountReady(a);
  await db
    .update(users)
    .set({ stripeConnectReady: ready })
    .where(eq(users.stripeConnectAccountId, a.id));
  return {
    ready,
    detailsSubmitted: !!a.details_submitted,
    requirements: a.requirements?.currently_due ?? [],
  };
}

export async function dashboardLink(accountId: string): Promise<string> {
  const link = await getStripe().accounts.createLoginLink(accountId);
  return link.url;
}
