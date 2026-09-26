"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ververs een paar keer tot de Stripe-webhook de bestelling heeft afgerond. */
export function PendingRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (++n > 10) return clearInterval(id);
      router.refresh();
    }, 2000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
