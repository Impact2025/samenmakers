import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, notInArray, or, sql } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import {
  events,
  eventTickets,
  eventFormFields,
  eventOrders,
  eventIssuedTickets,
  users,
} from "@/server/db/schema";
import type { Database } from "@/server/db";
import { apiLimit } from "@/lib/ratelimit";
import { features } from "@/lib/features";
import { seatsTakenSql, ticketTakenSql } from "@/server/events/capacity";
import { derivePhase, acceptsRegistrations } from "@/server/events/status";
import {
  priceOrder,
  platformFee,
  feeConfigFromEnv,
  canSelfRefund,
  salesState,
} from "@/server/events/pricing";
import {
  reserveOrder,
  completeFreeOrder,
  createCheckoutSession,
  expireOrder,
  refundTickets,
  transferTicket,
  orderUrl,
  SoldOutError,
} from "@/server/events/orders";
import {
  ensureConnectAccount,
  onboardingLink,
  syncConnectStatus,
  dashboardLink,
} from "@/server/events/connect";

type Ctx = {
  db: Database;
  session: { user?: { id?: string; role?: string; isPro?: boolean } } | null;
};

function isAdmin(ctx: Ctx) {
  return ctx.session?.user?.role === "admin";
}

async function requireManager(ctx: Ctx & { userId: string }, eventId: string) {
  const event = await ctx.db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event)
    throw new TRPCError({ code: "NOT_FOUND", message: "Event niet gevonden" });
  if (event.organiserId !== ctx.userId && !isAdmin(ctx)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Alleen de organisator kan dit",
    });
  }
  return event;
}

function requireTicketsFeature() {
  if (!features.eventTickets)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tickets zijn nog niet beschikbaar",
    });
}

function clientKey(ctx: { req: Request; session: Ctx["session"] }) {
  return (
    ctx.session?.user?.id ??
    ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anon"
  );
}

const answersSchema = z.record(z.string(), z.string().max(1000)).default({});

function validateAnswers(
  fields: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options: string[];
  }[],
  answers: Record<string, string>,
) {
  const clean: Record<string, string> = {};
  for (const f of fields) {
    const v = (answers[f.id] ?? "").trim();
    if (f.required && (!v || (f.type === "checkbox" && v !== "ja"))) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Vul "${f.label}" in`,
      });
    }
    if (f.type === "select" && v && !f.options.includes(v)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Ongeldige keuze bij "${f.label}"`,
      });
    }
    if (v) clean[f.id] = v;
  }
  return clean;
}

const ticketInput = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).optional(),
    kind: z.enum(["free", "paid", "donation"]),
    priceCents: z.number().int().min(0).max(100_000),
    vatBps: z
      .union([z.literal(0), z.literal(900), z.literal(2100)])
      .default(2100),
    quantity: z.number().int().min(1).max(100_000).nullable(),
    maxPerOrder: z.number().int().min(1).max(50).default(10),
    salesStart: z.string().datetime({ offset: true }).nullable(),
    salesEnd: z.string().datetime({ offset: true }).nullable(),
    isHidden: z.boolean().default(false),
  })
  .refine((t) => t.kind !== "paid" || t.priceCents >= 50, {
    message: "Een betaald ticket kost minimaal € 0,50",
    path: ["priceCents"],
  })
  .refine(
    (t) =>
      !t.salesStart ||
      !t.salesEnd ||
      new Date(t.salesEnd) > new Date(t.salesStart),
    {
      message: "Verkoopeinde moet na de start liggen",
      path: ["salesEnd"],
    },
  );

