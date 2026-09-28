CREATE TYPE "public"."admission_mode" AS ENUM('open', 'uitnodiging', 'aanmelding');--> statement-breakpoint
CREATE TYPE "public"."cohort_role" AS ENUM('cursist', 'docent', 'manager', 'alumnus');--> statement-breakpoint
CREATE TYPE "public"."cohort_status" AS ENUM('concept', 'open', 'lopend', 'afgerond');--> statement-breakpoint
CREATE TYPE "public"."coupon_discount_type" AS ENUM('percent', 'amount');--> statement-breakpoint
CREATE TYPE "public"."coupon_duration" AS ENUM('once', 'repeating', 'forever');--> statement-breakpoint
CREATE TYPE "public"."crm_activity_type" AS ENUM('note', 'email', 'stage_change', 'tag', 'system');--> statement-breakpoint
CREATE TYPE "public"."crm_stage" AS ENUM('lead', 'engaged', 'customer', 'churned');--> statement-breakpoint
CREATE TYPE "public"."email_campaign_status" AS ENUM('draft', 'sending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_recipient_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('actief', 'gepauzeerd', 'afgerond', 'uitgeschreven');--> statement-breakpoint
CREATE TYPE "public"."event_format" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."event_order_status" AS ENUM('pending', 'paid', 'free', 'expired', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'members', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."event_form_field_type" AS ENUM('text', 'textarea', 'select', 'checkbox');--> statement-breakpoint
CREATE TYPE "public"."issued_ticket_status" AS ENUM('valid', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."lesson_progress_status" AS ENUM('bezig', 'klaar');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('tekst', 'video', 'bestand', 'reflectie', 'live');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('concept', 'gepubliceerd', 'gearchiveerd');--> statement-breakpoint
CREATE TYPE "public"."ticket_kind" AS ENUM('free', 'paid', 'donation');--> statement-breakpoint
ALTER TYPE "public"."event_attendee_status" ADD VALUE 'offered';--> statement-breakpoint
ALTER TYPE "public"."event_attendee_status" ADD VALUE 'offer_expired';--> statement-breakpoint
ALTER TYPE "public"."event_attendee_status" ADD VALUE 'converted';--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"user_id" text NOT NULL,
	"stripe_session_id" text,
	"amount_discounted" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"stripe_coupon_id" text,
	"stripe_promotion_code_id" text,
	"description" text,
	"discount_type" "coupon_discount_type" NOT NULL,
	"discount_value" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"duration" "coupon_duration" DEFAULT 'once' NOT NULL,
	"duration_in_months" integer,
	"max_redemptions" integer,
	"times_redeemed" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"admin_id" text,
	"type" "crm_activity_type" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaign_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"status" "email_recipient_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"segment" text,
	"status" "email_campaign_status" DEFAULT 'draft' NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "endorsements" (
	"id" text PRIMARY KEY NOT NULL,
	"endorser_id" text NOT NULL,
	"target_id" text NOT NULL,
	"skill" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_form_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"label" text NOT NULL,
	"type" "event_form_field_type" DEFAULT 'text' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_issued_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"event_id" text NOT NULL,
	"holder_name" text NOT NULL,
	"holder_email" text NOT NULL,
	"user_id" text,
	"status" "issued_ticket_status" DEFAULT 'valid' NOT NULL,
	"code" text NOT NULL,
	"transferred_from_email" text,
	"checked_in_at" timestamp with time zone,
	"reminders_sent" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text,
	"buyer_name" text NOT NULL,
	"buyer_email" text NOT NULL,
	"status" "event_order_status" DEFAULT 'pending' NOT NULL,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"platform_fee_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"access_token" text NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_destination" text,
	"expires_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"kind" "ticket_kind" DEFAULT 'free' NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"vat_bps" integer DEFAULT 2100 NOT NULL,
	"quantity" integer,
	"max_per_order" integer DEFAULT 10 NOT NULL,
	"sales_start" timestamp with time zone,
	"sales_end" timestamp with time zone,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"cohort_id" text NOT NULL,
	"status" "lesson_progress_status" DEFAULT 'bezig' NOT NULL,
	"note" text,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"type" "lesson_type" DEFAULT 'tekst' NOT NULL,
	"title" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration_minutes" integer,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_offset_days" integer,
	"end_offset_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"color" text DEFAULT '#2d6a4f' NOT NULL,
	"logo_url" text,
	"cover_image_url" text,
	"status" "program_status" DEFAULT 'concept' NOT NULL,
	"price_cents" integer,
	"admission_mode" "admission_mode" DEFAULT 'uitnodiging' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cohort_members" ADD COLUMN "role" "cohort_role" DEFAULT 'cursist' NOT NULL;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD COLUMN "status" "enrollment_status" DEFAULT 'actief' NOT NULL;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "program_id" text;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "status" "cohort_status" DEFAULT 'concept' NOT NULL;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "completion_rules" jsonb;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "offer_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "reminders_sent" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" "event_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "format" "event_format" DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "visibility" "event_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "timezone" text DEFAULT 'Europe/Amsterdam' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "regio" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "thema" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "waitlist_offer_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "refund_until_hours" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allow_transfer" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "currency" text DEFAULT 'eur' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "focus_keyword" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "keywords" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "og_image_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "reading_time" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "zoekt_naar" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_account_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_ready" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crm_stage" "crm_stage" DEFAULT 'lead' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crm_tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crm_last_contacted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_endorser_id_users_id_fk" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_target_id_users_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_form_fields" ADD CONSTRAINT "event_form_fields_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_issued_tickets" ADD CONSTRAINT "event_issued_tickets_order_id_event_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."event_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_issued_tickets" ADD CONSTRAINT "event_issued_tickets_ticket_id_event_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."event_tickets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_issued_tickets" ADD CONSTRAINT "event_issued_tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_issued_tickets" ADD CONSTRAINT "event_issued_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_order_items" ADD CONSTRAINT "event_order_items_order_id_event_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."event_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_order_items" ADD CONSTRAINT "event_order_items_ticket_id_event_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."event_tickets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_orders" ADD CONSTRAINT "event_orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_orders" ADD CONSTRAINT "event_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_session_idx" ON "coupon_redemptions" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_active_idx" ON "coupons" USING btree ("active");--> statement-breakpoint
CREATE INDEX "crm_activities_contact_id_idx" ON "crm_activities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "crm_activities_created_at_idx" ON "crm_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_recipients_campaign_id_idx" ON "email_campaign_recipients" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "email_recipients_status_idx" ON "email_campaign_recipients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_campaigns_status_idx" ON "email_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_campaigns_created_at_idx" ON "email_campaigns" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "endorsements_unique_idx" ON "endorsements" USING btree ("endorser_id","target_id","skill");--> statement-breakpoint
CREATE INDEX "endorsements_target_idx" ON "endorsements" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "endorsements_endorser_idx" ON "endorsements" USING btree ("endorser_id");--> statement-breakpoint
CREATE INDEX "event_form_fields_event_idx" ON "event_form_fields" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_issued_tickets_code_idx" ON "event_issued_tickets" USING btree ("code");--> statement-breakpoint
CREATE INDEX "event_issued_tickets_event_status_idx" ON "event_issued_tickets" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "event_issued_tickets_order_idx" ON "event_issued_tickets" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "event_issued_tickets_user_idx" ON "event_issued_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_issued_tickets_email_idx" ON "event_issued_tickets" USING btree ("holder_email");--> statement-breakpoint
CREATE INDEX "event_order_items_order_idx" ON "event_order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "event_order_items_ticket_idx" ON "event_order_items" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "event_orders_event_status_idx" ON "event_orders" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "event_orders_user_idx" ON "event_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_orders_email_idx" ON "event_orders" USING btree ("buyer_email");--> statement-breakpoint
CREATE UNIQUE INDEX "event_orders_session_idx" ON "event_orders" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "event_tickets_event_idx" ON "event_tickets" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_unique_idx" ON "lesson_progress" USING btree ("user_id","lesson_id","cohort_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_cohort_idx" ON "lesson_progress" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_user_idx" ON "lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lessons_module_position_idx" ON "lessons" USING btree ("module_id","position");--> statement-breakpoint
CREATE INDEX "modules_program_position_idx" ON "modules" USING btree ("program_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "programs_status_idx" ON "programs" USING btree ("status");--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cohorts_program_id_idx" ON "cohorts" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "event_attendees_event_status_idx" ON "event_attendees" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "events_status_start_idx" ON "events" USING btree ("status","start_at");--> statement-breakpoint
CREATE INDEX "users_crm_stage_idx" ON "users" USING btree ("crm_stage");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_connect_account_id_unique" UNIQUE("stripe_connect_account_id");--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_target_present" CHECK ("bookmarks"."target_user_id" IS NOT NULL OR "bookmarks"."post_id" IS NOT NULL);