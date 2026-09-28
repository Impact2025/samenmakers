import "server-only";
import type { OAuthProviders } from "@/app/(auth)/oauth-buttons";

/** Welke OAuth-providers geconfigureerd zijn (zelfde voorwaarden als in auth/config.ts). */
export function enabledOAuthProviders(): OAuthProviders {
  return {
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    linkedin: !!(
      process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET
    ),
  };
}
