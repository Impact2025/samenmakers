// Ticketbestellingen: reserveren → (Stripe Checkout) → afronden → tickets uitgeven.
//
// Reserveren gebeurt net als RSVP in één db.batch met een advisory lock per event.
// Past de bestelling niet meer, dan faalt de batch bewust (deling door nul) zodat ook
// een eerder statement in dezelfde batch (omzetten van een wachtlijstaanbod) terugrolt.
import { randomBytes } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import type Stripe from "stripe";
import type { Database } from "@/server/db";
import {
  eventIssuedTickets,
  eventOrders,
  events,
  users,
} from "@/server/db/schema";
import { getStripe } from "@/server/stripe";
import { sendEventEmail } from "@/lib/email";
import { eventWhere, formatEventWhen } from "@/lib/event-format";
import { seatsTakenSql, ticketTakenSql } from "./capacity";
import {
  eventIcs,
  eventUrl,
  notifyFillResult,
  type NotifiableEvent,
} from "./notify";
import { fillOpenSpots } from "./booking";
import { formatEuro, type PricedLine } from "./pricing";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";
/** Stripe Checkout verloopt minimaal na 30 minuten; de reservering net iets later. */
export const CHECKOUT_TTL_MS = 30 * 60 * 1000;
const RESERVATION_TTL_MS = CHECKOUT_TTL_MS + 2 * 60 * 1000;

export class SoldOutError extends Error {
  constructor() {
    super("Er zijn niet genoeg plekken meer vrij voor deze bestelling");
  }
}

