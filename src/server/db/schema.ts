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
  check,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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
  "offered", // wachtlijst 2.0: plek aangeboden, houdt de plek vast tot offerExpiresAt
  "offer_expired",
  "converted", // ticketed event: aanbod omgezet in een gekocht ticket (telt niet meer mee)
]);

export const ticketKindEnum = pgEnum("ticket_kind", [
  "free",
  "paid",
  "donation", // "betaal wat je kunt", priceCents is het minimum
]);

export const eventOrderStatusEnum = pgEnum("event_order_status", [
  "pending", // plekken gereserveerd tot expiresAt, wacht op betaling
  "paid",
  "free",
  "expired",
  "cancelled",
  "refunded",
]);

export const issuedTicketStatusEnum = pgEnum("issued_ticket_status", [
  "valid",
  "cancelled",
  "refunded",
]);

export const formFieldTypeEnum = pgEnum("event_form_field_type", [
  "text",
  "textarea",
  "select",
  "checkbox",
]);

// Opgeslagen status; "uitverkocht", "gaande" en "afgelopen" worden afgeleid
// uit tijd en bezetting (zie src/server/events/status.ts).
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
]);

export const eventFormatEnum = pgEnum("event_format", [
  "in_person",
  "online",
  "hybrid",
]);

export const eventVisibilityEnum = pgEnum("event_visibility", [
  "public", // publiek, geïndexeerd
  "members", // alleen ingelogde leden
  "unlisted", // alleen via link, niet in overzicht of sitemap
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

export const couponDiscountTypeEnum = pgEnum("coupon_discount_type", [
  "percent",
  "amount",
]);

export const couponDurationEnum = pgEnum("coupon_duration", [
  "once",
  "repeating",
  "forever",
]);

export const crmStageEnum = pgEnum("crm_stage", [
  "lead",
  "engaged",
  "customer",
  "churned",
]);

export const crmActivityTypeEnum = pgEnum("crm_activity_type", [
  "note",
  "email",
  "stage_change",
  "tag",
  "system",
]);

export const emailCampaignStatusEnum = pgEnum("email_campaign_status", [
  "draft",
  "sending",
  "sent",
  "failed",
]);

export const emailRecipientStatusEnum = pgEnum("email_recipient_status", [
  "pending",
  "sent",
  "failed",
]);

// Leeromgeving
export const programStatusEnum = pgEnum("program_status", [
  "concept",
  "gepubliceerd",
  "gearchiveerd",
]);

export const admissionModeEnum = pgEnum("admission_mode", [
  "open",
  "uitnodiging",
  "aanmelding",
]);

export const cohortStatusEnum = pgEnum("cohort_status", [
  "concept",
  "open",
  "lopend",
  "afgerond",
]);

export const cohortRoleEnum = pgEnum("cohort_role", [
  "cursist",
  "docent",
  "manager",
  "alumnus",
  "facilitator",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "aanwezig",
  "afwezig",
  "geoorloofd",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "ingeleverd",
  "beoordeeld",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "actief",
  "gepauzeerd",
  "afgerond",
  "uitgeschreven",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
  "tekst",
  "video",
  "bestand",
  "reflectie",
  "live",
]);

export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "bezig",
  "klaar",
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
    // Stripe Connect (Express) voor doorbetaling van ticketverkoop
    stripeConnectAccountId: text("stripe_connect_account_id").unique(),
    stripeConnectReady: boolean("stripe_connect_ready")
      .default(false)
      .notNull(),

    // Referral
    referralCode: text("referral_code").unique(),
    referredById: text("referred_by_id"),

    // Preferences
    weeklyDigestEnabled: boolean("weekly_digest_enabled")
      .default(true)
      .notNull(),

    // CRM
    crmStage: crmStageEnum("crm_stage").default("lead").notNull(),
    crmTags: text("crm_tags").array().default([]).notNull(),
    crmLastContactedAt: timestamp("crm_last_contacted_at", {
      withTimezone: true,
    }),

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
    index("users_crm_stage_idx").on(t.crmStage),
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

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    focusKeyword: text("focus_keyword"),
    keywords: text("keywords").array().default([]).notNull(),
    canonicalUrl: text("canonical_url"),
    ogImageUrl: text("og_image_url"),
    seoScore: integer("seo_score").default(0).notNull(),
    readingTime: integer("reading_time").default(0).notNull(),
    aiGenerated: boolean("ai_generated").default(false).notNull(),

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
    // Legacy vlag, synchroon gehouden met status === "published".
    isPublished: boolean("is_published").default(false).notNull(),
    status: eventStatusEnum("status").default("draft").notNull(),
    format: eventFormatEnum("format").default("in_person").notNull(),
    visibility: eventVisibilityEnum("visibility").default("public").notNull(),
    timezone: text("timezone").default("Europe/Amsterdam").notNull(),
    regio: text("regio"),
    thema: text("thema"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    waitlistOfferHours: integer("waitlist_offer_hours").default(24).notNull(),
    // Tickets (fase 2). Terugbetalen kan tot zoveel uur voor de start; null = niet.
    refundUntilHours: integer("refund_until_hours"),
    allowTransfer: boolean("allow_transfer").default(true).notNull(),
    currency: text("currency").default("eur").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("events_slug_idx").on(t.slug),
    index("events_organiser_idx").on(t.organiserId),
    index("events_start_at_idx").on(t.startAt),
    index("events_published_idx").on(t.isPublished),
    index("events_status_start_idx").on(t.status, t.startAt),
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
    offerExpiresAt: timestamp("offer_expires_at", { withTimezone: true }),
    // Verstuurde herinneringen ("7d", "1d", "1h") — maakt de job idempotent.
    remindersSent: text("reminders_sent").array().default([]).notNull(),
    // createdAt is ook de wachtlijstvolgorde; bij heraanmelden wordt hij gereset.
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("event_attendees_unique_idx").on(t.eventId, t.userId),
    index("event_attendees_event_status_idx").on(t.eventId, t.status),
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

// ── Tickets en betaling (events-plan fase 2) ──────────────────────────────────
// Een event met minstens één tickettype is "ticketed": aanmelden gaat dan via een
// bestelling en uitgegeven tickets i.p.v. via event_attendees.

export const eventTickets = pgTable(
  "event_tickets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    kind: ticketKindEnum("kind").default("free").notNull(),
    /** Incl. btw, in centen. Bij donation het minimum. */
    priceCents: integer("price_cents").default(0).notNull(),
    /** Btw in basispunten (900 = 9%, 2100 = 21%) — voor rapportage/facturen. */
    vatBps: integer("vat_bps").default(2100).notNull(),
    /** Aantal beschikbaar voor dit type; null = alleen de eventcapaciteit geldt. */
    quantity: integer("quantity"),
    maxPerOrder: integer("max_per_order").default(10).notNull(),
    salesStart: timestamp("sales_start", { withTimezone: true }),
    salesEnd: timestamp("sales_end", { withTimezone: true }),
    isHidden: boolean("is_hidden").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("event_tickets_event_idx").on(t.eventId)],
);

export const eventFormFields = pgTable(
  "event_form_fields",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    type: formFieldTypeEnum("type").default("text").notNull(),
    required: boolean("required").default(false).notNull(),
    options: text("options").array().default([]).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [index("event_form_fields_event_idx").on(t.eventId)],
);

export const eventOrders = pgTable(
  "event_orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    buyerName: text("buyer_name").notNull(),
    buyerEmail: text("buyer_email").notNull(),
    status: eventOrderStatusEnum("status").default("pending").notNull(),
    subtotalCents: integer("subtotal_cents").default(0).notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    totalCents: integer("total_cents").default(0).notNull(),
    platformFeeCents: integer("platform_fee_cents").default(0).notNull(),
    currency: text("currency").default("eur").notNull(),
    /** Aanmeldvragen: { [fieldId]: waarde } */
    answers: jsonb("answers")
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    /** Geheim voor gasten om bestelling/tickets te openen zonder account. */
    accessToken: text("access_token").notNull(),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** Connect-account waarnaar is doorbetaald (null = platform int zelf). */
    stripeDestination: text("stripe_destination"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("event_orders_event_status_idx").on(t.eventId, t.status),
    index("event_orders_user_idx").on(t.userId),
    index("event_orders_email_idx").on(t.buyerEmail),
    uniqueIndex("event_orders_session_idx").on(t.stripeSessionId),
  ],
);

export const eventOrderItems = pgTable(
  "event_order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => eventOrders.id, { onDelete: "cascade" }),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => eventTickets.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
  },
  (t) => [
    index("event_order_items_order_idx").on(t.orderId),
    index("event_order_items_ticket_idx").on(t.ticketId),
  ],
);

export const eventIssuedTickets = pgTable(
  "event_issued_tickets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => eventOrders.id, { onDelete: "cascade" }),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => eventTickets.id, { onDelete: "restrict" }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    holderName: text("holder_name").notNull(),
    holderEmail: text("holder_email").notNull(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: issuedTicketStatusEnum("status").default("valid").notNull(),
    /** Geheime code: ticketlink en (fase 4) QR. */
    code: text("code").notNull(),
    transferredFromEmail: text("transferred_from_email"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    remindersSent: text("reminders_sent").array().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("event_issued_tickets_code_idx").on(t.code),
    index("event_issued_tickets_event_status_idx").on(t.eventId, t.status),
    index("event_issued_tickets_order_idx").on(t.orderId),
    index("event_issued_tickets_user_idx").on(t.userId),
    index("event_issued_tickets_email_idx").on(t.holderEmail),
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
    // A bookmark must point at either a user or a post — never neither.
    check(
      "bookmarks_target_present",
      sql`${t.targetUserId} IS NOT NULL OR ${t.postId} IS NOT NULL`,
    ),
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
    uniqueIndex("endorsements_unique_idx").on(
      t.endorserId,
      t.targetId,
      t.skill,
    ),
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

    // Leeromgeving: a cohort with a programId is an edition of that program.
    programId: text("program_id").references(() => programs.id, {
      onDelete: "cascade",
    }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    capacity: integer("capacity"),
    status: cohortStatusEnum("status").default("concept").notNull(),
    completionRules: jsonb("completion_rules").$type<CompletionRules>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("cohorts_invite_code_idx").on(t.inviteCode),
    index("cohorts_program_id_idx").on(t.programId),
  ],
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
    // Roles live on the membership, not the account: a user can teach one
    // edition and follow another.
    role: cohortRoleEnum("role").default("cursist").notNull(),
    status: enrollmentStatusEnum("status").default("actief").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Tijdelijke toegang (docenten): null = onbegrensd.
    accessFrom: timestamp("access_from", { withTimezone: true }),
    accessUntil: timestamp("access_until", { withTimezone: true }),
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
// LEEROMGEVING — PROGRAMS, MODULES, LESSONS
// =============================================

export type CompletionRules = {
  /** Percentage (0–100) of required lessons that must be completed. */
  minLessonPercent?: number;
};

export type LessonContent = {
  /** Markdown body (all types). */
  body?: string;
  /** YouTube/Vimeo URL for video lessons. */
  videoUrl?: string;
  /** Download for file lessons. */
  fileUrl?: string;
  fileName?: string;
  /** Question for reflection lessons. */
  prompt?: string;
  /** Live session details. */
  meetingUrl?: string;
  startsAt?: string;
};

export const programs = pgTable(
  "programs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    color: text("color").default("#2d6a4f").notNull(),
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    status: programStatusEnum("status").default("concept").notNull(),
    // Price in cents; null = included in Pro.
    priceCents: integer("price_cents"),
    admissionMode: admissionModeEnum("admission_mode")
      .default("uitnodiging")
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("programs_slug_idx").on(t.slug),
    index("programs_status_idx").on(t.status),
  ],
);

export const modules = pgTable(
  "modules",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    programId: text("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    position: integer("position").default(0).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    // Days relative to the edition's start date, so a copied edition
    // shifts its schedule automatically.
    startOffsetDays: integer("start_offset_days"),
    endOffsetDays: integer("end_offset_days"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("modules_program_position_idx").on(t.programId, t.position)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    position: integer("position").default(0).notNull(),
    type: lessonTypeEnum("type").default("tekst").notNull(),
    title: text("title").notNull(),
    content: jsonb("content").$type<LessonContent>().default({}).notNull(),
    durationMinutes: integer("duration_minutes"),
    isRequired: boolean("is_required").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("lessons_module_position_idx").on(t.moduleId, t.position)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    status: lessonProgressStatusEnum("status").default("bezig").notNull(),
    note: text("note"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("lesson_progress_unique_idx").on(
      t.userId,
      t.lessonId,
      t.cohortId,
    ),
    index("lesson_progress_cohort_idx").on(t.cohortId),
    index("lesson_progress_user_idx").on(t.userId),
  ],
);

// =============================================
// LEEROMGEVING — SESSIES, AANWEZIGHEID, OPDRACHTEN
// =============================================

// Een programmadag van een editie. De cyclus (briefing, huiswerkmail, deadline,
// docenttoegang) volgt uit startsAt, zie src/lib/session-cycle.ts.
export const cohortSessions = pgTable(
  "cohort_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    location: text("location"),
    meetingUrl: text("meeting_url"),
    teacherId: text("teacher_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // Deadline voor huiswerk; standaard 3 dagen voor startsAt (ingevuld bij aanmaken).
    homeworkDueAt: timestamp("homework_due_at", { withTimezone: true }),
    briefingSentAt: timestamp("briefing_sent_at", { withTimezone: true }),
    homeworkMailSentAt: timestamp("homework_mail_sent_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("cohort_sessions_cohort_idx").on(t.cohortId, t.startsAt),
    index("cohort_sessions_teacher_idx").on(t.teacherId),
  ],
);

export const attendance = pgTable(
  "attendance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionId: text("session_id")
      .notNull()
      .references(() => cohortSessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    markedBy: text("marked_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("attendance_unique_idx").on(t.sessionId, t.userId),
    index("attendance_user_idx").on(t.userId),
  ],
);

export const assignments = pgTable(
  "assignments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => cohortSessions.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    // Leeg = deadline van de gekoppelde sessie.
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("assignments_cohort_idx").on(t.cohortId),
    index("assignments_session_idx").on(t.sessionId),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text"),
    status: submissionStatusEnum("status").default("ingeleverd").notNull(),
    isLate: boolean("is_late").default(false).notNull(),
    feedback: text("feedback"),
    reviewedBy: text("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("submissions_unique_idx").on(t.assignmentId, t.userId),
    index("submissions_user_idx").on(t.userId),
  ],
);

export const submissionFiles = pgTable(
  "submission_files",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    name: text("name").notNull(),
    sizeBytes: integer("size_bytes"),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("submission_files_submission_idx").on(t.submissionId)],
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

// =============================================
// CRM
// =============================================

export const crmActivities = pgTable(
  "crm_activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // The contact (platform user) this activity is about.
    contactId: text("contact_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The admin who logged it (null for system-generated).
    adminId: text("admin_id").references(() => users.id),
    type: crmActivityTypeEnum("type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("crm_activities_contact_id_idx").on(t.contactId),
    index("crm_activities_created_at_idx").on(t.createdAt),
  ],
);

export const emailCampaigns = pgTable(
  "email_campaigns",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subject: text("subject").notNull(),
    // Markdown body; rendered to HTML at send time.
    body: text("body").notNull(),
    // Serialised segment filter (JSON).
    segment: text("segment"),
    status: emailCampaignStatusEnum("status").default("draft").notNull(),
    recipientCount: integer("recipient_count").default(0).notNull(),
    sentCount: integer("sent_count").default(0).notNull(),
    failedCount: integer("failed_count").default(0).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [
    index("email_campaigns_status_idx").on(t.status),
    index("email_campaigns_created_at_idx").on(t.createdAt),
  ],
);

export const emailCampaignRecipients = pgTable(
  "email_campaign_recipients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => emailCampaigns.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    status: emailRecipientStatusEnum("status").default("pending").notNull(),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [
    index("email_recipients_campaign_id_idx").on(t.campaignId),
    index("email_recipients_status_idx").on(t.status),
  ],
);

// =============================================
// COUPONS (mirror of Stripe coupons/promotion codes)
// =============================================

export const coupons = pgTable(
  "coupons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    stripeCouponId: text("stripe_coupon_id"),
    stripePromotionCodeId: text("stripe_promotion_code_id"),
    description: text("description"),
    discountType: couponDiscountTypeEnum("discount_type").notNull(),
    // percent → 1–100, amount → cents
    discountValue: integer("discount_value").notNull(),
    currency: text("currency").default("eur").notNull(),
    duration: couponDurationEnum("duration").default("once").notNull(),
    durationInMonths: integer("duration_in_months"),
    maxRedemptions: integer("max_redemptions"),
    timesRedeemed: integer("times_redeemed").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("coupons_code_idx").on(t.code),
    index("coupons_active_idx").on(t.active),
  ],
);

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeSessionId: text("stripe_session_id"),
    amountDiscounted: integer("amount_discounted"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("coupon_redemptions_coupon_id_idx").on(t.couponId),
    index("coupon_redemptions_user_id_idx").on(t.userId),
    uniqueIndex("coupon_redemptions_session_idx").on(t.stripeSessionId),
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
  endorser: one(users, {
    fields: [endorsements.endorserId],
    references: [users.id],
    relationName: "endorser",
  }),
  target: one(users, {
    fields: [endorsements.targetId],
    references: [users.id],
    relationName: "target",
  }),
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
  tickets: many(eventTickets),
  formFields: many(eventFormFields),
  orders: many(eventOrders),
}));

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  event: one(events, {
    fields: [eventTickets.eventId],
    references: [events.id],
  }),
}));

export const eventFormFieldsRelations = relations(
  eventFormFields,
  ({ one }) => ({
    event: one(events, {
      fields: [eventFormFields.eventId],
      references: [events.id],
    }),
  }),
);

export const eventOrdersRelations = relations(eventOrders, ({ one, many }) => ({
  event: one(events, {
    fields: [eventOrders.eventId],
    references: [events.id],
  }),
  user: one(users, { fields: [eventOrders.userId], references: [users.id] }),
  items: many(eventOrderItems),
  issued: many(eventIssuedTickets),
}));

export const eventOrderItemsRelations = relations(
  eventOrderItems,
  ({ one }) => ({
    order: one(eventOrders, {
      fields: [eventOrderItems.orderId],
      references: [eventOrders.id],
    }),
    ticket: one(eventTickets, {
      fields: [eventOrderItems.ticketId],
      references: [eventTickets.id],
    }),
  }),
);

export const eventIssuedTicketsRelations = relations(
  eventIssuedTickets,
  ({ one }) => ({
    order: one(eventOrders, {
      fields: [eventIssuedTickets.orderId],
      references: [eventOrders.id],
    }),
    ticket: one(eventTickets, {
      fields: [eventIssuedTickets.ticketId],
      references: [eventTickets.id],
    }),
    event: one(events, {
      fields: [eventIssuedTickets.eventId],
      references: [events.id],
    }),
  }),
);

export const cohortSessionsRelations = relations(cohortSessions, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortSessions.cohortId],
    references: [cohorts.id],
  }),
  teacher: one(users, {
    fields: [cohortSessions.teacherId],
    references: [users.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  session: one(cohortSessions, {
    fields: [assignments.sessionId],
    references: [cohortSessions.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  files: many(submissionFiles),
}));

export const submissionFilesRelations = relations(
  submissionFiles,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [submissionFiles.submissionId],
      references: [submissions.id],
    }),
  }),
);

