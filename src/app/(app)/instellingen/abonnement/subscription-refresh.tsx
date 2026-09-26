"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * After returning from Stripe Checkout the DB is updated by the webhook, but
 * the JWT session still caches the old `isPro`/role. This forces a one-time
 * session.update() (re-runs the jwt callback against the DB) and refreshes the
 * server components, so Pro access propagates without requiring a re-login.
 */
function Refresher() {
  const { update } = useSession();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void update().then(() => router.refresh());
  }, [update, router]);

  return null;
}

export function SubscriptionRefresh() {
  // Scoped provider — the rest of the app reads the session server-side.
  return (
    <SessionProvider>
      <Refresher />
    </SessionProvider>
  );
}
