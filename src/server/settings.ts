import "server-only";
import { inArray } from "drizzle-orm";
import type { Database } from "@/server/db";
import { platformSettings } from "@/server/db/schema";
import {
  DEFAULT_EVENT_PRICE_CENTS,
  DEFAULT_MEMBERSHIP_PRICE_CENTS,
  isValidPrice,
} from "@/lib/membership";

export const PRICE_KEYS = {
  membership: "membership_price_cents",
  event: "event_default_price_cents",
} as const;

export interface Prices {
  membershipCents: number;
  eventCents: number;
}

/** Door de admin ingestelde prijzen, met de afgesproken standaard (€150 en €50) als terugval. */
export async function loadPrices(db: Database): Promise<Prices> {
  const rows = await db
    .select()
    .from(platformSettings)
    .where(
      inArray(platformSettings.key, [PRICE_KEYS.membership, PRICE_KEYS.event]),
    );
  const get = (key: string, fallback: number) => {
    const v = rows.find((r) => r.key === key)?.valueCents;
    return isValidPrice(v) ? v : fallback;
  };
  return {
    membershipCents: get(PRICE_KEYS.membership, DEFAULT_MEMBERSHIP_PRICE_CENTS),
    eventCents: get(PRICE_KEYS.event, DEFAULT_EVENT_PRICE_CENTS),
  };
}