export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
  members: many(cohortMembers),
  program: one(programs, {
    fields: [cohorts.programId],
    references: [programs.id],
  }),
}));

export const programsRelations = relations(programs, ({ many }) => ({
  modules: many(modules),
  cohorts: many(cohorts),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  program: one(programs, {
    fields: [modules.programId],
    references: [programs.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  cohort: one(cohorts, {
    fields: [lessonProgress.cohortId],
    references: [cohorts.id],
  }),
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

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionAnswers.questionId],
      references: [questions.id],
    }),
    author: one(users, {
      fields: [questionAnswers.authorId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, { fields: [messages.matchId], references: [matches.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, { fields: [eventAttendees.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  author: one(users, {
    fields: [postComments.authorId],
    references: [users.id],
  }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(posts, { fields: [postReactions.postId], references: [posts.id] }),
  user: one(users, { fields: [postReactions.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  targetUser: one(users, {
    fields: [bookmarks.targetUserId],
    references: [users.id],
    relationName: "bookmarked",
  }),
  post: one(posts, { fields: [bookmarks.postId], references: [posts.id] }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  viewer: one(users, {
    fields: [profileViews.viewerId],
    references: [users.id],
    relationName: "viewer",
  }),
  profile: one(users, {
    fields: [profileViews.profileId],
    references: [users.id],
    relationName: "profile",
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  admin: one(users, { fields: [auditLog.adminId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  redemptions: many(couponRedemptions),
}));

export const couponRedemptionsRelations = relations(
  couponRedemptions,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponRedemptions.couponId],
      references: [coupons.id],
    }),
    user: one(users, {
      fields: [couponRedemptions.userId],
      references: [users.id],
    }),
  }),
);

export const crmActivitiesRelations = relations(crmActivities, ({ one }) => ({
  contact: one(users, {
    fields: [crmActivities.contactId],
    references: [users.id],
    relationName: "crmContact",
  }),
  admin: one(users, {
    fields: [crmActivities.adminId],
    references: [users.id],
    relationName: "crmAdmin",
  }),
}));

export const emailCampaignsRelations = relations(
  emailCampaigns,
  ({ many }) => ({
    recipients: many(emailCampaignRecipients),
  }),
);

export const emailCampaignRecipientsRelations = relations(
  emailCampaignRecipients,
  ({ one }) => ({
    campaign: one(emailCampaigns, {
      fields: [emailCampaignRecipients.campaignId],
      references: [emailCampaigns.id],
    }),
  }),
);
