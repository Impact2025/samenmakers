import webpush from "web-push";

// Lazily initialise VAPID so module-level eval doesn't throw during build.
let vapidReady = false;

function ensureVapid() {
  if (vapidReady) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT ?? "mailto:hello@samenmakers.nl";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(sub, pub, priv);
  vapidReady = true;
  return true;
}

// ---------------------------------------------------------------------------
// Redis subscription store (Upstash)
// ---------------------------------------------------------------------------

type PushSubscription = {
  endpoint: string;
  keys: { auth: string; p256dh: string };
};

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function redisGet(key: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const res = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json()) as { result: string | null };
  return json.result;
}

async function redisSet(key: string, value: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await fetch(`${redis.url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redis.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  }).catch(() => undefined);
}

async function redisDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await fetch(`${redis.url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redis.token}` },
  }).catch(() => undefined);
}

const subKey = (userId: string) => `push:sub:${userId}`;

export async function storePushSubscription(
  userId: string,
  subscription: PushSubscription,
): Promise<void> {
  await redisSet(subKey(userId), JSON.stringify(subscription));
}

export async function removePushSubscription(userId: string): Promise<void> {
  await redisDel(subKey(userId));
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  if (!ensureVapid()) return;

  const raw = await redisGet(subKey(userId));
  if (!raw) return;

  let sub: PushSubscription;
  try {
    sub = JSON.parse(raw) as PushSubscription;
  } catch {
    return;
  }

  await webpush
    .sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(payload),
    )
    .catch((err: unknown) => {
      // 410 Gone means subscription expired — clean up
      if (err instanceof webpush.WebPushError && err.statusCode === 410) {
        void removePushSubscription(userId);
      }
    });
}
