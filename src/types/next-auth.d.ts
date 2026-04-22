import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isPro: boolean;
      naam: string | null;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }
}
