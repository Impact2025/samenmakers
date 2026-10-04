CREATE TABLE IF NOT EXISTS "job_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"job" text NOT NULL,
	"status" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_runs_job_started_idx" ON "job_runs" USING btree ("job","started_at");
