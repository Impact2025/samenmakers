import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";
import { env } from "@/env";
import { z } from "zod";
import { checkAuthLimit, clientIp } from "@/lib/ratelimit";

/** Hoe vaak rol/Pro/status uit de database opnieuw in de sessie worden gezet. */
const SESSION_REFRESH_MS = 5 * 60 * 1000;

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
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
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(env.AUTH_LINKEDIN_ID && env.AUTH_LINKEDIN_SECRET
      ? [
          LinkedIn({
            clientId: env.AUTH_LINKEDIN_ID,
            clientSecret: env.AUTH_LINKEDIN_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Brute-force-bescherming: per e-mailadres én per IP.
        const [byEmail, byIp] = await Promise.all([
          checkAuthLimit("login", parsed.data.email),
          checkAuthLimit("login", `ip:${clientIp(request)}`),
        ]);
        if (!byEmail || !byIp) return null;

        const user = await db.query.users.findFirst({
          where: sql`lower(${users.email}) = ${parsed.data.email}`,
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) return null;
        if (user.status === "suspended" || user.status === "banned")
          return null;

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
    // OAuth-login weigeren voor geschorste/verbannen accounts.
    async signIn({ user }) {
      if (!user.id) return true;
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { status: true },
      });
      return !(dbUser?.status === "suspended" || dbUser?.status === "banned");
    },
    async jwt({ token, user, trigger }) {
      // Bij inloggen, bij session.update() (bijv. na een Stripe-upgrade) en daarna
      // elke SESSION_REFRESH_MS lezen we de gebruiker opnieuw. Zo werken rolwijzigingen,
      // opzeggingen en blokkades binnen minuten door, niet pas na 30 dagen.
      const userId = user?.id ?? (token.id as string | undefined);
      const stale =
        !!user ||
        trigger === "update" ||
        Date.now() - ((token.refreshedAt as number | undefined) ?? 0) >
          SESSION_REFRESH_MS;
      if (!userId || !stale) return token;

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          role: true,
          status: true,
          subscriptionStatus: true,
          naam: true,
          name: true,
          avatarUrl: true,
          image: true,
        },
      });
      // Verwijderd, geschorst of verbannen → sessie ongeldig (gebruiker wordt uitgelogd).
      if (
        !dbUser ||
        dbUser.status === "suspended" ||
        dbUser.status === "banned"
      )
        return null;

      // Opnieuw inloggen tijdens de bedenktijd annuleert een verwijderaanvraag.
      if (user && dbUser.status === "pending_deletion") {
        await db
          .update(users)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(users.id, dbUser.id));
      }

      token.id = dbUser.id;
      token.role = dbUser.role;
      token.isPro = dbUser.subscriptionStatus === "active";
      token.naam = dbUser.naam ?? dbUser.name;
      token.avatarUrl = dbUser.avatarUrl ?? dbUser.image;
      token.refreshedAt = Date.now();
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

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
