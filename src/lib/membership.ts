// Pure regels voor het alumni-jaarlidmaatschap en ledenprijzen (geen DB, getest in membership.test.ts).
// Afspraken uit het klantgesprek: lidmaatschap €150 per jaar voor alumni, leden komen gratis
// binnen bij de meeste events, bezoekers en cursisten betalen per event. Prijzen bepaalt de admin.

import type { Person } from "@/lib/access";
import { isAlumnus } from "@/lib/access";
import type { PricedLine, PriceResult } from "@/server/events/pricing";

export const DEFAULT_MEMBERSHIP_PRICE_CENTS = 15_000;
export const DEFAULT_EVENT_PRICE_CENTS = 5_000;
/** Stripe weigert betalingen onder € 0,50. */
export const MIN_PRICE_CENTS = 50;
export const MAX_PRICE_CENTS = 1_000_000;

export function isValidPrice(cents: unknown): cents is number {
  return (
    typeof cents === "number" &&
    Number.isInteger(cents) &&
    cents >= MIN_PRICE_CENTS &&
    cents <= MAX_PRICE_CENTS
  );
}

export interface MembershipState {
  status: "active" | "past_due" | "canceled";
  currentPeriodEnd: Date | null;
}

/** Actief lid: betaald en (indien bekend) binnen de betaalperiode. Achterstallig telt niet. */
export function isActiveMember(
  m: MembershipState | null | undefined,
  now: Date,
): boolean {
  if (!m || m.status !== "active") return false;
  return m.currentPeriodEnd === null || m.currentPeriodEnd > now;
}

/** Het lidmaatschap is er voor alumni (en beheerders, om te kunnen testen). */
export function canBuyMembership(p: Person): boolean {
  return p.isAdmin || isAlumnus(p);
}

/**
 * Leden betalen niet voor betaalde tickets van events die "gratis voor leden" zijn.
 * Donaties blijven vrijwillig en dus onaangeroerd. Meerdaagse programma's met eigen
 * prijs zetten memberFree uit en kosten voor iedereen hetzelfde.
 */
export function applyMemberPricing(
  priced: Extract<PriceResult, { ok: true }>,
  opts: { isMember: boolean; memberFree: boolean },
): Extract<PriceResult, { ok: true }> {
  if (!opts.isMember || !opts.memberFree) return priced;
  const lines: PricedLine[] = priced.lines.map((l) =>
    l.ticket.kind === "paid" ? { ...l, unitPriceCents: 0 } : l,
  );
  const subtotalCents = lines.reduce(
    (n, l) => n + l.unitPriceCents * l.quantity,
    0,
  );
  return { ...priced, lines, subtotalCents };
}
