-- Eventsysteem fase 1 (docs/events-plan.md) — additief en idempotent.
-- Toepassen: npx tsx --env-file=.env.local scripts/apply-events-fase1.ts
-- Bestaande rijen blijven geldig: is_published wordt vertaald naar status,
-- is_online naar format. Statements worden op ';' gesplitst, dus geen DO-blokken.

ALTER TYPE event_attendee_status ADD VALUE IF NOT EXISTS 'offered';
ALTER TYPE event_attendee_status ADD VALUE IF NOT EXISTS 'offer_expired';

CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE event_format AS ENUM ('in_person', 'online', 'hybrid');
CREATE TYPE event_visibility AS ENUM ('public', 'members', 'unlisted');

ALTER TABLE events ADD COLUMN IF NOT EXISTS status event_status NOT NULL DEFAULT 'draft';
ALTER TABLE events ADD COLUMN IF NOT EXISTS format event_format NOT NULL DEFAULT 'in_person';
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility event_visibility NOT NULL DEFAULT 'public';
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Amsterdam';
ALTER TABLE events ADD COLUMN IF NOT EXISTS regio text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS thema text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE events ADD COLUMN IF NOT EXISTS waitlist_offer_hours integer NOT NULL DEFAULT 24;
ALTER TABLE events ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Backfill (alleen rijen die nog op de defaults staan)
UPDATE events SET status = 'published', published_at = COALESCE(published_at, created_at)
  WHERE is_published = true AND status = 'draft';
UPDATE events SET format = 'online' WHERE is_online = true AND format = 'in_person';

CREATE INDEX IF NOT EXISTS events_status_start_idx ON events (status, start_at);

ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS offer_expires_at timestamp with time zone;
ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS reminders_sent text[] NOT NULL DEFAULT '{}';
ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS event_attendees_event_status_idx ON event_attendees (event_id, status);
