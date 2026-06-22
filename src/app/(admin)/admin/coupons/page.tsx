import type { Metadata } from "next";
import { CouponManager } from "./coupon-manager";

export const metadata: Metadata = { title: "Admin — Coupons" };

export default function AdminCouponsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-on-surface">Coupons</h1>
        <p className="text-sm text-outline mt-1">
          Kortingscodes — gespiegeld naar Stripe, met live redemption-tracking
        </p>
      </div>
      <CouponManager />
    </div>
  );
}
