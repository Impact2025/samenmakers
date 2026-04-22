import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url(),

    // Auth
    AUTH_SECRET: z.string().min(32),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_LINKEDIN_ID: z.string().min(1),
    AUTH_LINKEDIN_SECRET: z.string().min(1),

    // Pusher
    PUSHER_APP_ID: z.string().min(1),
    PUSHER_SECRET: z.string().min(1),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    STRIPE_PRO_PRICE_ID: z.string().startsWith("price_"),

    // Email
    RESEND_API_KEY: z.string().startsWith("re_"),
    RESEND_FROM_EMAIL: z.string().email(),

    // Upstash
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // Cron
    CRON_SECRET: z.string().min(32),

    // Node
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
    NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_LINKEDIN_ID: process.env.AUTH_LINKEDIN_ID,
    AUTH_LINKEDIN_SECRET: process.env.AUTH_LINKEDIN_SECRET,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
