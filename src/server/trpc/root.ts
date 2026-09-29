import { createTRPCRouter } from "@/server/trpc/init";
import { usersRouter } from "@/server/trpc/routers/users";
import { matchesRouter } from "@/server/trpc/routers/matches";
import { messagesRouter } from "@/server/trpc/routers/messages";
import { notificationsRouter } from "@/server/trpc/routers/notifications";
import { postsRouter } from "@/server/trpc/routers/posts";
import { eventsRouter } from "@/server/trpc/routers/events";
import { ticketsRouter } from "@/server/trpc/routers/tickets";
import { connectionsRouter } from "@/server/trpc/routers/connections";
import { reportsRouter } from "@/server/trpc/routers/reports";
import { questionsRouter } from "@/server/trpc/routers/questions";
import { adminRouter } from "@/server/trpc/routers/admin";
import { blogRouter } from "@/server/trpc/routers/blog";
import { couponsRouter } from "@/server/trpc/routers/coupons";
import { crmRouter } from "@/server/trpc/routers/crm";
import { campaignsRouter } from "@/server/trpc/routers/campaigns";
import { endorsementsRouter } from "@/server/trpc/routers/endorsements";
import { learningRouter } from "@/server/trpc/routers/learning";
import { programsRouter } from "@/server/trpc/routers/programs";
import { teachingRouter } from "@/server/trpc/routers/teaching";
import { sessionsRouter } from "@/server/trpc/routers/sessions";
import { assignmentsRouter } from "@/server/trpc/routers/assignments";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  endorsements: endorsementsRouter,
  matches: matchesRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
  posts: postsRouter,
  events: eventsRouter,
  tickets: ticketsRouter,
  connections: connectionsRouter,
  reports: reportsRouter,
  questions: questionsRouter,
  admin: adminRouter,
  blog: blogRouter,
  coupons: couponsRouter,
  crm: crmRouter,
  campaigns: campaignsRouter,
  learning: learningRouter,
  programs: programsRouter,
  teaching: teachingRouter,
  sessions: sessionsRouter,
  assignments: assignmentsRouter,
});

export type AppRouter = typeof appRouter;
