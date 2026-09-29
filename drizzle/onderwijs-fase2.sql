-- Onderwijs fase 2 (Reshape the Future): facilitator-rol, docenttoegang met tijdvenster,
-- sessies, aanwezigheid, opdrachten en inleveringen. Idempotent via apply-events-migrations.ts (slaat "already exists" over).
ALTER TYPE "public"."cohort_role" ADD VALUE IF NOT EXISTS 'facilitator';
CREATE TYPE "public"."attendance_status" AS ENUM('aanwezig', 'afwezig', 'geoorloofd');
CREATE TYPE "public"."submission_status" AS ENUM('ingeleverd', 'beoordeeld');
ALTER TABLE "cohort_members" ADD COLUMN IF NOT EXISTS "access_from" timestamp with time zone;
ALTER TABLE "cohort_members" ADD COLUMN IF NOT EXISTS "access_until" timestamp with time zone;
CREATE TABLE IF NOT EXISTS "cohort_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "cohort_id" text NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "starts_at" timestamp with time zone NOT NULL,
  "location" text,
  "meeting_url" text,
  "teacher_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "homework_due_at" timestamp with time zone,
  "briefing_sent_at" timestamp with time zone,
  "homework_mail_sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "cohort_sessions_cohort_idx" ON "cohort_sessions" ("cohort_id", "starts_at");
CREATE INDEX IF NOT EXISTS "cohort_sessions_teacher_idx" ON "cohort_sessions" ("teacher_id");
CREATE TABLE IF NOT EXISTS "attendance" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL REFERENCES "cohort_sessions"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "attendance_status" NOT NULL,
  "marked_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_unique_idx" ON "attendance" ("session_id", "user_id");
CREATE INDEX IF NOT EXISTS "attendance_user_idx" ON "attendance" ("user_id");
CREATE TABLE IF NOT EXISTS "assignments" (
  "id" text PRIMARY KEY NOT NULL,
  "cohort_id" text NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
  "session_id" text REFERENCES "cohort_sessions"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "due_at" timestamp with time zone,
  "created_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "assignments_cohort_idx" ON "assignments" ("cohort_id");
CREATE INDEX IF NOT EXISTS "assignments_session_idx" ON "assignments" ("session_id");
CREATE TABLE IF NOT EXISTS "submissions" (
  "id" text PRIMARY KEY NOT NULL,
  "assignment_id" text NOT NULL REFERENCES "assignments"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "text" text,
  "status" "submission_status" DEFAULT 'ingeleverd' NOT NULL,
  "is_late" boolean DEFAULT false NOT NULL,
  "feedback" text,
  "reviewed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "reviewed_at" timestamp with time zone,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "submissions_unique_idx" ON "submissions" ("assignment_id", "user_id");
CREATE INDEX IF NOT EXISTS "submissions_user_idx" ON "submissions" ("user_id");
CREATE TABLE IF NOT EXISTS "submission_files" (
  "id" text PRIMARY KEY NOT NULL,
  "submission_id" text NOT NULL REFERENCES "submissions"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "name" text NOT NULL,
  "size_bytes" integer,
  "mime_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "submission_files_submission_idx" ON "submission_files" ("submission_id");
CREATE TABLE IF NOT EXISTS "cohort_materials" (
  "id" text PRIMARY KEY NOT NULL,
  "cohort_id" text NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
  "session_id" text REFERENCES "cohort_sessions"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "url" text NOT NULL,
  "file_name" text NOT NULL,
  "mime_type" text,
  "size_bytes" integer,
  "uploaded_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "cohort_materials_cohort_idx" ON "cohort_materials" ("cohort_id");
CREATE INDEX IF NOT EXISTS "cohort_materials_session_idx" ON "cohort_materials" ("session_id");
CREATE TYPE "public"."feed_post_kind" AS ENUM('hulpvraag', 'aanbod');
CREATE TABLE IF NOT EXISTS "feed_posts" (
  "id" text PRIMARY KEY NOT NULL,
  "cohort_id" text REFERENCES "cohorts"("id") ON DELETE CASCADE,
  "author_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "kind" "feed_post_kind" NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "feed_posts_cohort_idx" ON "feed_posts" ("cohort_id", "created_at");
CREATE TABLE IF NOT EXISTS "login_events" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "login_events_created_at_idx" ON "login_events" ("created_at");
CREATE INDEX IF NOT EXISTS "login_events_user_idx" ON "login_events" ("user_id");
