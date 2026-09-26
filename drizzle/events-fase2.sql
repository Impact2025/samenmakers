-- Eventsysteem fase 2: tickets en betaling via Stripe (+ Connect) — additief en idempotent.
-- Toepassen (na fase 1): npx tsx --env-file=.env.local scripts/apply-events-migrations.ts

ALTER TYPE event_attendee_status ADD VALUE IF NOT EXISTS 'converted';

CREATE TYPE ticket_kind AS ENUM ('free', 'paid', 'donation');
CREATE TYPE event_order_status AS ENUM ('pending', 'paid', 'free', 'expired', 'cancelled', 'refunded');
CREATE TYPE issued_ticket_status AS ENUM ('valid', 'cancelled', 'refunded');
CREATE TYPE event_form_field_type AS ENUM ('text', 'textarea', 'select', 'checkbox');

ALTER TABLE events ADD COLUMN IF NOT EXISTS refund_until_hours integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_transfer boolean NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur';

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_account_id text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_ready boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS event_tickets (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  kind ticket_kind NOT NULL DEFAULT 'free',
  price_cents integer NOT NULL DEFAULT 0,
  vat_bps integer NOT NULL DEFAULT 2100,
  quantity integer,
  max_per_order integer NOT NULL DEFAULT 10,
  sales_start timestamp with time zone,
  sales_end timestamp with time zone,
  is_hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_tickets_event_idx ON event_tickets (event_id);

CREATE TABLE IF NOT EXISTS event_form_fields (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label text NOT NULL,
  type event_form_field_type NOT NULL DEFAULT 'text',
  required boolean NOT NULL DEFAULT false,
  options text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS event_form_fields_event_idx ON event_form_fields (event_id);

CREATE TABLE IF NOT EXISTS event_orders (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  status event_order_status NOT NULL DEFAULT 'pending',
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  answers jsonb NOT NULL DEFAULT '{}',
  access_token text NOT NULL,
  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_destination text,
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  refunded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_orders_event_status_idx ON event_orders (event_id, status);
CREATE INDEX IF NOT EXISTS event_orders_user_idx ON event_orders (user_id);
CREATE INDEX IF NOT EXISTS event_orders_email_idx ON event_orders (buyer_email);
CREATE UNIQUE INDEX IF NOT EXISTS event_orders_session_idx ON event_orders (stripe_session_id);

CREATE TABLE IF NOT EXISTS event_order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES event_orders(id) ON DELETE CASCADE,
  ticket_id text NOT NULL REFERENCES event_tickets(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price_cents integer NOT NULL
);
CREATE INDEX IF NOT EXISTS event_order_items_order_idx ON event_order_items (order_id);
CREATE INDEX IF NOT EXISTS event_order_items_ticket_idx ON event_order_items (ticket_id);

CREATE TABLE IF NOT EXISTS event_issued_tickets (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES event_orders(id) ON DELETE CASCADE,
  ticket_id text NOT NULL REFERENCES event_tickets(id) ON DELETE RESTRICT,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  holder_name text NOT NULL,
  holder_email text NOT NULL,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  status issued_ticket_status NOT NULL DEFAULT 'valid',
  code text NOT NULL,
  transferred_from_email text,
  checked_in_at timestamp with time zone,
  reminders_sent text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS event_issued_tickets_code_idx ON event_issued_tickets (code);
CREATE INDEX IF NOT EXISTS event_issued_tickets_event_status_idx ON event_issued_tickets (event_id, status);
CREATE INDEX IF NOT EXISTS event_issued_tickets_order_idx ON event_issued_tickets (order_id);
CREATE INDEX IF NOT EXISTS event_issued_tickets_user_idx ON event_issued_tickets (user_id);
CREATE INDEX IF NOT EXISTS event_issued_tickets_email_idx ON event_issued_tickets (holder_email);
