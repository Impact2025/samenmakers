import { timingSafeEqual } from "node:crypto";

/**
 * Controleert de Bearer-token van een cron-aanroep. Weigert altijd als CRON_SECRET niet
 * (of te kort) is ingesteld: `Bearer ${undefined}` mag nooit als geldig token tellen.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
