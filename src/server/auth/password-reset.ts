import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { verificationTokens } from "@/server/db/schema";

const TTL_MS = 60 * 60 * 1000; // 1 uur

const identifierFor = (email: string) => `reset:${email.trim().toLowerCase()}`;
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Maakt een eenmalig resettoken aan en geeft de ruwe waarde terug (alleen voor in de mail).
 * In de database staat alleen de hash; eerdere tokens voor dit adres vervallen.
 */
export async function createResetToken(
  email: string,
  ttlMs: number = TTL_MS,
): Promise<string> {
  const identifier = identifierFor(email);
  const token = randomBytes(32).toString("base64url");
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({
    identifier,
    token: hash(token),
    expires: new Date(Date.now() + ttlMs),
  });
  return token;
}

/** Controleert en verbruikt het token. true = geldig (en nu ongeldig gemaakt). */
export async function consumeResetToken(
  email: string,
  token: string,
): Promise<boolean> {
  const identifier = identifierFor(email);
  const hashed = hash(token);
  const row = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.identifier, identifier),
  });
  if (!row) return false;

  const a = Buffer.from(row.token);
  const b = Buffer.from(hashed);
  const matches = a.length === b.length && timingSafeEqual(a, b);
  if (!matches) return false;

  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, row.token),
      ),
    );
  return row.expires.getTime() > Date.now();
}