function lock(db: Database, eventId: string) {
  return db.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${"event:" + eventId}))`,
  );
}

function rowsOf<T>(result: unknown): T[] {
  return ((result as { rows?: T[] })?.rows ?? []) as T[];
}

export function newSecret(bytes = 18): string {
  return randomBytes(bytes).toString("base64url");
}

export interface ReserveInput {
  eventId: string;
  lines: PricedLine[];
  buyerName: string;
  buyerEmail: string;
  userId: string | null;
  answers: Record<string, string>;
  platformFeeCents: number;
  destination: string | null;
  currency: string;
}

export async function reserveOrder(db: Database, input: ReserveInput) {
  const orderId = crypto.randomUUID();
  const accessToken = newSecret();
  const subtotal = input.lines.reduce(
    (s, l) => s + l.quantity * l.unitPriceCents,
    0,
  );
  const quantity = input.lines.reduce((s, l) => s + l.quantity, 0);
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS).toISOString();

  const perTicket = input.lines.map(
    (l) => sql`EXISTS (
      SELECT 1 FROM event_tickets t
      WHERE t.id = ${l.ticket.id} AND t.event_id = e.id
        AND (t.quantity IS NULL OR ${ticketTakenSql(sql.raw("t.id"))} + ${l.quantity}::int <= t.quantity)
    )`,
  );
  const itemValues = input.lines.map(
    (l) =>
      sql`(${crypto.randomUUID()}, ${orderId}, ${l.ticket.id}, ${l.quantity}::int, ${l.unitPriceCents}::int)`,
  );

  try {
    await db.batch([
      lock(db, input.eventId),
      // Een openstaand wachtlijstaanbod van deze koper gaat over in de reservering.
      db.execute(sql`
        UPDATE event_attendees SET status = 'converted', updated_at = now()
        WHERE event_id = ${input.eventId} AND user_id = ${input.userId}
          AND status = 'offered' AND offer_expires_at > now()
      `),
      db.execute(sql`
        INSERT INTO event_orders (id, event_id, user_id, buyer_name, buyer_email, status,
          subtotal_cents, total_cents, platform_fee_cents, currency, answers, access_token,
          stripe_destination, expires_at)
        SELECT ${orderId}, e.id, ${input.userId}, ${input.buyerName}, ${input.buyerEmail}, 'pending',
          ${subtotal}::int, ${subtotal}::int, ${input.platformFeeCents}::int, ${input.currency},
          ${JSON.stringify(input.answers)}::jsonb, ${accessToken}, ${input.destination},
          ${expiresAt}::timestamptz
        FROM events e
        WHERE e.id = ${input.eventId} AND e.status = 'published' AND e.start_at > now()
          AND (e.max_attendees IS NULL OR ${seatsTakenSql(sql.raw("e.id"))} + ${quantity}::int <= e.max_attendees)
          AND ${sql.join(perTicket, sql` AND `)}
      `),
      // Niet ingevoegd → deling door nul → hele batch rolt terug.
      db.execute(
        sql`SELECT 1 / (SELECT count(*) FROM event_orders WHERE id = ${orderId})::int`,
      ),
      db.execute(sql`
        INSERT INTO event_order_items (id, order_id, ticket_id, quantity, unit_price_cents)
        VALUES ${sql.join(itemValues, sql`, `)}
      `),
    ]);
  } catch (err) {
    if (/division by zero/i.test(String((err as Error)?.message ?? err)))
      throw new SoldOutError();
    throw err;
  }
  return { orderId, accessToken, subtotalCents: subtotal, quantity };
}

type OrderRow = typeof eventOrders.$inferSelect;
type EventRow = typeof events.$inferSelect;

/**
 * Markeert een bestelling als betaald/gratis en geeft tickets uit. Idempotent: een
 * herhaalde webhook of dubbele aanroep geeft geen extra tickets. Ook een al verlopen
 * reservering wordt afgerond als de betaling tóch binnenkomt (liever een plek te veel
 * dan iemand die betaald heeft zonder ticket).
 */
export async function finalizeOrder(
  db: Database,
  orderId: string,
  payment: {
    paymentIntentId: string | null;
    totalCents: number;
    discountCents: number;
  } | null,
): Promise<{ finalized: boolean }> {
  const [updated] = await db.batch([
    db.execute(sql`
      UPDATE event_orders SET
        status = ${payment && payment.totalCents > 0 ? "paid" : "free"}::event_order_status,
        paid_at = now(), updated_at = now(),
        stripe_payment_intent_id = COALESCE(${payment?.paymentIntentId ?? null}, stripe_payment_intent_id),
        total_cents = ${payment ? payment.totalCents : 0}::int,
        discount_cents = ${payment ? payment.discountCents : 0}::int
      WHERE id = ${orderId} AND status IN ('pending', 'expired')
      RETURNING id
    `),
    db.execute(sql`
      INSERT INTO event_issued_tickets (id, order_id, ticket_id, event_id, holder_name, holder_email, user_id, code)
      SELECT gen_random_uuid()::text, o.id, i.ticket_id, o.event_id, o.buyer_name, o.buyer_email, o.user_id,
             replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
      FROM event_orders o
      JOIN event_order_items i ON i.order_id = o.id
      CROSS JOIN LATERAL generate_series(1, i.quantity)
      WHERE o.id = ${orderId} AND o.status IN ('paid', 'free')
        AND NOT EXISTS (SELECT 1 FROM event_issued_tickets x WHERE x.order_id = o.id)
    `),
    // Wie op de wachtlijst stond en nu een ticket heeft, gaat van de lijst af.
    db.execute(sql`
      UPDATE event_attendees a SET status = 'converted', updated_at = now()
      FROM event_orders o
      WHERE o.id = ${orderId} AND o.status IN ('paid', 'free')
        AND a.event_id = o.event_id AND a.user_id = o.user_id AND a.status = 'waitlisted'
    `),
  ]);
  const finalized = rowsOf(updated).length > 0;
  if (finalized) await sendOrderConfirmation(db, orderId);
  return { finalized };
}

export async function loadOrderWithEvent(db: Database, orderId: string) {
  const order = await db.query.eventOrders.findFirst({
    where: eq(eventOrders.id, orderId),
    with: {
      event: true,
      items: { with: { ticket: true } },
      issued: { with: { ticket: true } },
    },
  });
  return order ?? null;
}

export function orderUrl(
  order: { id: string; accessToken: string },
  event: { slug: string },
) {
  return `${APP_URL}/events/${event.slug}/bestelling/${order.id}?t=${order.accessToken}`;
}
export function ticketUrl(code: string) {
  return `${APP_URL}/tickets/${code}`;
}

async function sendOrderConfirmation(db: Database, orderId: string) {
  try {
    const order = await loadOrderWithEvent(db, orderId);
    if (!order) return;
    const e = order.event;
    const lines = [
      ...order.issued
        .filter((t) => t.status === "valid")
        .map((t, i) => ({
          text: `Ticket ${i + 1}: ${t.ticket.name}`,
          url: ticketUrl(t.code),
        })),
      ...(order.totalCents > 0
        ? [{ text: `Betaald: ${formatEuro(order.totalCents)}` }]
        : []),
    ];
    const guest = !order.userId;
    await sendEventEmail({
      to: order.buyerEmail,
      subject: `Je tickets: ${e.title}`,
      heading: `Je bent erbij, ${order.buyerName.split(" ")[0]}!`,
      intro: guest
        ? "Hieronder je tickets; neem ze mee op je telefoon. Maak gratis een Samenmakers-profiel aan om na afloop in contact te blijven met de andere deelnemers."
        : "Hieronder je tickets; neem ze mee op je telefoon. Je vindt ze ook terug onder Mijn events.",
      event: {
        title: e.title,
        when: formatEventWhen(e.startAt, e.endAt, e.timezone),
        where: eventWhere(e),
      },
      lines,
      cta: guest
        ? {
            label: "Profiel aanmaken",
            url: `${APP_URL}/aanmelden?email=${encodeURIComponent(order.buyerEmail)}`,
          }
        : { label: "Bekijk bestelling", url: orderUrl(order, e) },
      ics: eventIcs(e as NotifiableEvent),
    });
  } catch (err) {
    console.error("[events/orders] bevestigingsmail mislukt:", err);
  }
}

/** Gratis bestelling: meteen afronden, geen Stripe. */
export async function completeFreeOrder(db: Database, orderId: string) {
  return finalizeOrder(db, orderId, null);
}

export async function createCheckoutSession(opts: {
  order: { id: string; accessToken: string };
  event: Pick<EventRow, "id" | "slug" | "title" | "currency">;
  lines: PricedLine[];
  buyerEmail: string;
  userId: string | null;
  platformFeeCents: number;
  destination: string | null;
}) {
  const stripe = getStripe();
  const back = `${APP_URL}/events/${opts.event.slug}`;
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: opts.buyerEmail,
      line_items: opts.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: opts.event.currency,
          unit_amount: l.unitPriceCents,
          product_data: {
            name: `${l.ticket.name} — ${opts.event.title}`.slice(0, 250),
          },
        },
      })),
      // Coupon-suite: promotiecodes uit /admin/coupons werken hier ook.
      allow_promotion_codes: true,
      expires_at: Math.floor((Date.now() + CHECKOUT_TTL_MS) / 1000) + 30,
      success_url: `${back}/bestelling/${opts.order.id}?t=${opts.order.accessToken}&betaald=1`,
      cancel_url: `${back}/bestellen?geannuleerd=${opts.order.id}`,
      locale: "nl",
      metadata: {
        kind: "event_order",
        orderId: opts.order.id,
        eventId: opts.event.id,
        ...(opts.userId ? { userId: opts.userId } : {}),
      },
      payment_intent_data: {
        receipt_email: opts.buyerEmail,
        description: `Tickets: ${opts.event.title}`.slice(0, 500),
        metadata: { kind: "event_order", orderId: opts.order.id },
        // Destination charge: geld gaat naar de organisator, fee blijft bij het platform.
        ...(opts.destination
          ? {
              transfer_data: { destination: opts.destination },
              ...(opts.platformFeeCents > 0
                ? { application_fee_amount: opts.platformFeeCents }
                : {}),
            }
          : {}),
      },
    },
    { idempotencyKey: `event-order-${opts.order.id}` },
  );
  return session;
}

/** Stripe-webhook: checkout.session.completed / async_payment_succeeded. */
export async function handleCheckoutCompleted(
  db: Database,
  s: Stripe.Checkout.Session,
) {
  const orderId = s.metadata?.orderId;
  if (!orderId) return;
  // Bij iDEAL/kaart is payment_status meteen "paid"; bij uitgestelde methodes wachten we
  // op checkout.session.async_payment_succeeded.
  if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required")
    return;
  await db
    .update(eventOrders)
    .set({ stripeSessionId: s.id, updatedAt: new Date() })
    .where(
      and(
        eq(eventOrders.id, orderId),
        sql`${eventOrders.stripeSessionId} IS NULL`,
      ),
    );
  await finalizeOrder(db, orderId, {
    paymentIntentId:
      typeof s.payment_intent === "string"
        ? s.payment_intent
        : (s.payment_intent?.id ?? null),
    totalCents: s.amount_total ?? 0,
    discountCents: s.total_details?.amount_discount ?? 0,
  });
}

/** Checkout verlopen of afgebroken: reservering vrijgeven en wachtlijst bedienen. */
export async function expireOrder(db: Database, orderId: string) {
  const [row] = await db
    .update(eventOrders)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(eventOrders.id, orderId), eq(eventOrders.status, "pending")))
    .returning({ eventId: eventOrders.eventId });
  if (!row) return;
  await refillWaitlist(db, row.eventId);
}

async function refillWaitlist(db: Database, eventId: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (event?.status === "published")
    await notifyFillResult(db, event, await fillOpenSpots(db, event));
}

/**
 * Tickets terugbetalen (of bij gratis tickets: annuleren). Bedrag = aandeel van het
 * werkelijk betaalde totaal, dus kortingen worden naar rato verrekend.
 */
export async function refundTickets(
  db: Database,
  order: OrderRow,
  ticketIds: string[] | "all",
  reason: string,
): Promise<{ refundedCents: number; count: number }> {
  const issued = await db.query.eventIssuedTickets.findMany({
    where: and(
      eq(eventIssuedTickets.orderId, order.id),
      eq(eventIssuedTickets.status, "valid"),
    ),
  });
  const target =
    ticketIds === "all"
      ? issued
      : issued.filter((t) => ticketIds.includes(t.id));
  if (target.length === 0) return { refundedCents: 0, count: 0 };

  const items = await db.query.eventOrderItems.findMany({
    where: (i, { eq: e }) => e(i.orderId, order.id),
  });
  const unit = new Map(items.map((i) => [i.ticketId, i.unitPriceCents]));
  const gross = target.reduce((s, t) => s + (unit.get(t.ticketId) ?? 0), 0);
  const ratio =
    order.subtotalCents > 0 ? order.totalCents / order.subtotalCents : 0;
  const allRemaining = target.length === issued.length;

  let refundedCents = 0;
  if (order.status === "paid" && order.stripePaymentIntentId && gross > 0) {
    const stripe = getStripe();
    // Laatste tickets: rest van het bedrag, zodat afrondingen niet blijven hangen.
    let amount = Math.round(gross * ratio);
    if (allRemaining) {
      const pi = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
        { expand: ["latest_charge"] },
      );
      const charge = pi.latest_charge as Stripe.Charge | null;
      if (charge) amount = charge.amount - charge.amount_refunded;
    }
    if (amount > 0) {
      await stripe.refunds.create(
        {
          payment_intent: order.stripePaymentIntentId,
          amount,
          reason: "requested_by_customer",
          metadata: { orderId: order.id, reason: reason.slice(0, 400) },
          ...(order.stripeDestination
            ? { reverse_transfer: true, refund_application_fee: true }
            : {}),
        },
        {
          idempotencyKey: `event-refund-${order.id}-${target
            .map((t) => t.id)
            .sort()
            .join(".")}`.slice(0, 255),
        },
      );
      refundedCents = amount;
    }
  }

  const newStatus = order.status === "paid" ? "refunded" : "cancelled";
  await db.batch([
    db
      .update(eventIssuedTickets)
      .set({
        status: newStatus === "refunded" ? "refunded" : "cancelled",
        updatedAt: new Date(),
      })
      .where(
        inArray(
          eventIssuedTickets.id,
          target.map((t) => t.id),
        ),
      ),
    db
      .update(eventOrders)
      .set(
        allRemaining
          ? { status: newStatus, refundedAt: new Date(), updatedAt: new Date() }
          : { updatedAt: new Date() },
      )
      .where(eq(eventOrders.id, order.id)),
  ]);

  await refillWaitlist(db, order.eventId);
  return { refundedCents, count: target.length };
}

/** Stripe-webhook charge.refunded (bijv. terugbetaling via het Stripe-dashboard). */
export async function handleChargeRefunded(
  db: Database,
  charge: Stripe.Charge,
) {
  if (!charge.refunded) return; // gedeeltelijk: al verwerkt via refundTickets
  const pi =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!pi) return;
  const order = await db.query.eventOrders.findFirst({
    where: eq(eventOrders.stripePaymentIntentId, pi),
  });
  if (!order || order.status === "refunded") return;
  await db.batch([
    db
      .update(eventIssuedTickets)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(
        and(
          eq(eventIssuedTickets.orderId, order.id),
          eq(eventIssuedTickets.status, "valid"),
        ),
      ),
    db
      .update(eventOrders)
      .set({
        status: "refunded",
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(eventOrders.id, order.id)),
  ]);
  await refillWaitlist(db, order.eventId);
}

/** Ticket doorgeven: nieuwe houder, nieuwe code (de oude link werkt dan niet meer). */
export async function transferTicket(
  db: Database,
  ticket: typeof eventIssuedTickets.$inferSelect,
  to: { name: string; email: string },
) {
  const email = to.email.trim().toLowerCase();
  const member = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  const code = newSecret(24);
  const [updated] = await db
    .update(eventIssuedTickets)
    .set({
      holderName: to.name.trim(),
      holderEmail: email,
      userId: member?.id ?? null,
      transferredFromEmail: ticket.holderEmail,
      code,
      remindersSent: [],
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(eventIssuedTickets.id, ticket.id),
        eq(eventIssuedTickets.status, "valid"),
      ),
    )
    .returning();
  if (!updated) return null;

  const event = await db.query.events.findFirst({
    where: eq(events.id, ticket.eventId),
  });
  if (event) {
    try {
      await sendEventEmail({
        to: email,
        subject: `Je hebt een ticket gekregen: ${event.title}`,
        heading: `${to.name.split(" ")[0]}, je bent erbij!`,
        intro: `${ticket.holderName} heeft een ticket aan je doorgegeven. Neem de ticketlink mee naar het event.`,
        event: {
          title: event.title,
          when: formatEventWhen(event.startAt, event.endAt, event.timezone),
          where: eventWhere(event),
        },
        lines: [{ text: "Jouw ticket", url: ticketUrl(code) }],
        cta: { label: "Bekijk event", url: eventUrl(event) },
        ics: eventIcs(event),
      });
    } catch (err) {
      console.error("[events/orders] doorgeefmail mislukt:", err);
    }
  }
  return updated;
}
