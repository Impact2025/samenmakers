import type { Metadata } from "next";
import { CouponManager } from "./coupon-manager";

export const metadata: Metadata = { title: "Admin — Coupons" };

export default function AdminCouponsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-on-surface text-2xl font-extrabold">Coupons</h1>
        <p className="text-secondary mt-1 text-sm">
          Kortingscodes — gespiegeld naar Stripe, met live redemption-tracking
        </p>
      </div>
      <CouponManager />
    </div>
  );
}
