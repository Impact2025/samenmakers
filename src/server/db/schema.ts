import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// =============================================
// ENUMS
// =============================================

export const faseEnum = pgEnum("fase", ["starter", "groei", "scale"]);

export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "matched",
  "declined",
]);

export const postCategoryEnum = pgEnum("post_category", [
  "blog",
  "kennisbank",
  "tool",
  "funding",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none",
  "active",
  "past_due",
  "canceled",
]);

export const mentorshipRoleEnum = pgEnum("mentorship_role", [
  "mentor",
  "mentee",
  "both",
  "none",
]);

export const profileVisibilityEnum = pgEnum("profile_visibility", [
  "public",
  "members",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_match",
  "connection_request",
  "new_message",
  "event_reminder",
  "event_post_suggestion",
  "profile_view",
  "milestone",
  "referral_reward",
  "system",
]);

export const eventAttendeeStatusEnum = pgEnum("event_attendee_status", [
  "registered",
  "waitlisted",
  "checked_in",
  "cancelled",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "spam",
  "harassment",
  "inappropriate",
  "misinformation",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
  "pending_deletion",
]);

export const scheduledContentTypeEnum = pgEnum("scheduled_content_type", [
  "post",
  "event",
]);

// =============================================
// AUTH TABLES (Auth.js v5 + DrizzleAdapter)
// =============================================

export const users = pgTable(
  "users",
  {
    // Auth.js required
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    password: text("password"),

    // Profile
    naam: text("naam"),
    bio: text("bio"),
    missie: text("missie"),
    ikZoek: text("ik_zoek"),
    sector: text("sector"),
    regio: text("regio"),
    fase: faseEnum("fase"),
    avatarUrl: text("avatar_url"),
    website: text("website"),
    linkedin: text("linkedin"),
    expertise: text("expertise").array().default([]).notNull(),
    zoektNaar: text("zoekt_naar").array().default([]).notNull(),
    mentorshipRole: mentorshipRoleEnum("mentorship_role")
      .default("none")
      .notNull(),
    profileVisibility: profileVisibilityEnum("profile_visibility")
      .default("members")
      .notNull(),

    // Gamification
    profileCompleteness: integer("profile_completeness").default(0).notNull(),

    // Status
    status: userStatusEnum("status").default("active").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    role: text("role").default("user").notNull(), // "user" | "admin"

    // Stripe
    stripeCustomerId: text("stripe_customer_id").unique(),
    subscriptionId: text("subscription_id"),
    subscriptionStatus: subscriptionStatusEnum("subscription_status")
      .default("none")
      .notNull(),

    // Referral
    referralCode: text("referral_code").unique(),
    referredById: text("referred_by_id"),

    // Preferences
    weeklyDigestEnabled: boolean("weekly_digest_enabled")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_stripe_customer_idx").on(t.stripeCustomerId),
    uniqueIndex("users_referral_code_idx").on(t.referralCode),
    index("users_sector_idx").on(t.sector),
    index("users_regio_idx").on(t.regio),
    index("users_fase_idx").on(t.fase),
    index("users_featured_idx").on(t.isFeatured),
    index("users_mentorship_idx").on(t.mentorshipRole),
    index("users_status_idx").on(t.status),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("accounts_user_id_idx").on(t.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// =============================================
// MATCHING
// =============================================

export const matches = pgTable(
  "matches",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: matchStatusEnum("status").default("pending").notNull(),
    requestMessage: text("request_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("matches_user_target_idx").on(t.userId, t.targetId),
    index("matches_user_id_idx").on(t.userId),
    index("matches_target_id_idx").on(t.targetId),
    index("matches_status_idx").on(t.status),
  ],
);

// =============================================
// MESSAGES
// =============================================

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("messages_match_id_idx").on(t.matchId),
    index("messages_sender_id_idx").on(t.senderId),
    index("messages_created_at_idx").on(t.createdAt),
  ],
);

// =============================================
// CONTENT — POSTS
// =============================================

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    category: postCategoryEnum("category").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("posts_slug_idx").on(t.slug),
    index("posts_author_id_idx").on(t.authorId),
    index("posts_category_idx").on(t.category),
    index("posts_published_idx").on(t.isPublished, t.publishedAt),
  ],
);

