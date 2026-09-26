// Ondertekend token voor de persoonlijke, abonneerbare agenda-feed. Zonder opslag:
// het token is userId + HMAC. Intrekken kan door AUTH_SECRET te roteren.
import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET ontbreekt");
  return s;
}

function mac(userId: string, key: string): string {
  return createHmac("sha256", key)
    .update(`calendar:${userId}`)
    .digest("base64url")
    .slice(0, 32);
}

export function signCalendarToken(
  userId: string,
  key: string = secret(),
): string {
  return `${Buffer.from(userId).toString("base64url")}.${mac(userId, key)}`;
}

export function verifyCalendarToken(
  token: string,
  key: string = secret(),
): string | null {
  const [idPart, sig] = token.split(".");
  if (!idPart || !sig) return null;
  const userId = Buffer.from(idPart, "base64url").toString("utf8");
  const expected = Buffer.from(mac(userId, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  return userId;
}
