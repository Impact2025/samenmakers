// Pure prijs- en validatieregels voor ticketbestellingen (getest in pricing.test.ts).

export interface TicketType {
  id: string;
  name: string;
  kind: "free" | "paid" | "donation";
  priceCents: number;
  quantity: number | null;
  maxPerOrder: number;
  salesStart: Date | null;
  salesEnd: Date | null;
  isHidden: boolean;
}

export interface RequestedItem {
  ticketId: string;
  quantity: number;
  /** Alleen bij donation: het gekozen bedrag per ticket. */
  amountCents?: number | undefined;
}

export interface PricedLine {
  ticket: TicketType;
  quantity: number;
  unitPriceCents: number;
}

export type PriceResult =
  | { ok: true; lines: PricedLine[]; subtotalCents: number; quantity: number }
  | { ok: false; error: string };

/** Absolute bovengrens per bestelling, los van maxPerOrder per type. */
export const MAX_TICKETS_PER_ORDER = 50;
/** Stripe weigert (iDEAL/kaart) betalingen onder € 0,50. */
export const STRIPE_MIN_CENTS = 50;

export function salesState(
  t: TicketType,
  now: Date,
): "not_started" | "on_sale" | "ended" {
  if (t.salesStart && now < t.salesStart) return "not_started";
  if (t.salesEnd && now >= t.salesEnd) return "ended";
  return "on_sale";
}

export function priceOrder(
  tickets: TicketType[],
  requested: RequestedItem[],
  now: Date = new Date(),
): PriceResult {
  const byId = new Map(tickets.map((t) => [t.id, t]));
  const merged = new Map<string, RequestedItem>();
  for (const r of requested) {
    if (!Number.isInteger(r.quantity) || r.quantity < 0)
      return { ok: false, error: "Ongeldig aantal" };
    if (r.quantity === 0) continue;
    const prev = merged.get(r.ticketId);
    merged.set(r.ticketId, {
      ...r,
      quantity: (prev?.quantity ?? 0) + r.quantity,
    });
  }
  if (merged.size === 0)
    return { ok: false, error: "Kies minstens één ticket" };

  const lines: PricedLine[] = [];
  let quantity = 0;
  for (const r of merged.values()) {
    const t = byId.get(r.ticketId);
    if (!t) return { ok: false, error: "Dit ticket bestaat niet (meer)" };
    const state = salesState(t, now);
    if (state === "not_started")
      return {
        ok: false,
        error: `De verkoop van "${t.name}" is nog niet begonnen`,
      };
    if (state === "ended")
      return { ok: false, error: `De verkoop van "${t.name}" is gesloten` };
    if (r.quantity > t.maxPerOrder)
      return {
        ok: false,
        error: `Maximaal ${t.maxPerOrder} × "${t.name}" per bestelling`,
      };

    let unit: number;
    if (t.kind === "free") unit = 0;
    else if (t.kind === "paid") unit = t.priceCents;
    else {
      const amount = r.amountCents ?? t.priceCents;
      if (!Number.isInteger(amount) || amount < t.priceCents) {
        return {
          ok: false,
          error: `Het minimumbedrag voor "${t.name}" is ${formatEuro(t.priceCents)}`,
        };
      }
      if (amount > 100_000)
        return { ok: false, error: "Dat bedrag is te hoog" };
      unit = amount;
    }
    lines.push({ ticket: t, quantity: r.quantity, unitPriceCents: unit });
    quantity += r.quantity;
  }
  if (quantity > MAX_TICKETS_PER_ORDER)
    return {
      ok: false,
      error: `Maximaal ${MAX_TICKETS_PER_ORDER} tickets per bestelling`,
    };

  const subtotalCents = lines.reduce(
    (s, l) => s + l.quantity * l.unitPriceCents,
    0,
  );
  if (subtotalCents > 0 && subtotalCents < STRIPE_MIN_CENTS) {
    return {
      ok: false,
      error: `Het minimale bestelbedrag is ${formatEuro(STRIPE_MIN_CENTS)}`,
    };
  }
  return { ok: true, lines, subtotalCents, quantity };
}

export interface FeeConfig {
  /** Percentage in basispunten (250 = 2,5%). */
  bps: number;
  /** Vast bedrag per betaald ticket, in centen. */
  fixedPerTicketCents: number;
}

export function feeConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): FeeConfig {
  const int = (v: string | undefined) => {
    const n = Number.parseInt(v ?? "", 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  return {
    bps: int(env.EVENT_PLATFORM_FEE_BPS),
    fixedPerTicketCents: int(env.EVENT_PLATFORM_FEE_FIXED_CENTS),
  };
}

/**
 * Platformfee over het bedrag vóór korting (Stripe kent de korting pas na afrekenen).
 * Nooit meer dan de helft van het subtotaal, zodat een flinke coupon de betaling niet
 * laat mislukken doordat de fee hoger is dan het betaalde bedrag.
 */
export function platformFee(lines: PricedLine[], cfg: FeeConfig): number {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0);
  if (subtotal === 0) return 0;
  const paidTickets = lines
    .filter((l) => l.unitPriceCents > 0)
    .reduce((s, l) => s + l.quantity, 0);
  const fee =
    Math.round((subtotal * cfg.bps) / 10_000) +
    paidTickets * cfg.fixedPerTicketCents;
  return Math.min(fee, Math.floor(subtotal / 2));
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Terugbetalen/annuleren door de deelnemer zelf mag tot `refundUntilHours` voor de start. */
export function canSelfRefund(
  startAt: Date,
  refundUntilHours: number | null,
  now: Date = new Date(),
): boolean {
  if (refundUntilHours === null) return false;
  return now.getTime() <= startAt.getTime() - refundUntilHours * 60 * 60 * 1000;
}