export const postComments = pgTable(
  "post_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("post_comments_post_id_idx").on(t.postId)],
);

export const postReactions = pgTable(
  "post_reactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("post_reactions_unique_idx").on(t.postId, t.userId),
    index("post_reactions_post_id_idx").on(t.postId),
  ],
);

// =============================================
// CONTENT — Q&A
// =============================================

export const questions = pgTable(
  "questions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
    sector: text("sector"),
    isResolved: boolean("is_resolved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("questions_author_id_idx").on(t.authorId),
    index("questions_sector_idx").on(t.sector),
  ],
);

export const questionAnswers = pgTable(
  "question_answers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isAccepted: boolean("is_accepted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("question_answers_question_id_idx").on(t.questionId)],
);

// =============================================
// EVENTS
// =============================================

export const events = pgTable(
  "events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organiserId: text("organiser_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    location: text("location"),
    isOnline: boolean("is_online").default(false).notNull(),
    meetingUrl: text("meeting_url"),
    coverImageUrl: text("cover_image_url"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    maxAttendees: integer("max_attendees"),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("events_slug_idx").on(t.slug),
    index("events_organiser_idx").on(t.organiserId),
    index("events_start_at_idx").on(t.startAt),
    index("events_published_idx").on(t.isPublished),
  ],
);

export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: eventAttendeeStatusEnum("status").default("registered").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("event_attendees_unique_idx").on(t.eventId, t.userId),
    index("event_attendees_event_id_idx").on(t.eventId),
    index("event_attendees_user_id_idx").on(t.userId),
  ],
);

export const eventCheckIns = pgTable(
  "event_check_ins",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    checkedInBy: text("checked_in_by").references(() => users.id),
  },
  (t) => [
    uniqueIndex("event_check_ins_unique_idx").on(t.eventId, t.userId),
    index("event_check_ins_event_id_idx").on(t.eventId),
  ],
);

// =============================================
// SOCIAL FEATURES
// =============================================

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    url: text("url"),
    avatarUrl: text("avatar_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("notifications_read_at_idx").on(t.readAt),
    index("notifications_created_at_idx").on(t.createdAt),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("bookmarks_user_id_idx").on(t.userId),
    index("bookmarks_target_user_idx").on(t.targetUserId),
  ],
);

export const profileViews = pgTable(
  "profile_views",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    viewerId: text("viewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("profile_views_unique_idx").on(t.viewerId, t.profileId),
    index("profile_views_profile_id_idx").on(t.profileId),
    index("profile_views_created_at_idx").on(t.createdAt),
  ],
);

export const connectionNotes = pgTable(
  "connection_notes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("connection_notes_unique_idx").on(t.userId, t.targetUserId),
  ],
);

export const endorsements = pgTable(
  "endorsements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    endorserId: text("endorser_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skill: text("skill").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("endorsements_unique_idx").on(t.endorserId, t.targetId, t.skill),
    index("endorsements_target_idx").on(t.targetId),
    index("endorsements_endorser_idx").on(t.endorserId),
  ],
);

export const milestones = pgTable(
  "milestones",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("milestones_user_id_idx").on(t.userId)],
);

// =============================================
// COHORTS / GROUPS
// =============================================

export const cohorts = pgTable(
  "cohorts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    inviteCode: text("invite_code").unique(),
    isPublic: boolean("is_public").default(false).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("cohorts_invite_code_idx").on(t.inviteCode)],
);

export const cohortMembers = pgTable(
  "cohort_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("cohort_members_unique_idx").on(t.cohortId, t.userId),
    index("cohort_members_cohort_id_idx").on(t.cohortId),
    index("cohort_members_user_id_idx").on(t.userId),
  ],
);

// =============================================
// REFERRALS
// =============================================

export const referrals = pgTable(
  "referrals",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredId: text("referred_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rewardGranted: boolean("reward_granted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("referrals_referred_unique_idx").on(t.referredId),
    index("referrals_referrer_id_idx").on(t.referrerId),
  ],
);

// =============================================
// TRUST & SAFETY
// =============================================

