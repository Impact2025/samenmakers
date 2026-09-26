import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const redis = createRedis();

// 20 swipes per day for free users (sliding window)
export const freeSwipeLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "24 h"),
      prefix: "rl:swipe:free",
    })
  : null;

// 200 swipes per day for Pro users (effectively unlimited)
export const proSwipeLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "24 h"),
      prefix: "rl:swipe:pro",
    })
  : null;

// General API protection: 60 req/min per user
export const apiLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:api",
    })
  : null;

export async function checkSwipeLimit(
  userId: string,
  isPro: boolean,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limiter = isPro ? proSwipeLimit : freeSwipeLimit;
  if (!limiter) return { allowed: true, remaining: 999, reset: 0 };

  const { success, remaining, reset } = await limiter.limit(userId);
  return { allowed: success, remaining, reset };
}

// ── Misbruikbescherming voor auth (login, registratie, wachtwoordreset) ──────
// Met Upstash: gedeeld over alle serverless-instanties. Zonder Upstash valt het terug
// op een per-instantie geheugenteller: zwakker, maar nooit helemaal onbeschermd.

type Bucket = "login" | "register" | "reset";

const AUTH_LIMITS: Record<Bucket, { max: number; windowSec: number }> = {
  login: { max: 10, windowSec: 15 * 60 },
  register: { max: 5, windowSec: 60 * 60 },
  reset: { max: 5, windowSec: 60 * 60 },
};

const authLimiters = redis
  ? (Object.fromEntries(
      (Object.keys(AUTH_LIMITS) as Bucket[]).map((b) => [
        b,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(
            AUTH_LIMITS[b].max,
            `${AUTH_LIMITS[b].windowSec} s`,
          ),
          prefix: `rl:auth:${b}`,
        }),
      ]),
    ) as Record<Bucket, Ratelimit>)
  : null;

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, max: number, windowSec: number): boolean {
  const now = Date.now();
  const hit = memory.get(key);
  if (!hit || hit.resetAt <= now) {
    if (memory.size > 10_000) memory.clear();
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  hit.count += 1;
  return hit.count <= max;
}

/** true = toegestaan. `key` is bijv. een IP-adres of e-mailadres. */
export async function checkAuthLimit(
  bucket: Bucket,
  key: string,
): Promise<boolean> {
  const k = key.toLowerCase();
  if (authLimiters) {
    try {
      const { success } = await authLimiters[bucket].limit(k);
      return success;
    } catch (e) {
      console.error(
        "[ratelimit] Upstash onbereikbaar, val terug op geheugen:",
        e,
      );
    }
  }
  const { max, windowSec } = AUTH_LIMITS[bucket];
  return memoryLimit(`${bucket}:${k}`, max, windowSec);
}

/** Beste gok voor het client-IP achter Vercel. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
