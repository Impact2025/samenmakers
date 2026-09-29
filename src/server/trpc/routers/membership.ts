import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/init";
import { memberships, users } from "@/server/db/schema";
import { getStripe } from "@/server/stripe";
import { loadPerson } from "@/server/learning/access";
import { loadPrices } from "@/server/settings";
import { canBuyMembership, isActiveMember } from "@/lib/membership";
import { env } from "@/env";

export const membershipRouter = createTRPCRouter({
  // Mijn lidmaatschap, of ik het kan afsluiten (alumni) en wat het kost.
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [person, prices, row] = await Promise.all([
      loadPerson(ctx.db, ctx.userId),
      loadPrices(ctx.db),
      ctx.db.query.memberships.findFirst({
        where: eq(memberships.userId, ctx.userId),
      }),
    ]);
    const now = new Date();
    return {
      priceCents: prices.membershipCents,
      eventPriceCents: prices.eventCents,
      canBuy: !!person && canBuyMembership(person),
      isMember: isActiveMember(row, now),
      membership: row
        ? {
            status: row.status,
            currentPeriodEnd: row.currentPeriodEnd,
            priceCents: row.priceCents,
          }
        : null,
    };
  }),

  // Stripe Checkout voor het jaarlidmaatschap. De prijs komt uit de admin-instellingen.
  checkout: protectedProcedure
    .input(z.object({ acceptTerms: z.literal(true) }))
    .mutation(async ({ ctx }) => {
      const [person, prices, existing, user] = await Promise.all([
        loadPerson(ctx.db, ctx.userId),
        loadPrices(ctx.db),
        ctx.db.query.memberships.findFirst({
          where: eq(memberships.userId, ctx.userId),
        }),
        ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) }),
      ]);
      if (!person || !user) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!canBuyMembership(person))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Het lidmaatschap is er voor alumni",
        });
      if (isActiveMember(existing, new Date()))
        throw new TRPCError({
          code: "CONFLICT",
          message: "Je bent al lid",
        });

      const stripe = getStripe();
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          ...(user.email ? { email: user.email } : {}),
          ...((user.naam ?? user.name)
            ? { name: (user.naam ?? user.name)! }
            : {}),
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await ctx.db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
      }

      // Inline prijs: de admin kan het bedrag wijzigen zonder Stripe-dashboard. Bestaande
      // leden houden hun prijs, want die staat vast in hun abonnement.
      const meta = {
        kind: "membership",
        userId: user.id,
        priceCents: String(prices.membershipCents),
      };
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card", "ideal"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: prices.membershipCents,
              recurring: { interval: "year" },
              product_data: { name: "Jaarlidmaatschap alumni" },
            },
          },
        ],
        metadata: meta,
        subscription_data: { metadata: meta },
        success_url: `${env.NEXT_PUBLIC_APP_URL}/lidmaatschap?success=1`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/lidmaatschap`,
        locale: "nl",
      });
      if (!session.url)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Betalen is even niet mogelijk. Probeer het opnieuw.",
        });
      return { url: session.url };
    }),
});
