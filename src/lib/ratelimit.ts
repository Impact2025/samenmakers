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
