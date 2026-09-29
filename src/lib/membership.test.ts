import { describe, expect, it } from "vitest";
import type { Person } from "./access";
import {
  applyMemberPricing,
  canBuyMembership,
  isActiveMember,
  isValidPrice,
} from "./membership";
import { priceOrder, type TicketType } from "@/server/events/pricing";

const now = new Date("2026-11-01T12:00:00Z");
const future = new Date("2027-05-01T12:00:00Z");
const past = new Date("2026-10-01T12:00:00Z");

const ticket = (over: Partial<TicketType>): TicketType => ({
  id: "t",
  name: "Ticket",
  kind: "paid",
  priceCents: 5000,
  quantity: null,
  maxPerOrder: 10,
  salesStart: null,
  salesEnd: null,
  isHidden: false,
  ...over,
});

function priced(
  types: TicketType[],
  items: { ticketId: string; quantity: number }[],
) {
  const r = priceOrder(types, items, now);
  if (!r.ok) throw new Error(r.error);
  return r;
}

describe("isValidPrice", () => {
  it("accepteert hele centen binnen de grenzen", () => {
    expect(isValidPrice(15000)).toBe(true);
    expect(isValidPrice(50)).toBe(true);
  });
  it("weigert te laag, te hoog, gebroken en geen getal", () => {
    expect(isValidPrice(49)).toBe(false);
    expect(isValidPrice(0)).toBe(false);
    expect(isValidPrice(1_000_001)).toBe(false);
    expect(isValidPrice(150.5)).toBe(false);
    expect(isValidPrice("15000")).toBe(false);
    expect(isValidPrice(Number.NaN)).toBe(false);
  });
});

describe("isActiveMember", () => {
  it("is niet actief zonder lidmaatschap", () => {
    expect(isActiveMember(null, now)).toBe(false);
    expect(isActiveMember(undefined, now)).toBe(false);
  });
  it("is actief binnen de betaalperiode", () => {
    expect(
      isActiveMember({ status: "active", currentPeriodEnd: future }, now),
    ).toBe(true);
  });
  it("is niet actief na afloop van de periode", () => {
    expect(
      isActiveMember({ status: "active", currentPeriodEnd: past }, now),
    ).toBe(false);
  });
  it("is niet actief bij achterstand of opzegging", () => {
    expect(
      isActiveMember({ status: "past_due", currentPeriodEnd: future }, now),
    ).toBe(false);
    expect(
      isActiveMember({ status: "canceled", currentPeriodEnd: future }, now),
    ).toBe(false);
  });
  it("is actief als de einddatum nog niet bekend is", () => {
    expect(
      isActiveMember({ status: "active", currentPeriodEnd: null }, now),
    ).toBe(true);
  });
});

describe("canBuyMembership", () => {
  const person = (over: Partial<Person>): Person => ({
    isAdmin: false,
    memberships: [],
    ...over,
  });
  it("is er voor alumni en beheerders", () => {
    expect(
      canBuyMembership(
        person({
          memberships: [
            {
              cohortId: "c",
              role: "alumnus",
              status: "actief",
              cohortStatus: "afgerond",
            },
          ],
        }),
      ),
    ).toBe(true);
    expect(canBuyMembership(person({ isAdmin: true }))).toBe(true);
  });
  it("is er niet voor bezoekers en lopende cursisten", () => {
    expect(canBuyMembership(person({}))).toBe(false);
    expect(
      canBuyMembership(
        person({
          memberships: [
            {
              cohortId: "c",
              role: "cursist",
              status: "actief",
              cohortStatus: "lopend",
            },
          ],
        }),
      ),
    ).toBe(false);
  });
});

describe("applyMemberPricing", () => {
  const paid = ticket({ id: "p", kind: "paid", priceCents: 5000 });
  const free = ticket({ id: "f", kind: "free", priceCents: 0 });
  const donation = ticket({ id: "d", kind: "donation", priceCents: 500 });

  it("maakt betaalde tickets gratis voor leden bij een lid-gratis-event", () => {
    const base = priced([paid], [{ ticketId: "p", quantity: 2 }]);
    expect(base.subtotalCents).toBe(10000);
    const r = applyMemberPricing(base, { isMember: true, memberFree: true });
    expect(r.subtotalCents).toBe(0);
    expect(r.lines[0]!.unitPriceCents).toBe(0);
  });

  it("verandert niets voor niet-leden", () => {
    const base = priced([paid], [{ ticketId: "p", quantity: 1 }]);
    expect(
      applyMemberPricing(base, { isMember: false, memberFree: true }),
    ).toEqual(base);
  });

  it("verandert niets bij events met eigen prijs (memberFree uit)", () => {
    const base = priced([paid], [{ ticketId: "p", quantity: 1 }]);
    const r = applyMemberPricing(base, { isMember: true, memberFree: false });
    expect(r.subtotalCents).toBe(5000);
  });

  it("laat donaties staan en rekent gemengde bestellingen goed door", () => {
    const base = priced(
      [paid, free, donation],
      [
        { ticketId: "p", quantity: 1 },
        { ticketId: "f", quantity: 1 },
        { ticketId: "d", quantity: 1 },
      ],
    );
    const r = applyMemberPricing(base, { isMember: true, memberFree: true });
    expect(r.subtotalCents).toBe(500);
  });

  it("wijzigt het oorspronkelijke resultaat niet", () => {
    const base = priced([paid], [{ ticketId: "p", quantity: 1 }]);
    applyMemberPricing(base, { isMember: true, memberFree: true });
    expect(base.lines[0]!.unitPriceCents).toBe(5000);
  });
});
