import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type Stripe from "stripe";
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import { coupons, couponRedemptions, auditLog } from "@/server/db/schema";
import { getStripe } from "@/server/stripe";

const createInput = z
  .object({
    code: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Alleen letters, cijfers, - en _"),
    description: z.string().max(200).optional(),
    discountType: z.enum(["percent", "amount"]),
    discountValue: z.number().int().positive(),
    duration: z.enum(["once", "repeating", "forever"]).default("once"),
    durationInMonths: z.number().int().positive().optional(),
    maxRedemptions: z.number().int().positive().optional(),
    expiresAt: z.date().optional(),
  })
  .refine(
    (v) => v.discountType !== "percent" || v.discountValue <= 100,
    { message: "Percentage moet ≤ 100 zijn", path: ["discountValue"] },
  )
  .refine(
    (v) => v.duration !== "repeating" || !!v.durationInMonths,
    { message: "Aantal maanden vereist bij 'repeating'", path: ["durationInMonths"] },
  );

export const couponsRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)],
      limit: 200,
    });
  }),

  create: adminProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      const code = input.code.toUpperCase();
      const stripe = getStripe();

      // Reject duplicates early (case-insensitive via stored uppercase).
      const existing = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.code, code),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Code bestaat al." });
      }

      try {
        const couponParams: Stripe.CouponCreateParams = {
          name: code,
          duration: input.duration,
          ...(input.duration === "repeating" && input.durationInMonths
            ? { duration_in_months: input.durationInMonths }
            : {}),
          ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
        };
        if (input.discountType === "percent") {
          couponParams.percent_off = input.discountValue;
        } else {
          couponParams.amount_off = input.discountValue;
          couponParams.currency = "eur";
        }

        const stripeCoupon = await stripe.coupons.create(couponParams);

        const promo = await stripe.promotionCodes.create({
          promotion: { type: "coupon", coupon: stripeCoupon.id },
          code,
          ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
          ...(input.expiresAt
            ? { expires_at: Math.floor(input.expiresAt.getTime() / 1000) }
            : {}),
        });

        const [row] = await ctx.db
          .insert(coupons)
          .values({
            code,
            description: input.description,
            stripeCouponId: stripeCoupon.id,
            stripePromotionCodeId: promo.id,
            discountType: input.discountType,
            discountValue: input.discountValue,
            duration: input.duration,
            durationInMonths: input.durationInMonths ?? null,
            maxRedemptions: input.maxRedemptions ?? null,
            expiresAt: input.expiresAt ?? null,
            createdBy: ctx.userId,
          })
          .returning();

        await ctx.db.insert(auditLog).values({
          adminId: ctx.userId,
          action: "create_coupon",
          targetType: "coupon",
          targetId: row!.id,
          details: JSON.stringify({ code, type: input.discountType, value: input.discountValue }),
        });

        return row;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const message =
          err instanceof Error ? err.message : "Aanmaken bij Stripe mislukt.";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });
      if (!coupon) throw new TRPCError({ code: "NOT_FOUND" });

      // Promotion codes can be toggled; coupons cannot be reactivated once
      // deleted, so we only flip the promotion code's active flag.
      if (coupon.stripePromotionCodeId) {
        await getStripe().promotionCodes.update(coupon.stripePromotionCodeId, {
          active: input.active,
        });
      }
      await ctx.db
        .update(coupons)
        .set({ active: input.active, updatedAt: new Date() })
        .where(eq(coupons.id, input.id));

      return { success: true };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });
      if (!coupon) throw new TRPCError({ code: "NOT_FOUND" });
      if (coupon.timesRedeemed > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Code is al gebruikt — deactiveer hem in plaats van verwijderen.",
        });
      }

      // Delete the underlying Stripe coupon (also disables the promo code).
      if (coupon.stripeCouponId) {
        await getStripe().coupons.del(coupon.stripeCouponId).catch(() => undefined);
      }
      await ctx.db.delete(coupons).where(eq(coupons.id, input.id));
      await ctx.db.insert(auditLog).values({
        adminId: ctx.userId,
        action: "delete_coupon",
        targetType: "coupon",
        targetId: input.id,
      });
      return { success: true };
    }),

  // Used by the subscription page to preview a code before checkout.
  validate: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const code = input.code.toUpperCase();
      const coupon = await ctx.db.query.coupons.findFirst({
        where: and(eq(coupons.code, code), eq(coupons.active, true)),
      });
      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ongeldige code." });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code is verlopen." });
      }
      if (
        coupon.maxRedemptions !== null &&
        coupon.timesRedeemed >= coupon.maxRedemptions
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code is uitverkocht." });
      }
      return {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        duration: coupon.duration,
      };
    }),
});
