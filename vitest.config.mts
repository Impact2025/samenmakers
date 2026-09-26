import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        ".next/**",
      ],
    },
    env: {
      SKIP_ENV_VALIDATION: "true",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_PUSHER_KEY: "test-key",
      NEXT_PUBLIC_PUSHER_CLUSTER: "eu",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xxx",
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-key",
      DATABASE_URL: "postgresql://test:***@localhost:5432/test",
      DATABASE_URL_UNPOOLED: "postgresql://test:***@localhost:5432/test",
      AUTH_SECRET: "test-secret-that-is-at-least-32-characters-long-for-auth",
      AUTH_GOOGLE_ID: "test",
      AUTH_GOOGLE_SECRET: "test",
      AUTH_LINKEDIN_ID: "test",
      AUTH_LINKEDIN_SECRET: "test",
      PUSHER_APP_ID: "test",
      PUSHER_SECRET: "test",
      STRIPE_SECRET_KEY: "sk_test_xxx",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      STRIPE_PRO_PRICE_ID: "price_test",
      RESEND_API_KEY: "re_test",
      RESEND_FROM_EMAIL: "test@test.com",
      UPSTASH_REDIS_REST_URL: "https://test.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test",
      CRON_SECRET: "test-cron-secret-at-least-32-chars-for-cron-jobs!!",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
