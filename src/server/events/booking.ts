// Race-vrije aanmeldingen en wachtlijst 2.0.
//
// neon-http kent geen interactieve transacties, wel `db.batch` (één transactie,
// statements na elkaar). Elk batch begint met een advisory lock per event. Onder
// READ COMMITTED krijgt elk volgend statement een verse snapshot, dus na het lock
// zien we alle eerder gecommitte boekingen: tellen en schrijven gebeurt effectief
// serieel per event, zonder aparte tellerkolom die kan afdrijven.
import { sql } from "drizzle-orm";
import type { Database } from "@/server/db";
import { offerExpiry } from "./status";
import { seatsTakenSql } from "./capacity";

function lock(db: Database, eventId: string) {
  return db.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${"event:" + eventId}))`,
  );
}

type Rows<T> = { rows: T[] };
function rowsOf<T>(result: unknown): T[] {
  return ((result as Rows<T>)?.rows ?? []) as T[];
}

export type RegisterOutcome =
  | { status: "registered" | "waitlisted"; created: boolean }
  | { status: "checked_in" | "offered"; created: false }
  | { status: "closed"; created: false };

/**
 * Meld een lid aan. Is er plek (en geen wachtrij), dan "registered", anders
 * "waitlisted". Idempotent: een tweede aanroep geeft de bestaande status terug.
 */
export async function registerAttendee(
  db: Database,
  eventId: string,
  userId: string,
  /** Ticketed events: via deze weg alleen op de wachtlijst; een plek koop je met een ticket. */
  opts: { waitlistOnly?: boolean } = {},
): Promise<RegisterOutcome> {
  const [, inserted, current] = await db.batch([
    lock(db, eventId),
    db.execute(sql`
      INSERT INTO event_attendees (id, event_id, user_id, status, created_at, updated_at)
      SELECT ${crypto.randomUUID()}, e.id, ${userId},
        CASE
          WHEN ${!!opts.waitlistOnly}::boolean THEN 'waitlisted'
          WHEN e.max_attendees IS NULL THEN 'registered'
          WHEN NOT EXISTS (
                 SELECT 1 FROM event_attendees w
                 WHERE w.event_id = e.id AND w.status = 'waitlisted')
               AND ${seatsTakenSql(sql.raw("e.id"))} < e.max_attendees
            THEN 'registered'
          ELSE 'waitlisted'
        END::event_attendee_status,
        now(), now()
      FROM events e
      WHERE e.id = ${eventId} AND e.status = 'published' AND e.start_at > now()
      ON CONFLICT (event_id, user_id) DO UPDATE
        SET status = EXCLUDED.status, created_at = now(), updated_at = now(),
            offer_expires_at = NULL, reminders_sent = '{}'
        WHERE event_attendees.status IN ('cancelled', 'offer_expired')
      RETURNING status
    `),
    db.execute(sql`
      SELECT status FROM event_attendees
      WHERE event_id = ${eventId} AND user_id = ${userId}
    `),
  ]);

  const created = rowsOf<{ status: string }>(inserted)[0];
  if (created) {
    return {
      status: created.status as "registered" | "waitlisted",
      created: true,
    };
  }
  const existing = rowsOf<{ status: string }>(current)[0]?.status;
  if (!existing || existing === "cancelled" || existing === "offer_expired") {
    return { status: "closed", created: false };
  }
  return { status: existing, created: false } as RegisterOutcome;
}

/** Afmelden (ook: een aanbod afslaan). Geeft true als er iets veranderde. */
export async function cancelAttendee(
  db: Database,
  eventId: string,
  userId: string,
): Promise<boolean> {
  const [, updated] = await db.batch([
    lock(db, eventId),
    db.execute(sql`
      UPDATE event_attendees
      SET status = 'cancelled', offer_expires_at = NULL, updated_at = now()
      WHERE event_id = ${eventId} AND user_id = ${userId}
        AND status IN ('registered', 'waitlisted', 'offered')
      RETURNING id
    `),
  ]);
  return rowsOf(updated).length > 0;
}

/** Een openstaand aanbod accepteren. De plek werd al vastgehouden, dus geen lock nodig. */
export async function acceptOffer(
  db: Database,
  eventId: string,
  userId: string,
): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE event_attendees
    SET status = 'registered', offer_expires_at = NULL, updated_at = now()
    WHERE event_id = ${eventId} AND user_id = ${userId}
      AND status = 'offered' AND offer_expires_at > now()
    RETURNING id
  `);
  return rowsOf(result).length > 0;
}

export interface FillResult {
  expired: string[];
  offered: { userId: string; expiresAt: Date }[];
  promoted: string[];
}

/**
 * Laat verlopen aanbiedingen vervallen en biedt vrije plekken aan de wachtlijst aan,
 * in volgorde van aanmelding. Vlak voor de start wordt direct ingeschreven.
 * Aanroepen na elke afmelding, capaciteitswijziging en vanuit de uurlijkse job.
 */
export async function fillOpenSpots(
  db: Database,
  event: { id: string; startAt: Date; waitlistOfferHours: number },
  now: Date = new Date(),
): Promise<FillResult> {
  const expiry = offerExpiry(now, event.startAt, event.waitlistOfferHours);
  const expiryParam = expiry ? expiry.toISOString() : null;

  const [, expiredRes, promotedRes] = await db.batch([
    lock(db, event.id),
    db.execute(sql`
      UPDATE event_attendees
      SET status = 'offer_expired', updated_at = now()
      WHERE event_id = ${event.id} AND status = 'offered' AND offer_expires_at <= now()
      RETURNING user_id
    `),
    db.execute(sql`
      UPDATE event_attendees a
      SET status = CASE WHEN ${expiryParam}::timestamptz IS NULL
                        THEN 'registered' ELSE 'offered' END::event_attendee_status,
          offer_expires_at = ${expiryParam}::timestamptz,
          updated_at = now()
      FROM (
        SELECT w.id
        FROM event_attendees w
        JOIN events e ON e.id = w.event_id
        WHERE w.event_id = ${event.id} AND w.status = 'waitlisted'
          AND e.status = 'published' AND e.start_at > now()
        ORDER BY w.created_at, w.id
        LIMIT (
          SELECT CASE WHEN e2.max_attendees IS NULL THEN NULL
                      ELSE GREATEST(0, e2.max_attendees - ${seatsTakenSql(sql.raw("e2.id"))})
                 END
          FROM events e2 WHERE e2.id = ${event.id}
        )
      ) pick
      WHERE a.id = pick.id
      RETURNING a.user_id, a.status, a.offer_expires_at
    `),
  ]);

  const result: FillResult = { expired: [], offered: [], promoted: [] };
  for (const r of rowsOf<{ user_id: string }>(expiredRes))
    result.expired.push(r.user_id);
  for (const r of rowsOf<{
    user_id: string;
    status: string;
    offer_expires_at: string | Date | null;
  }>(promotedRes)) {
    if (r.status === "offered" && r.offer_expires_at) {
      result.offered.push({
        userId: r.user_id,
        expiresAt: new Date(r.offer_expires_at),
      });
    } else {
      result.promoted.push(r.user_id);
    }
  }
  return result;
}
