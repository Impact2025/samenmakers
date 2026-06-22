import { createTRPCRouter } from "@/server/trpc/init";
import { usersRouter } from "@/server/trpc/routers/users";
import { matchesRouter } from "@/server/trpc/routers/matches";
import { messagesRouter } from "@/server/trpc/routers/messages";
import { notificationsRouter } from "@/server/trpc/routers/notifications";
import { postsRouter } from "@/server/trpc/routers/posts";
import { eventsRouter } from "@/server/trpc/routers/events";
import { connectionsRouter } from "@/server/trpc/routers/connections";
import { reportsRouter } from "@/server/trpc/routers/reports";
import { questionsRouter } from "@/server/trpc/routers/questions";
import { adminRouter } from "@/server/trpc/routers/admin";
import { blogRouter } from "@/server/trpc/routers/blog";
import { couponsRouter } from "@/server/trpc/routers/coupons";
import { crmRouter } from "@/server/trpc/routers/crm";
import { campaignsRouter } from "@/server/trpc/routers/campaigns";
import { endorsementsRouter } from "@/server/trpc/routers/endorsements";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  endorsements: endorsementsRouter,
  matches: matchesRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
  posts: postsRouter,
  events: eventsRouter,
  connections: connectionsRouter,
  reports: reportsRouter,
  questions: questionsRouter,
  admin: adminRouter,
  blog: blogRouter,
  coupons: couponsRouter,
  crm: crmRouter,
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