export const reportedContent = pgTable(
  "reported_content",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    targetPostId: text("target_post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    type: reportTypeEnum("type").notNull(),
    description: text("description"),
    status: reportStatusEnum("status").default("pending").notNull(),
    resolvedBy: text("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("reported_content_reporter_id_idx").on(t.reporterId),
    index("reported_content_status_idx").on(t.status),
  ],
);

export const blockedUsers = pgTable(
  "blocked_users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("blocked_users_unique_idx").on(t.blockerId, t.blockedId),
    index("blocked_users_blocker_id_idx").on(t.blockerId),
  ],
);

// =============================================
// ADMIN & SYSTEM
// =============================================

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    adminId: text("admin_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("audit_log_admin_id_idx").on(t.adminId),
    index("audit_log_created_at_idx").on(t.createdAt),
  ],
);

export const scheduledContent = pgTable(
  "scheduled_content",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: scheduledContentTypeEnum("type").notNull(),
    contentId: text("content_id").notNull(),
    publishAt: timestamp("publish_at", { withTimezone: true }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("scheduled_content_publish_at_idx").on(t.publishAt),
    index("scheduled_content_processed_idx").on(t.processedAt),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("push_subscriptions_user_id_idx").on(t.userId)],
);

// =============================================
// RELATIONS
// =============================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  initiatedMatches: many(matches, { relationName: "initiator" }),
  receivedMatches: many(matches, { relationName: "target" }),
  sentMessages: many(messages),
  posts: many(posts),
  postComments: many(postComments),
  postReactions: many(postReactions),
  questions: many(questions),
  questionAnswers: many(questionAnswers),
  organizedEvents: many(events),
  eventAttendances: many(eventAttendees),
  notifications: many(notifications),
  bookmarks: many(bookmarks),
  profileViews: many(profileViews, { relationName: "viewer" }),
  receivedProfileViews: many(profileViews, { relationName: "profile" }),
  connectionNotes: many(connectionNotes, { relationName: "noteAuthor" }),
  milestones: many(milestones),
  cohortMemberships: many(cohortMembers),
  referralsMade: many(referrals, { relationName: "referrer" }),
  pushSubscriptions: many(pushSubscriptions),
  endorsementsGiven: many(endorsements, { relationName: "endorser" }),
  endorsementsReceived: many(endorsements, { relationName: "target" }),
}));

export const endorsementsRelations = relations(endorsements, ({ one }) => ({
  endorser: one(users, { fields: [endorsements.endorserId], references: [users.id], relationName: "endorser" }),
  target: one(users, { fields: [endorsements.targetId], references: [users.id], relationName: "target" }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user: one(users, {
    fields: [matches.userId],
    references: [users.id],
    relationName: "initiator",
  }),
  target: one(users, {
    fields: [matches.targetId],
    references: [users.id],
    relationName: "target",
  }),
  messages: many(messages),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  comments: many(postComments),
  reactions: many(postReactions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organiser: one(users, {
    fields: [events.organiserId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
  checkIns: many(eventCheckIns),
}));

export const cohortsRelations = relations(cohorts, ({ many }) => ({
  members: many(cohortMembers),
}));

export const cohortMembersRelations = relations(cohortMembers, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortMembers.cohortId],
    references: [cohorts.id],
  }),
  user: one(users, {
    fields: [cohortMembers.userId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  author: one(users, { fields: [questions.authorId], references: [users.id] }),
  answers: many(questionAnswers),
}));

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => ({
  question: one(questions, { fields: [questionAnswers.questionId], references: [questions.id] }),
  author: one(users, { fields: [questionAnswers.authorId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, { fields: [messages.matchId], references: [matches.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, { fields: [eventAttendees.eventId], references: [events.id] }),
  user: one(users, { fields: [eventAttendees.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  author: one(users, { fields: [postComments.authorId], references: [users.id] }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(posts, { fields: [postReactions.postId], references: [posts.id] }),
  user: one(users, { fields: [postReactions.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  targetUser: one(users, { fields: [bookmarks.targetUserId], references: [users.id], relationName: "bookmarked" }),
  post: one(posts, { fields: [bookmarks.postId], references: [posts.id] }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  viewer: one(users, { fields: [profileViews.viewerId], references: [users.id], relationName: "viewer" }),
  profile: one(users, { fields: [profileViews.profileId], references: [users.id], relationName: "profile" }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  admin: one(users, { fields: [auditLog.adminId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id], relationName: "referrer" }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id], relationName: "referred" }),
}));
