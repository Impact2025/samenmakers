import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, accounts, sessions, verificationTokens } from "@/server/db/schema";
import { env } from "@/env";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/inloggen",
    newUser: "/onboarding",
    error: "/inloggen",
    verifyRequest: "/verificeer",
  },
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
      : []),
    ...(env.AUTH_LINKEDIN_ID && env.AUTH_LINKEDIN_SECRET
      ? [LinkedIn({ clientId: env.AUTH_LINKEDIN_ID, clientSecret: env.AUTH_LINKEDIN_SECRET })]
      : []),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.naam ?? user.name,
          image: user.avatarUrl ?? user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign-in, enrich from the user id; on an explicit
      // session.update() (e.g. after a Stripe upgrade) re-read from the
      // existing token id so Pro/role changes propagate without re-login.
      const userId = user?.id ?? (trigger === "update" ? (token.id as string | undefined) : undefined);
      if (userId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isPro = dbUser.subscriptionStatus === "active";
          token.naam = dbUser.naam ?? dbUser.name;
          token.avatarUrl = dbUser.avatarUrl ?? dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isPro = token.isPro as boolean;
        session.user.naam = token.naam as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db
        .update(users)
        .set({
          referralCode: generateReferralCode(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    },
  },
});

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