export const ticketsRouter = createTRPCRouter({
  // ── Publiek ──────────────────────────────────────────────────────────────

  /** Alles voor de bestelpagina: tickettypes met beschikbaarheid en aanmeldvragen. */
  forEvent: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(200) }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: or(eq(events.slug, input.slug), eq(events.id, input.slug)),
      });
      if (!event || event.status === "draft") return null;
      if (event.visibility === "members" && !ctx.session?.user?.id) return null;

      const [types, fields, [counts]] = await Promise.all([
        ctx.db
          .select({
            id: eventTickets.id,
            name: eventTickets.name,
            description: eventTickets.description,
            kind: eventTickets.kind,
            priceCents: eventTickets.priceCents,
            quantity: eventTickets.quantity,
            maxPerOrder: eventTickets.maxPerOrder,
            salesStart: eventTickets.salesStart,
            salesEnd: eventTickets.salesEnd,
            isHidden: eventTickets.isHidden,
            taken: ticketTakenSql(eventTickets.id),
          })
          .from(eventTickets)
          .where(
            and(
              eq(eventTickets.eventId, event.id),
              eq(eventTickets.isHidden, false),
            ),
          )
          .orderBy(asc(eventTickets.sortOrder), asc(eventTickets.createdAt)),
        ctx.db.query.eventFormFields.findMany({
          where: eq(eventFormFields.eventId, event.id),
          orderBy: asc(eventFormFields.sortOrder),
        }),
        ctx.db
          .select({ seats: seatsTakenSql(events.id) })
          .from(events)
          .where(eq(events.id, event.id)),
      ]);

      const seats = counts?.seats ?? 0;
      const eventLeft =
        event.maxAttendees === null
          ? null
          : Math.max(0, event.maxAttendees - seats);
      const now = new Date();
      const me = ctx.session?.user?.id
        ? await ctx.db.query.users.findFirst({
            where: eq(users.id, ctx.session.user.id),
            columns: { naam: true, name: true, email: true },
          })
        : null;

      return {
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
          timezone: event.timezone,
          location: event.location,
          format: event.format,
          refundUntilHours: event.refundUntilHours,
          allowTransfer: event.allowTransfer,
          phase: derivePhase(event, seats),
        },
        tickets: types.map((t) => {
          const typeLeft =
            t.quantity === null ? null : Math.max(0, t.quantity - t.taken);
          const left =
            typeLeft === null
              ? eventLeft
              : eventLeft === null
                ? typeLeft
                : Math.min(typeLeft, eventLeft);
          return { ...t, left, state: salesState(t, now) };
        }),
        fields: fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
        })),
        buyer: me
          ? { name: me.naam ?? me.name ?? "", email: me.email ?? "" }
          : null,
      };
    }),

  /** Reserveren en afrekenen. Gratis → direct klaar; betaald → Stripe Checkout-URL. */
  checkout: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        items: z
          .array(
            z.object({
              ticketId: z.string(),
              quantity: z.number().int().min(0).max(50),
              amountCents: z.number().int().min(0).optional(),
            }),
          )
          .min(1)
          .max(20),
        buyer: z.object({
          name: z.string().trim().min(2).max(120),
          email: z.string().trim().toLowerCase().email().max(200),
        }),
        answers: answersSchema,
        acceptTerms: z.literal(true, {
          message: "Ga akkoord met de voorwaarden",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireTicketsFeature();
      if (apiLimit) {
        const { success } = await apiLimit.limit(`checkout:${clientKey(ctx)}`);
        if (!success)
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Te veel pogingen, probeer het zo opnieuw",
          });
      }

      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });
      if (!event || event.status !== "published")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event niet gevonden",
        });
      const userId = ctx.session?.user?.id ?? null;
      if (event.visibility === "members" && !userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Log in om te bestellen",
        });

      const [[counts], types, fields, organiser] = await Promise.all([
        ctx.db
          .select({ seats: seatsTakenSql(events.id) })
          .from(events)
          .where(eq(events.id, event.id)),
        ctx.db.query.eventTickets.findMany({
          where: and(
            eq(eventTickets.eventId, event.id),
            eq(eventTickets.isHidden, false),
          ),
        }),
        ctx.db.query.eventFormFields.findMany({
          where: eq(eventFormFields.eventId, event.id),
        }),
        ctx.db.query.users.findFirst({
          where: eq(users.id, event.organiserId),
          columns: {
            role: true,
            stripeConnectAccountId: true,
            stripeConnectReady: true,
          },
        }),
      ]);
      if (!acceptsRegistrations(derivePhase(event, counts?.seats ?? 0))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bestellen is voor dit event niet (meer) mogelijk",
        });
      }

      const priced = priceOrder(types, input.items);
      if (!priced.ok)
        throw new TRPCError({ code: "BAD_REQUEST", message: priced.error });
      const answers = validateAnswers(fields, input.answers);

      // Betaald: via het Connect-account van de organisator, of (admin-events) via het platform.
      let destination: string | null = null;
      if (priced.subtotalCents > 0 && organiser?.role !== "admin") {
        if (
          !organiser?.stripeConnectAccountId ||
          !organiser.stripeConnectReady
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "De organisator kan nog geen betalingen ontvangen. Probeer het later opnieuw.",
          });
        }
        destination = organiser.stripeConnectAccountId;
      }
      const fee = destination
        ? platformFee(priced.lines, feeConfigFromEnv())
        : 0;

      let reserved;
      try {
        reserved = await reserveOrder(ctx.db, {
          eventId: event.id,
          lines: priced.lines,
          buyerName: input.buyer.name,
          buyerEmail: input.buyer.email,
          userId,
          answers,
          platformFeeCents: fee,
          destination,
          currency: event.currency,
        });
      } catch (e) {
        if (e instanceof SoldOutError)
          throw new TRPCError({ code: "CONFLICT", message: e.message });
        throw e;
      }
      const order = { id: reserved.orderId, accessToken: reserved.accessToken };

      if (reserved.subtotalCents === 0) {
        await completeFreeOrder(ctx.db, order.id);
        return { url: orderUrl(order, event) };
      }

      try {
        const session = await createCheckoutSession({
          order,
          event,
          lines: priced.lines,
          buyerEmail: input.buyer.email,
          userId,
          platformFeeCents: fee,
          destination,
        });
        await ctx.db
          .update(eventOrders)
          .set({ stripeSessionId: session.id })
          .where(eq(eventOrders.id, order.id));
        if (!session.url) throw new Error("Stripe gaf geen checkout-URL terug");
        return { url: session.url };
      } catch (err) {
        await expireOrder(ctx.db, order.id);
        console.error("[tickets.checkout] Stripe-fout:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Betalen is even niet mogelijk. Probeer het opnieuw.",
        });
      }
    }),

  /** Bestelling bekijken: met toegangstoken (gasten) of als eigenaar/organisator. */
  order: publicProcedure
    .input(z.object({ orderId: z.string(), token: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.eventOrders.findFirst({
        where: eq(eventOrders.id, input.orderId),
        with: {
          event: true,
          items: { with: { ticket: true } },
          issued: { with: { ticket: true } },
        },
      });
      if (!order) return null;
      const uid = ctx.session?.user?.id;
      const allowed =
        (input.token && input.token === order.accessToken) ||
        (uid && (uid === order.userId || uid === order.event.organiserId)) ||
        isAdmin(ctx);
      if (!allowed) return null;
      return {
        id: order.id,
        status: order.status,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        totalCents: order.totalCents,
        discountCents: order.discountCents,
        createdAt: order.createdAt,
        event: {
          slug: order.event.slug,
          title: order.event.title,
          startAt: order.event.startAt,
          endAt: order.event.endAt,
          timezone: order.event.timezone,
          location: order.event.location,
          format: order.event.format,
        },
        items: order.items.map((i) => ({
          name: i.ticket.name,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
        })),
        tickets: order.issued.map((t) => ({
          code: t.code,
          name: t.ticket.name,
          holderName: t.holderName,
          status: t.status,
        })),
      };
    }),

  /** Ticketpagina: de code zelf is het geheim. */
  byCode: publicProcedure
    .input(z.object({ code: z.string().min(16).max(80) }))
    .query(async ({ ctx, input }) => {
      const t = await ctx.db.query.eventIssuedTickets.findFirst({
        where: eq(eventIssuedTickets.code, input.code),
        with: { ticket: true, event: true },
      });
      if (!t) return null;
      const e = t.event;
      return {
        code: t.code,
        status: t.status,
        holderName: t.holderName,
        holderEmail: t.holderEmail,
        ticketName: t.ticket.name,
        checkedInAt: t.checkedInAt,
        event: {
          slug: e.slug,
          title: e.title,
          startAt: e.startAt,
          endAt: e.endAt,
          timezone: e.timezone,
          location: e.location,
          format: e.format,
          status: e.status,
          meetingUrl: t.status === "valid" ? e.meetingUrl : null,
        },
        canTransfer:
          t.status === "valid" &&
          e.allowTransfer &&
          e.startAt > new Date() &&
          e.status === "published",
        canCancel:
          t.status === "valid" &&
          e.status === "published" &&
          canSelfRefund(e.startAt, e.refundUntilHours),
        refundUntilHours: e.refundUntilHours,
      };
    }),

  transfer: publicProcedure
    .input(
      z.object({
        code: z.string().min(16).max(80),
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const t = await ctx.db.query.eventIssuedTickets.findFirst({
        where: eq(eventIssuedTickets.code, input.code),
        with: { event: true },
      });
      if (!t || t.status !== "valid")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket niet gevonden",
        });
      if (
        !t.event.allowTransfer ||
        t.event.startAt <= new Date() ||
        t.event.status !== "published"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit ticket kan niet (meer) worden doorgegeven",
        });
      }
      if (input.email.toLowerCase() === t.holderEmail.toLowerCase()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit ticket staat al op dit e-mailadres",
        });
      }
      const updated = await transferTicket(ctx.db, t, input);
      if (!updated)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Doorgeven mislukt, probeer het opnieuw",
        });
      return { ok: true };
    }),

  /** Deelnemer annuleert zelf (binnen de terugbetaaltermijn). */
  cancelByCode: publicProcedure
    .input(z.object({ code: z.string().min(16).max(80) }))
    .mutation(async ({ ctx, input }) => {
      const t = await ctx.db.query.eventIssuedTickets.findFirst({
        where: eq(eventIssuedTickets.code, input.code),
        with: { event: true, order: true },
      });
      if (!t || t.status !== "valid")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket niet gevonden",
        });
      if (
        t.event.status !== "published" ||
        !canSelfRefund(t.event.startAt, t.event.refundUntilHours)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Annuleren is voor dit event niet (meer) mogelijk",
        });
      }
      const r = await refundTickets(
        ctx.db,
        t.order,
        [t.id],
        "Geannuleerd door deelnemer",
      );
      return r;
    }),

  /** Mijn tickets: op account of op e-mailadres (gastbestellingen van vóór het account). */
  mine: protectedProcedure.query(async ({ ctx }) => {
    const me = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
      columns: { email: true },
    });
    const email = me?.email?.toLowerCase();
    return ctx.db
      .select({
        code: eventIssuedTickets.code,
        ticketName: eventTickets.name,
        holderName: eventIssuedTickets.holderName,
        eventTitle: events.title,
        eventSlug: events.slug,
        startAt: events.startAt,
        endAt: events.endAt,
        timezone: events.timezone,
        eventStatus: events.status,
      })
      .from(eventIssuedTickets)
      .innerJoin(eventTickets, eq(eventTickets.id, eventIssuedTickets.ticketId))
      .innerJoin(events, eq(events.id, eventIssuedTickets.eventId))
      .where(
        and(
          eq(eventIssuedTickets.status, "valid"),
          email
            ? or(
                eq(eventIssuedTickets.userId, ctx.userId),
                sql`lower(${eventIssuedTickets.holderEmail}) = ${email}`,
              )
            : eq(eventIssuedTickets.userId, ctx.userId),
          sql`COALESCE(${events.endAt}, ${events.startAt} + interval '3 hours') > now()`,
        ),
      )
      .orderBy(asc(events.startAt))
      .limit(100);
  }),

  // ── Organisator ──────────────────────────────────────────────────────────

  manage: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.eventId);
      const [types, fields, orders, organiser] = await Promise.all([
        ctx.db
          .select({
            id: eventTickets.id,
            name: eventTickets.name,
            description: eventTickets.description,
            kind: eventTickets.kind,
            priceCents: eventTickets.priceCents,
            vatBps: eventTickets.vatBps,
            quantity: eventTickets.quantity,
            maxPerOrder: eventTickets.maxPerOrder,
            salesStart: eventTickets.salesStart,
            salesEnd: eventTickets.salesEnd,
            isHidden: eventTickets.isHidden,
            taken: ticketTakenSql(eventTickets.id),
          })
          .from(eventTickets)
          .where(eq(eventTickets.eventId, event.id))
          .orderBy(asc(eventTickets.sortOrder), asc(eventTickets.createdAt)),
        ctx.db.query.eventFormFields.findMany({
          where: eq(eventFormFields.eventId, event.id),
          orderBy: asc(eventFormFields.sortOrder),
        }),
        ctx.db.query.eventOrders.findMany({
          where: and(
            eq(eventOrders.eventId, event.id),
            inArray(eventOrders.status, [
              "paid",
              "free",
              "refunded",
              "cancelled",
            ]),
          ),
          with: { issued: { with: { ticket: true } } },
          orderBy: desc(eventOrders.createdAt),
          limit: 500,
        }),
        ctx.db.query.users.findFirst({
          where: eq(users.id, event.organiserId),
          columns: {
            role: true,
            stripeConnectAccountId: true,
            stripeConnectReady: true,
          },
        }),
      ]);
      const paid = orders.filter((o) => o.status === "paid");
      return {
        settings: {
          refundUntilHours: event.refundUntilHours,
          allowTransfer: event.allowTransfer,
        },
        canSellPaid:
          organiser?.role === "admin" || !!organiser?.stripeConnectReady,
        isPro: !!ctx.session?.user?.isPro || isAdmin(ctx),
        tickets: types,
        fields,
        revenue: {
          grossCents: paid.reduce((s, o) => s + o.totalCents, 0),
          feeCents: paid.reduce((s, o) => s + o.platformFeeCents, 0),
          orders: orders.filter(
            (o) => o.status === "paid" || o.status === "free",
          ).length,
        },
        orders: orders.map((o) => ({
          id: o.id,
          status: o.status,
          buyerName: o.buyerName,
          buyerEmail: o.buyerEmail,
          totalCents: o.totalCents,
          createdAt: o.createdAt,
          answers: o.answers,
          tickets: o.issued.map((t) => ({
            id: t.id,
            name: t.ticket.name,
            holderName: t.holderName,
            holderEmail: t.holderEmail,
            status: t.status,
            checkedInAt: t.checkedInAt,
          })),
        })),
      };
    }),

  upsertTicket: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        id: z.string().optional(),
        data: ticketInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireTicketsFeature();
      const event = await requireManager(ctx, input.eventId);
      const d = input.data;
      // Betaalde tickets zijn een Pro-functie (events-plan §8).
      if (d.kind !== "free" && !ctx.session?.user?.isPro && !isAdmin(ctx)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Betaalde tickets zijn beschikbaar met Pro",
        });
      }
      const values = {
        name: d.name,
        description: d.description ?? null,
        kind: d.kind,
        priceCents: d.kind === "free" ? 0 : d.priceCents,
        vatBps: d.vatBps,
        quantity: d.quantity,
        maxPerOrder: d.maxPerOrder,
        salesStart: d.salesStart ? new Date(d.salesStart) : null,
        salesEnd: d.salesEnd ? new Date(d.salesEnd) : null,
        isHidden: d.isHidden,
      };
      if (input.id) {
        const [existing] = await ctx.db
          .select({
            id: eventTickets.id,
            kind: eventTickets.kind,
            priceCents: eventTickets.priceCents,
            taken: ticketTakenSql(eventTickets.id),
          })
          .from(eventTickets)
          .where(
            and(
              eq(eventTickets.id, input.id),
              eq(eventTickets.eventId, event.id),
            ),
          );
        if (!existing)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket niet gevonden",
          });
        if (
          existing.taken > 0 &&
          (existing.kind !== d.kind ||
            existing.priceCents !== values.priceCents)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Prijs en soort liggen vast zodra er tickets verkocht zijn. Maak een nieuw tickettype.",
          });
        }
        if (d.quantity !== null && d.quantity < existing.taken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Er zijn er al ${existing.taken} verkocht`,
          });
        }
        const [row] = await ctx.db
          .update(eventTickets)
          .set(values)
          .where(eq(eventTickets.id, input.id))
          .returning();
        return row!;
      }
      const [{ n }] = (await ctx.db
        .select({ n: sql<number>`count(*)::int` })
        .from(eventTickets)
        .where(eq(eventTickets.eventId, event.id))) as [{ n: number }];
      const [row] = await ctx.db
        .insert(eventTickets)
        .values({ ...values, eventId: event.id, sortOrder: n })
        .returning();
      return row!;
    }),

  deleteTicket: protectedProcedure
    .input(z.object({ eventId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.eventId);
      const [t] = await ctx.db
        .select({ taken: ticketTakenSql(eventTickets.id) })
        .from(eventTickets)
        .where(
          and(
            eq(eventTickets.id, input.id),
            eq(eventTickets.eventId, event.id),
          ),
        );
      if (!t)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket niet gevonden",
        });
      const everSold = await ctx.db.query.eventOrderItems.findFirst({
        where: (i, { eq: e }) => e(i.ticketId, input.id),
      });
      if (everSold) {
        // Historie bewaren: verbergen in plaats van verwijderen.
        await ctx.db
          .update(eventTickets)
          .set({ isHidden: true })
          .where(eq(eventTickets.id, input.id));
        return { hidden: true };
      }
      await ctx.db.delete(eventTickets).where(eq(eventTickets.id, input.id));
      return { hidden: false };
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        refundUntilHours: z
          .number()
          .int()
          .min(0)
          .max(24 * 60)
          .nullable(),
        allowTransfer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.eventId);
      await ctx.db
        .update(events)
        .set({
          refundUntilHours: input.refundUntilHours,
          allowTransfer: input.allowTransfer,
          updatedAt: new Date(),
        })
        .where(eq(events.id, event.id));
      return { ok: true };
    }),

  saveFields: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        fields: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string().trim().min(2).max(120),
              type: z.enum(["text", "textarea", "select", "checkbox"]),
              required: z.boolean(),
              options: z
                .array(z.string().trim().min(1).max(80))
                .max(20)
                .default([]),
            }),
          )
          .max(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.eventId);
      for (const f of input.fields) {
        if (f.type === "select" && f.options.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Geef minstens twee opties bij "${f.label}"`,
          });
        }
      }
      // Bestaande ids behouden: antwoorden in bestellingen verwijzen ernaar.
      const keep = input.fields
        .map((f) => f.id)
        .filter((x): x is string => !!x);
      await ctx.db.batch([
        keep.length
          ? ctx.db
              .delete(eventFormFields)
              .where(
                and(
                  eq(eventFormFields.eventId, event.id),
                  notInArray(eventFormFields.id, keep),
                ),
              )
          : ctx.db
              .delete(eventFormFields)
              .where(eq(eventFormFields.eventId, event.id)),
        ...input.fields.map((f, i) =>
          ctx.db
            .insert(eventFormFields)
            .values({
              id: f.id ?? crypto.randomUUID(),
              eventId: event.id,
              label: f.label,
              type: f.type,
              required: f.required,
              options: f.type === "select" ? f.options : [],
              sortOrder: i,
            })
            .onConflictDoUpdate({
              target: eventFormFields.id,
              set: {
                label: f.label,
                type: f.type,
                required: f.required,
                options: f.type === "select" ? f.options : [],
                sortOrder: i,
              },
              setWhere: eq(eventFormFields.eventId, event.id),
            }),
        ),
      ]);
      return { ok: true };
    }),

  refund: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        ticketIds: z.array(z.string()).optional(),
        reason: z
          .string()
          .trim()
          .max(300)
          .default("Terugbetaald door organisator"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.eventOrders.findFirst({
        where: eq(eventOrders.id, input.orderId),
      });
      if (!order)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bestelling niet gevonden",
        });
      await requireManager(ctx, order.eventId);
      if (order.status !== "paid" && order.status !== "free") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deze bestelling kan niet meer worden terugbetaald",
        });
      }
      return refundTickets(
        ctx.db,
        order,
        input.ticketIds ?? "all",
        input.reason,
      );
    }),

  /** Handmatige check-in van een tickethouder (QR-scanmodus volgt in fase 4). */
  checkIn: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const t = await ctx.db.query.eventIssuedTickets.findFirst({
        where: eq(eventIssuedTickets.id, input.ticketId),
      });
      if (!t)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket niet gevonden",
        });
      await requireManager(ctx, t.eventId);
      if (t.status !== "valid")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit ticket is niet geldig",
        });
      const [row] = await ctx.db
        .update(eventIssuedTickets)
        .set({
          checkedInAt: sql`COALESCE(${eventIssuedTickets.checkedInAt}, now())`,
          updatedAt: new Date(),
        })
        .where(eq(eventIssuedTickets.id, t.id))
        .returning({ checkedInAt: eventIssuedTickets.checkedInAt });
      return {
        checkedInAt: row?.checkedInAt ?? null,
        alreadyCheckedIn: !!t.checkedInAt,
      };
    }),

  // ── Stripe Connect ───────────────────────────────────────────────────────

  connectStatus: protectedProcedure.query(async ({ ctx }) => {
    const me = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
      columns: {
        stripeConnectAccountId: true,
        stripeConnectReady: true,
        role: true,
      },
    });
    if (!me?.stripeConnectAccountId)
      return { state: "none" as const, isAdmin: me?.role === "admin" };
    const s = await syncConnectStatus(ctx.db, me.stripeConnectAccountId).catch(
      () => null,
    );
    return {
      state: s?.ready ? ("ready" as const) : ("pending" as const),
      requirements: s?.requirements ?? [],
      isAdmin: me.role === "admin",
    };
  }),

  connectOnboard: protectedProcedure.mutation(async ({ ctx }) => {
    requireTicketsFeature();
    if (!ctx.session.user.isPro && !isAdmin(ctx)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Uitbetalingen zijn beschikbaar met Pro",
      });
    }
    const accountId = await ensureConnectAccount(ctx.db, ctx.userId);
    return { url: await onboardingLink(accountId) };
  }),

  connectDashboard: protectedProcedure.mutation(async ({ ctx }) => {
    const me = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
      columns: { stripeConnectAccountId: true },
    });
    if (!me?.stripeConnectAccountId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nog geen uitbetaalaccount",
      });
    return { url: await dashboardLink(me.stripeConnectAccountId) };
  }),
});
