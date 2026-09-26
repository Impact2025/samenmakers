// Eén definitie van "bezette plek", gedeeld door boeking, bestellingen en weergave.
// Een event is óf RSVP (event_attendees) óf ticketed (event_issued_tickets); de som
// klopt dus in beide gevallen. Lopende bestellingen houden hun plekken vast tot expires_at.
import { sql, type SQL, type AnyColumn } from "drizzle-orm";

type Ref = SQL | AnyColumn;

export function seatsTakenSql(eventId: Ref): SQL<number> {
  return sql<number>`((
    SELECT count(*) FROM event_attendees sa
    WHERE sa.event_id = ${eventId} AND sa.status IN ('registered','checked_in','offered')
  ) + (
    SELECT count(*) FROM event_issued_tickets st
    WHERE st.event_id = ${eventId} AND st.status = 'valid'
  ) + (
    SELECT COALESCE(sum(si.quantity), 0) FROM event_order_items si
    JOIN event_orders so ON so.id = si.order_id
    WHERE so.event_id = ${eventId} AND so.status = 'pending' AND so.expires_at > now()
  ))::int`;
}

/** Verkocht + gereserveerd per tickettype. */
export function ticketTakenSql(ticketId: Ref): SQL<number> {
  return sql<number>`((
    SELECT count(*) FROM event_issued_tickets tt
    WHERE tt.ticket_id = ${ticketId} AND tt.status = 'valid'
  ) + (
    SELECT COALESCE(sum(ti.quantity), 0) FROM event_order_items ti
    JOIN event_orders tor ON tor.id = ti.order_id
    WHERE ti.ticket_id = ${ticketId} AND tor.status = 'pending' AND tor.expires_at > now()
  ))::int`;
}
