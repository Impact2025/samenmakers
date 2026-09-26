// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  priceOrder,
  platformFee,
  feeConfigFromEnv,
  canSelfRefund,
  salesState,
  MAX_TICKETS_PER_ORDER,
  type TicketType,
  type PriceResult,
} from "./pricing";

function linesOf(r: PriceResult) {
  if (!r.ok) throw new Error(r.error);
  return r.lines;
}

const now = new Date("2026-10-01T10:00:00Z");
const base: Omit<TicketType, "id" | "name" | "kind" | "priceCents"> = {
  quantity: null,
  maxPerOrder: 10,
  salesStart: null,
  salesEnd: null,
  isHidden: false,
};
const free: TicketType = {
  ...base,
  id: "free",
  name: "Gratis",
  kind: "free",
  priceCents: 0,
};
const regular: TicketType = {
  ...base,
  id: "reg",
  name: "Regulier",
  kind: "paid",
  priceCents: 2500,
};
const early: TicketType = {
  ...base,
  id: "early",
  name: "Vroegboek",
  kind: "paid",
  priceCents: 1500,
  salesEnd: new Date("2026-09-30T22:00:00Z"),
};
const donation: TicketType = {
  ...base,
  id: "don",
  name: "Betaal wat je kunt",
  kind: "donation",
  priceCents: 500,
};
const all = [free, regular, early, donation];

describe("priceOrder", () => {
  it("telt regels op en voegt dubbele regels samen", () => {
    const r = priceOrder(
      all,
      [
        { ticketId: "reg", quantity: 2 },
        { ticketId: "reg", quantity: 1 },
        { ticketId: "free", quantity: 1 },
      ],
      now,
    );
    expect(r).toMatchObject({ ok: true, subtotalCents: 7500, quantity: 4 });
  });

  it("negeert nul-regels maar eist minstens één ticket", () => {
    expect(priceOrder(all, [{ ticketId: "reg", quantity: 0 }], now)).toEqual({
      ok: false,
      error: "Kies minstens één ticket",
    });
  });

  it("donatie: gekozen bedrag, niet onder het minimum", () => {
    expect(
      priceOrder(
        all,
        [{ ticketId: "don", quantity: 1, amountCents: 1200 }],
        now,
      ),
    ).toMatchObject({ ok: true, subtotalCents: 1200 });
    expect(
      priceOrder(all, [{ ticketId: "don", quantity: 1 }], now),
    ).toMatchObject({ ok: true, subtotalCents: 500 });
    const low = priceOrder(
      all,
      [{ ticketId: "don", quantity: 1, amountCents: 100 }],
      now,
    );
    expect(low.ok).toBe(false);
  });

  it("verkoopvenster: vroegboek gesloten, nog niet gestart", () => {
    expect(
      priceOrder(all, [{ ticketId: "early", quantity: 1 }], now),
    ).toMatchObject({ ok: false });
    const later: TicketType = {
      ...regular,
      id: "later",
      salesStart: new Date("2026-11-01T00:00:00Z"),
    };
    expect(salesState(later, now)).toBe("not_started");
    expect(salesState(early, now)).toBe("ended");
    expect(salesState(regular, now)).toBe("on_sale");
  });

  it("limieten per type en per bestelling", () => {
    expect(
      priceOrder(all, [{ ticketId: "reg", quantity: 11 }], now),
    ).toMatchObject({ ok: false });
    const many = Array.from({ length: 6 }, (_, i) => ({
      ...free,
      id: `f${i}`,
    }));
    const req = many.map((t) => ({ ticketId: t.id, quantity: 10 }));
    expect(priceOrder(many, req, now)).toEqual({
      ok: false,
      error: `Maximaal ${MAX_TICKETS_PER_ORDER} tickets per bestelling`,
    });
  });

  it("onbekende tickets en ongeldige aantallen", () => {
    expect(
      priceOrder(all, [{ ticketId: "x", quantity: 1 }], now),
    ).toMatchObject({ ok: false });
    expect(
      priceOrder(all, [{ ticketId: "reg", quantity: -1 }], now),
    ).toMatchObject({ ok: false });
    expect(
      priceOrder(all, [{ ticketId: "reg", quantity: 1.5 }], now),
    ).toMatchObject({ ok: false });
  });

  it("betaald totaal onder Stripe-minimum wordt geweigerd", () => {
    const cheap: TicketType = { ...regular, id: "cheap", priceCents: 30 };
    expect(
      priceOrder([cheap], [{ ticketId: "cheap", quantity: 1 }], now),
    ).toMatchObject({ ok: false });
  });
});

describe("platformFee", () => {
  const lines = linesOf(
    priceOrder(
      all,
      [
        { ticketId: "reg", quantity: 2 },
        { ticketId: "free", quantity: 3 },
      ],
      now,
    ),
  );

  it("percentage + vast bedrag per betaald ticket", () => {
    expect(platformFee(lines, { bps: 250, fixedPerTicketCents: 35 })).toBe(
      125 + 70,
    );
  });
  it("nul bij gratis bestellingen of zonder fee", () => {
    const freeLines = linesOf(
      priceOrder(all, [{ ticketId: "free", quantity: 2 }], now),
    );
    expect(platformFee(freeLines, { bps: 500, fixedPerTicketCents: 50 })).toBe(
      0,
    );
    expect(platformFee(lines, { bps: 0, fixedPerTicketCents: 0 })).toBe(0);
  });
  it("nooit meer dan de helft van het subtotaal", () => {
    expect(platformFee(lines, { bps: 9000, fixedPerTicketCents: 0 })).toBe(
      2500,
    );
  });
  it("leest configuratie uit env, ongeldige waarden → 0", () => {
    expect(
      feeConfigFromEnv({
        EVENT_PLATFORM_FEE_BPS: "250",
        EVENT_PLATFORM_FEE_FIXED_CENTS: "35",
      }),
    ).toEqual({ bps: 250, fixedPerTicketCents: 35 });
    expect(
      feeConfigFromEnv({
        EVENT_PLATFORM_FEE_BPS: "abc",
        EVENT_PLATFORM_FEE_FIXED_CENTS: "-5",
      }),
    ).toEqual({ bps: 0, fixedPerTicketCents: 0 });
  });
});

describe("canSelfRefund", () => {
  const start = new Date("2026-10-08T10:00:00Z");
  it("tot X uur voor de start", () => {
    expect(canSelfRefund(start, 48, now)).toBe(true);
    expect(canSelfRefund(start, 24 * 7, now)).toBe(true);
    expect(canSelfRefund(start, 24 * 8, now)).toBe(false);
  });
  it("null = geen zelf-annulering", () => {
    expect(canSelfRefund(start, null, now)).toBe(false);
  });
});
