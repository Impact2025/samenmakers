CREATE TYPE "public"."event_attendee_status" AS ENUM('registered', 'waitlisted', 'checked_in', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fase" AS ENUM('starter', 'groei', 'scale');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'matched', 'declined');--> statement-breakpoint
CREATE TYPE "public"."mentorship_role" AS ENUM('mentor', 'mentee', 'both', 'none');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('new_match', 'connection_request', 'new_message', 'event_reminder', 'event_post_suggestion', 'profile_view', 'milestone', 'referral_reward', 'system');--> statement-breakpoint
CREATE TYPE "public"."post_category" AS ENUM('blog', 'kennisbank', 'tool', 'funding');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'members');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('spam', 'harassment', 'inappropriate', 'misinformation', 'other');--> statement-breakpoint
CREATE TYPE "public"."scheduled_content_type" AS ENUM('post', 'event');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('none', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'banned', 'pending_deletion');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" text PRIMARY KEY NOT NULL,
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_user_id" text,
	"post_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohort_members" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"invite_code" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cohorts_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "connection_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_user_id" text NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "event_attendee_status" DEFAULT 'registered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_check_ins" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_in_by" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"organiser_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"location" text,
	"is_online" boolean DEFAULT false NOT NULL,
	"meeting_url" text,
	"cover_image_url" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"max_attendees" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_id" text NOT NULL,
	"status" "match_status" DEFAULT 'pending' NOT NULL,
	"request_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"url" text,
	"avatar_url" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"category" "post_category" NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" text PRIMARY KEY NOT NULL,
	"viewer_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "question_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"is_accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"sector" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_id" text NOT NULL,
	"reward_granted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reported_content" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"target_user_id" text,
	"target_post_id" text,
	"type" "report_type" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_content" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "scheduled_content_type" NOT NULL,
	"content_id" text NOT NULL,
	"publish_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"password" text,
	"naam" text,
	"bio" text,
	"missie" text,
	"ik_zoek" text,
	"sector" text,
	"regio" text,
	"fase" "fase",
	"avatar_url" text,
	"website" text,
	"linkedin" text,
	"expertise" text[] DEFAULT '{}' NOT NULL,
	"mentorship_role" "mentorship_role" DEFAULT 'none' NOT NULL,
	"profile_visibility" "profile_visibility" DEFAULT 'members' NOT NULL,
	"profile_completeness" integer DEFAULT 0 NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"stripe_customer_id" text,
	"subscription_id" text,
	"subscription_status" "subscription_status" DEFAULT 'none' NOT NULL,
	"referral_code" text,
	"referred_by_id" text,
	"weekly_digest_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_notes" ADD CONSTRAINT "connection_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_notes" ADD CONSTRAINT "connection_notes_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_users_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_target_id_users_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_target_post_id_posts_id_fk" FOREIGN KEY ("target_post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_admin_id_idx" ON "audit_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_users_unique_idx" ON "blocked_users" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blocker_id_idx" ON "blocked_users" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_target_user_idx" ON "bookmarks" USING btree ("target_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cohort_members_unique_idx" ON "cohort_members" USING btree ("cohort_id","user_id");--> statement-breakpoint
CREATE INDEX "cohort_members_cohort_id_idx" ON "cohort_members" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "cohort_members_user_id_idx" ON "cohort_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cohorts_invite_code_idx" ON "cohorts" USING btree ("invite_code");--> statement-breakpoint
CREATE UNIQUE INDEX "connection_notes_unique_idx" ON "connection_notes" USING btree ("user_id","target_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_attendees_unique_idx" ON "event_attendees" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_attendees_event_id_idx" ON "event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendees_user_id_idx" ON "event_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_check_ins_unique_idx" ON "event_check_ins" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_check_ins_event_id_idx" ON "event_check_ins" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_organiser_idx" ON "events" USING btree ("organiser_id");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "events_published_idx" ON "events" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_user_target_idx" ON "matches" USING btree ("user_id","target_id");--> statement-breakpoint
CREATE INDEX "matches_user_id_idx" ON "matches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "matches_target_id_idx" ON "matches" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_match_id_idx" ON "messages" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "milestones_user_id_idx" ON "milestones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_reactions_unique_idx" ON "post_reactions" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_reactions_post_id_idx" ON "post_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "posts_published_idx" ON "posts" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_views_unique_idx" ON "profile_views" USING btree ("viewer_id","profile_id");--> statement-breakpoint
CREATE INDEX "profile_views_profile_id_idx" ON "profile_views" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "profile_views_created_at_idx" ON "profile_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "question_answers_question_id_idx" ON "question_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_author_id_idx" ON "questions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "questions_sector_idx" ON "questions" USING btree ("sector");--> statement-breakpoint
CREATE UNIQUE INDEX "referrals_referred_unique_idx" ON "referrals" USING btree ("referred_id");--> statement-breakpoint
CREATE INDEX "referrals_referrer_id_idx" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "reported_content_reporter_id_idx" ON "reported_content" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reported_content_status_idx" ON "reported_content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scheduled_content_publish_at_idx" ON "scheduled_content" USING btree ("publish_at");--> statement-breakpoint
CREATE INDEX "scheduled_content_processed_idx" ON "scheduled_content" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_stripe_customer_idx" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_sector_idx" ON "users" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "users_regio_idx" ON "users" USING btree ("regio");--> statement-breakpoint
CREATE INDEX "users_fase_idx" ON "users" USING btree ("fase");--> statement-breakpoint
CREATE INDEX "users_featured_idx" ON "users" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "users_mentorship_idx" ON "users" USING btree ("mentorship_role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");