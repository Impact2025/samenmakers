-- Security/robuustheid (sept 2026). Idempotent: veilig om opnieuw te draaien.
-- Let op: de unieke index faalt als er al dubbele stripe_session_id's in
-- coupon_redemptions staan. Controleer dat vooraf met:
--   SELECT stripe_session_id, count(*) FROM coupon_redemptions
--   WHERE stripe_session_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;

-- Een Stripe-checkoutsessie telt maximaal één keer als coupon-inwisseling.
CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_session_idx
  ON coupon_redemptions (stripe_session_id);

-- Inloggen zoekt hoofdletterongevoelig op e-mail.
CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));
