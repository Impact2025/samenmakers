import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  eq,
  and,
  gte,
  lt,
  gt,
  lte,
  or,
  desc,
  asc,
  sql,
  inArray,
  ilike,
  type SQL,
} from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  proProcedure,
  adminProcedure,
} from "@/server/trpc/init";
import {
  events,
  eventAttendees,
  eventOrders,
  eventTickets,
  eventIssuedTickets,
  users,
} from "@/server/db/schema";
import { refundTickets } from "@/server/events/orders";
import type { Database } from "@/server/db";
import { slugify } from "@/lib/utils";
import {
  registerAttendee,
  cancelAttendee,
  acceptOffer,
  fillOpenSpots,
} from "@/server/events/booking";
import { derivePhase, acceptsRegistrations } from "@/server/events/status";
import {
  notifyRegistration,
  notifyFillResult,
  notifyCancellation,
  notifyChange,
} from "@/server/events/notify";
import { geocode } from "@/server/events/geocode";
import { signCalendarToken } from "@/server/events/calendar-token";
import { seatsTakenSql } from "@/server/events/capacity";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

// ── Gedeelde selecties ──────────────────────────────────────────────────────

/** Plekken bezet (RSVP, tickets, reserveringen, aanbiedingen), als subquery i.p.v. alle deelnemers laden. */
// Volledig gekwalificeerd: in een select vanuit één tabel rendert drizzle ${events.id}
// als kaal "id", wat in de subqueries botst met hun eigen id-kolom (Postgres 42702).
const EVENT_ID = sql.raw(`"events"."id"`);
const seatsTaken = seatsTakenSql(EVENT_ID);
/** Heeft het event tickettypes? Dan loopt aanmelden via een bestelling. */
const ticketed = sql<boolean>`EXISTS (SELECT 1 FROM event_tickets tk WHERE tk.event_id = ${EVENT_ID})`;
const waitlistCount = sql<number>`(
  SELECT count(*)::int FROM event_attendees a
  WHERE a.event_id = ${EVENT_ID} AND a.status = 'waitlisted'
)`;

const cardColumns = {
  id: events.id,
  slug: events.slug,
  title: events.title,
  description: events.description,
  location: events.location,
  format: events.format,
  coverImageUrl: events.coverImageUrl,
  startAt: events.startAt,
  endAt: events.endAt,
  timezone: events.timezone,
  maxAttendees: events.maxAttendees,
  regio: events.regio,
  thema: events.thema,
  status: events.status,
  visibility: events.visibility,
  latitude: events.latitude,
  longitude: events.longitude,
  seatsTaken,
  waitlistCount,
  ticketed,
};

function withPhase<
  T extends {
    status: "draft" | "published" | "cancelled";
    startAt: Date;
    endAt: Date | null;
    maxAttendees: number | null;
    seatsTaken: number;
  },
>(row: T) {
  return { ...row, phase: derivePhase(row, row.seatsTaken) };
}

function isAdmin(ctx: { session: { user?: { role?: string } } | null }) {
  return ctx.session?.user?.role === "admin";
}

/** Organisator of admin; later uitgebreid met teamrollen (fase 3, `event_team`). */
async function requireManager(
  ctx: {
    db: Database;
    userId: string;
    session: { user?: { role?: string } } | null;
  },
  eventId: string,
) {
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

function encodeCursor(startAt: Date, id: string) {
  return `${startAt.toISOString()}|${id}`;
}
function decodeCursor(cursor: string) {
  const [iso, id] = cursor.split("|");
  const d = new Date(iso ?? "");
  if (!id || Number.isNaN(d.getTime()))
    throw new TRPCError({ code: "BAD_REQUEST", message: "Ongeldige cursor" });
  return { startAt: d, id };
}

const eventInput = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().max(5000).optional(),
    format: z.enum(["in_person", "online", "hybrid"]).default("in_person"),
    location: z.string().trim().max(200).optional(),
    meetingUrl: z.string().url().optional(),
    coverImageUrl: z.string().url().optional(),
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }).optional(),
    timezone: z.string().max(64).default("Europe/Amsterdam"),
    maxAttendees: z.number().int().min(1).max(100000).nullable().optional(),
    regio: z.string().max(80).optional(),
    thema: z.string().max(80).optional(),
    visibility: z.enum(["public", "members", "unlisted"]).default("public"),
    waitlistOfferHours: z.number().int().min(1).max(168).default(24),
    // Alleen door beheerders te wijzigen; voor anderen wordt dit genegeerd.
    memberFree: z.boolean().optional(),
  })
  .refine((v) => !v.endAt || new Date(v.endAt) > new Date(v.startAt), {
    message: "Einde moet na de start liggen",
    path: ["endAt"],
  })
  .refine((v) => v.format === "online" || !!v.location, {
    message: "Vul een locatie in",
    path: ["location"],
  });

function uniqueSlug(title: string) {
  // Leesbaar + kort willekeurig achtervoegsel; unieke index vangt de (theoretische) botsing.
  return `${slugify(title).slice(0, 70)}-${crypto.randomUUID().slice(0, 6)}`;
}

function assertTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("nl-NL", { timeZone: tz });
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Onbekende tijdzone" });
  }
}

// ── Router ──────────────────────────────────────────────────────────────────

export const eventsRouter = createTRPCRouter({
  /** Ontdekken: publiek, gepagineerd met keyset-cursor, filters, zonder deelnemers te laden. */
  list: publicProcedure
    .input(
      z.object({
        upcoming: z.boolean().default(true),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        q: z.string().trim().max(100).optional(),
        format: z.enum(["in_person", "online", "hybrid"]).optional(),
        regio: z.string().max(80).optional(),
        thema: z.string().max(80).optional(),
        from: z.string().datetime({ offset: true }).optional(),
        to: z.string().datetime({ offset: true }).optional(),
        near: z
          .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
            radiusKm: z.number().min(1).max(500).default(25),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const loggedIn = !!ctx.session?.user?.id;
      const conditions: SQL[] = [
        eq(events.status, "published"),
        loggedIn
          ? inArray(events.visibility, ["public", "members"])
          : eq(events.visibility, "public"),
      ];
      // "Komend" = nog niet afgelopen, dus lopende events blijven zichtbaar.
      const endExpr = sql`COALESCE(${events.endAt}, ${events.startAt} + interval '3 hours')`;
      conditions.push(
        input.upcoming ? sql`${endExpr} > ${now}` : sql`${endExpr} <= ${now}`,
      );
      if (input.q) {
        const like = `%${input.q.replace(/[%_\\]/g, "\\$&")}%`;
        conditions.push(
          or(
            ilike(events.title, like),
            ilike(events.description, like),
            ilike(events.location, like),
          )!,
        );
      }
      // Hybride telt mee bij zowel "op locatie" als "online".
      if (input.format === "online")
        conditions.push(inArray(events.format, ["online", "hybrid"]));
      else if (input.format === "in_person")
        conditions.push(inArray(events.format, ["in_person", "hybrid"]));
      else if (input.format) conditions.push(eq(events.format, input.format));
      if (input.regio) conditions.push(eq(events.regio, input.regio));
      if (input.thema) conditions.push(eq(events.thema, input.thema));
      if (input.from)
        conditions.push(gte(events.startAt, new Date(input.from)));
      if (input.to) conditions.push(lte(events.startAt, new Date(input.to)));

      let distance: SQL<number> | undefined;
      if (input.near) {
        // Haversine in km; voldoende voor "in mijn buurt" zonder PostGIS.
        distance = sql<number>`(6371 * acos(least(1, greatest(-1,
          cos(radians(${input.near.lat})) * cos(radians(${events.latitude}))
          * cos(radians(${events.longitude}) - radians(${input.near.lng}))
          + sin(radians(${input.near.lat})) * sin(radians(${events.latitude}))))))`;
        conditions.push(sql`${events.latitude} IS NOT NULL`);
        conditions.push(sql`${distance} <= ${input.near.radiusKm}`);
      }

      if (input.cursor) {
        const c = decodeCursor(input.cursor);
        conditions.push(
          input.upcoming
            ? or(
                gt(events.startAt, c.startAt),
                and(eq(events.startAt, c.startAt), gt(events.id, c.id)),
              )!
            : or(
                lt(events.startAt, c.startAt),
                and(eq(events.startAt, c.startAt), lt(events.id, c.id)),
              )!,
        );
      }

      const rows = await ctx.db
        .select({
          ...cardColumns,
          ...(distance ? { distanceKm: distance } : {}),
        })
        .from(events)
        .where(and(...conditions))
        .orderBy(
          ...(input.upcoming
            ? [asc(events.startAt), asc(events.id)]
            : [desc(events.startAt), desc(events.id)]),
        )
        .limit(input.limit + 1);

      const hasMore = rows.length > input.limit;
      const items = (hasMore ? rows.slice(0, input.limit) : rows).map(
        withPhase,
      );
      const last = items[items.length - 1];

      // Eigen status per kaart, in één query.
      let mine: Record<string, string> = {};
      if (loggedIn && items.length > 0) {
        const own = await ctx.db
          .select({
            eventId: eventAttendees.eventId,
            status: eventAttendees.status,
          })
          .from(eventAttendees)
          .where(
            and(
              eq(eventAttendees.userId, ctx.session!.user!.id!),
              inArray(
                eventAttendees.eventId,
                items.map((i) => i.id),
              ),
            ),
          );
        mine = Object.fromEntries(own.map((o) => [o.eventId, o.status]));
      }

      return {
        items: items.map((i) => ({ ...i, myStatus: mine[i.id] ?? null })),
        nextCursor:
          hasMore && last ? encodeCursor(last.startAt, last.id) : undefined,
      };
    }),

  /** Facetten voor de filterbalk: alleen waarden die echt voorkomen. */
  facets: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ regio: events.regio, thema: events.thema })
      .from(events)
      .where(
        and(eq(events.status, "published"), gte(events.startAt, new Date())),
      );
    const regios = [
      ...new Set(rows.map((r) => r.regio).filter((x): x is string => !!x)),
    ].sort();
    const themas = [
      ...new Set(rows.map((r) => r.thema).filter((x): x is string => !!x)),
    ].sort();
    return { regios, themas };
  }),

  /**
   * Eventpagina op slug of id. Geeft `{ access }` terug zodat de pagina kan kiezen
   * tussen tonen, inloggen vragen of 404 — zonder te lekken dat een concept bestaat.
   */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(200) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          ...cardColumns,
          organiserId: events.organiserId,
          meetingUrl: events.meetingUrl,
          waitlistOfferHours: events.waitlistOfferHours,
          cancellationReason: events.cancellationReason,
          publishedAt: events.publishedAt,
          updatedAt: events.updatedAt,
          createdAt: events.createdAt,
        })
        .from(events)
        .where(or(eq(events.slug, input.slug), eq(events.id, input.slug)))
        .limit(1);
      if (!row) return { access: "not_found" as const };

      const userId = ctx.session?.user?.id ?? null;
      const canManage =
        !!userId && (row.organiserId === userId || isAdmin(ctx));
      if (row.status === "draft" && !canManage)
        return { access: "not_found" as const };
      if (row.visibility === "members" && !userId) {
        return {
          access: "login_required" as const,
          title: row.title,
          slug: row.slug,
        };
      }

      const [organiser, own, preview] = await Promise.all([
        ctx.db.query.users.findFirst({
          where: eq(users.id, row.organiserId),
          columns: {
            id: true,
            naam: true,
            name: true,
            avatarUrl: true,
            sector: true,
          },
        }),
        userId
          ? ctx.db.query.eventAttendees.findFirst({
              where: and(
                eq(eventAttendees.eventId, row.id),
                eq(eventAttendees.userId, userId),
              ),
              columns: { status: true, offerExpiresAt: true },
            })
          : Promise.resolve(undefined),
        // Deelnemersavatars alleen voor leden (privacy: niet op de publieke pagina).
        userId
          ? ctx.db
              .select({
                id: users.id,
                naam: users.naam,
                name: users.name,
                avatarUrl: users.avatarUrl,
              })
              .from(eventAttendees)
              .innerJoin(users, eq(users.id, eventAttendees.userId))
              .where(
                and(
                  eq(eventAttendees.eventId, row.id),
                  inArray(eventAttendees.status, ["registered", "checked_in"]),
                ),
              )
              .orderBy(asc(eventAttendees.createdAt))
              .limit(12)
          : Promise.resolve([]),
      ]);

      // Ticketed: prijsindicatie + eigen geldige tickets (op account of e-mail).
      let priceFrom: number | null = null;
      let myTicketCount = 0;
      if (row.ticketed) {
        const [p] = await ctx.db
          .select({
            min: sql<number | null>`min(${eventTickets.priceCents})::int`,
          })
          .from(eventTickets)
          .where(
            and(
              eq(eventTickets.eventId, row.id),
              eq(eventTickets.isHidden, false),
            ),
          );
        priceFrom = p?.min ?? null;
        if (userId) {
          const email = ctx.session?.user?.email?.toLowerCase() ?? null;
          const [c] = await ctx.db
            .select({ n: sql<number>`count(*)::int` })
            .from(eventIssuedTickets)
            .where(
              and(
                eq(eventIssuedTickets.eventId, row.id),
                eq(eventIssuedTickets.status, "valid"),
                email
                  ? or(
                      eq(eventIssuedTickets.userId, userId),
                      sql`lower(${eventIssuedTickets.holderEmail}) = ${email}`,
                    )
                  : eq(eventIssuedTickets.userId, userId),
              ),
            );
          myTicketCount = c?.n ?? 0;
        }
      }

      const myStatus = own?.status ?? null;
      const holdsSeat = myStatus === "registered" || myStatus === "checked_in";
      const { meetingUrl, ...publicRow } = row;

      return {
        access: "ok" as const,
        event: {
          ...withPhase(publicRow),
          // Deelnamelink alleen voor wie een plek heeft (of beheert).
          meetingUrl:
            holdsSeat || myTicketCount > 0 || canManage ? meetingUrl : null,
          hasMeetingUrl: !!meetingUrl,
          priceFrom,
        },
        organiser: organiser ?? null,
        attendeesPreview: preview,
        me: userId
          ? {
              status: myStatus,
              offerExpiresAt: own?.offerExpiresAt ?? null,
              canManage,
              ticketCount: myTicketCount,
            }
          : null,
      };
    }),

  /** Compat voor bestaande links op id. */
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.events.findFirst({
        where: eq(events.id, input.id),
        columns: { id: true, slug: true },
      });
    }),

  // ── Deelnemer ────────────────────────────────────────────────────────────

  rsvp: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });
      if (!event || event.status === "draft") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event niet gevonden",
        });
      }
      const [counts] = await ctx.db
        .select({ seatsTaken, ticketed })
        .from(events)
        .where(eq(events.id, event.id));
      const phase = derivePhase(event, counts?.seatsTaken ?? 0);
      if (!acceptsRegistrations(phase)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aanmelden is voor dit event niet (meer) mogelijk",
        });
      }
      if (counts?.ticketed && phase !== "sold_out") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kies een ticket om je aan te melden",
        });
      }

      const outcome = await registerAttendee(ctx.db, event.id, ctx.userId, {
        waitlistOnly: !!counts?.ticketed,
      });
      if (outcome.status === "closed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aanmelden is voor dit event niet (meer) mogelijk",
        });
      }
      if (
        outcome.created &&
        (outcome.status === "registered" || outcome.status === "waitlisted")
      ) {
        await notifyRegistration(ctx.db, event, ctx.userId, outcome.status);
      }
      return { status: outcome.status };
    }),

  cancelRsvp: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });
      if (!event)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event niet gevonden",
        });
      const changed = await cancelAttendee(ctx.db, event.id, ctx.userId);
      if (changed && event.status === "published") {
        const result = await fillOpenSpots(ctx.db, event);
        await notifyFillResult(ctx.db, event, result);
      }
      return { success: true };
    }),

  acceptOffer: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [t] = await ctx.db
        .select({ ticketed })
        .from(events)
        .where(eq(events.id, input.eventId));
      if (t?.ticketed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bevestig je plek door een ticket te kiezen",
        });
      }
      const ok = await acceptOffer(ctx.db, input.eventId, ctx.userId);
      if (!ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dit aanbod is verlopen of niet meer geldig",
        });
      }
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });
      if (event)
        await notifyRegistration(ctx.db, event, ctx.userId, "registered");
      return { status: "registered" as const };
    }),

  /** Komende events waar ik me voor heb aangemeld (incl. wachtlijst en aanbiedingen). */
  myRegistrations: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        ...cardColumns,
        myStatus: eventAttendees.status,
        offerExpiresAt: eventAttendees.offerExpiresAt,
      })
      .from(eventAttendees)
      .innerJoin(events, eq(events.id, eventAttendees.eventId))
      .where(
        and(
          eq(eventAttendees.userId, ctx.userId),
          inArray(eventAttendees.status, [
            "registered",
            "checked_in",
            "offered",
            "waitlisted",
          ]),
          sql`COALESCE(${events.endAt}, ${events.startAt} + interval '3 hours') > now()`,
          inArray(events.status, ["published", "cancelled"]),
        ),
      )
      .orderBy(asc(events.startAt))
      .limit(50);
    return rows.map(withPhase);
  }),

  /** Persoonlijke, abonneerbare agenda-feed (webcal). */
  calendarFeed: protectedProcedure.query(({ ctx }) => {
    const token = signCalendarToken(ctx.userId);
    const https = `${APP_URL}/api/calendar/${token}`;
    return { https, webcal: https.replace(/^https?:/, "webcal:") };
  }),

  // ── Organisator ──────────────────────────────────────────────────────────

  mine: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select(cardColumns)
      .from(events)
      .where(eq(events.organiserId, ctx.userId))
      .orderBy(desc(events.startAt))
      .limit(100);
    return rows.map(withPhase);
  }),

  /** Beheerweergave op slug of id: event + tellers. */
  forEdit: protectedProcedure
    .input(z.object({ slug: z.string().min(1).max(200) }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.events.findFirst({
        where: or(eq(events.slug, input.slug), eq(events.id, input.slug)),
        columns: { id: true },
      });
      if (!found)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event niet gevonden",
        });
      const event = await requireManager(ctx, found.id);
      const [counts] = await ctx.db
        .select({ seatsTaken, waitlistCount })
        .from(events)
        .where(eq(events.id, event.id));
      const seats = counts?.seatsTaken ?? 0;
      return {
        ...event,
        seatsTaken: seats,
        waitlistCount: counts?.waitlistCount ?? 0,
        phase: derivePhase(event, seats),
      };
    }),

  create: proProcedure
    .input(eventInput.and(z.object({ publish: z.boolean().default(false) })))
    .mutation(async ({ ctx, input }) => {
      assertTimezone(input.timezone);
      const { publish, memberFree, ...data } = input;
      const coords =
        data.format !== "online" && data.location
          ? await geocode(data.location)
          : null;
      const [event] = await ctx.db
        .insert(events)
        .values({
          ...data,
          memberFree: isAdmin(ctx) ? (memberFree ?? true) : true,
          isOnline: data.format === "online",
          maxAttendees: data.maxAttendees ?? null,
          startAt: new Date(data.startAt),
          endAt: data.endAt ? new Date(data.endAt) : null,
          slug: uniqueSlug(data.title),
          organiserId: ctx.userId,
          status: publish ? "published" : "draft",
          isPublished: publish,
          publishedAt: publish ? new Date() : null,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        })
        .returning();
      return event!;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: eventInput }))
    .mutation(async ({ ctx, input }) => {
      const before = await requireManager(ctx, input.id);
      if (before.status === "cancelled") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Een geannuleerd event kan niet meer worden gewijzigd",
        });
      }
      assertTimezone(input.data.timezone);
      const { memberFree, ...d } = input.data;
      const startAt = new Date(d.startAt);
      const endAt = d.endAt ? new Date(d.endAt) : null;
      const maxAttendees = d.maxAttendees ?? null;

      if (maxAttendees !== null && before.maxAttendees !== maxAttendees) {
        const [c] = await ctx.db
          .select({ seatsTaken })
          .from(events)
          .where(eq(events.id, before.id));
        if ((c?.seatsTaken ?? 0) > maxAttendees) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Er zijn al ${c?.seatsTaken} plekken bezet; verlaag het maximum niet onder dat aantal`,
          });
        }
      }

      const locationChanged =
        (d.location ?? null) !== before.location || d.format !== before.format;
      const coords =
        locationChanged && d.format !== "online" && d.location
          ? await geocode(d.location)
          : null;

      const [after] = await ctx.db
        .update(events)
        .set({
          ...d,
          ...(isAdmin(ctx) && memberFree !== undefined ? { memberFree } : {}),
          isOnline: d.format === "online",
          location: d.location ?? null,
          meetingUrl: d.meetingUrl ?? null,
          coverImageUrl: d.coverImageUrl ?? null,
          description: d.description ?? null,
          regio: d.regio ?? null,
          thema: d.thema ?? null,
          startAt,
          endAt,
          maxAttendees,
          updatedAt: new Date(),
          ...(locationChanged
            ? {
                latitude: coords?.latitude ?? null,
                longitude: coords?.longitude ?? null,
              }
            : {}),
        })
        .where(eq(events.id, before.id))
        .returning();

      if (after && after.status === "published") {
        const changes: string[] = [];
        if (
          startAt.getTime() !== before.startAt.getTime() ||
          (endAt?.getTime() ?? null) !== (before.endAt?.getTime() ?? null)
        )
          changes.push("de datum of tijd");
        if (locationChanged) changes.push("de locatie");
        if ((d.meetingUrl ?? null) !== before.meetingUrl)
          changes.push("de deelnamelink");
        if (changes.length > 0)
          await notifyChange(ctx.db, after, changes.join(" en "));

        const capacityGrew =
          before.maxAttendees !== null &&
          (maxAttendees === null || maxAttendees > before.maxAttendees);
        if (capacityGrew)
          await notifyFillResult(
            ctx.db,
            after,
            await fillOpenSpots(ctx.db, after),
          );
      }
      return after!;
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.id);
      if (event.status !== "draft")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Alleen een concept kan worden gepubliceerd",
        });
      if (event.startAt <= new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "De starttijd ligt in het verleden",
        });
      const [updated] = await ctx.db
        .update(events)
        .set({
          status: "published",
          isPublished: true,
          publishedAt: event.publishedAt ?? new Date(),
          updatedAt: new Date(),
        })
        .where(eq(events.id, event.id))
        .returning();
      return updated!;
    }),

  /** Terug naar concept; alleen zolang niemand zich heeft aangemeld. */
  unpublish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.id);
      const [c] = await ctx.db
        .select({ seatsTaken, waitlistCount })
        .from(events)
        .where(eq(events.id, event.id));
      if ((c?.seatsTaken ?? 0) + (c?.waitlistCount ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Er zijn al aanmeldingen. Annuleer het event in plaats van het te depubliceren.",
        });
      }
      const [updated] = await ctx.db
        .update(events)
        .set({ status: "draft", isPublished: false, updatedAt: new Date() })
        .where(eq(events.id, event.id))
        .returning();
      return updated!;
    }),

  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await requireManager(ctx, input.id);
      if (event.status === "cancelled") return { notified: 0 };
      const [updated] = await ctx.db
        .update(events)
        .set({
          status: "cancelled",
          isPublished: false,
          cancelledAt: new Date(),
          cancellationReason: input.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(events.id, event.id))
        .returning();
      // Eerst informeren (RSVP'ers én tickethouders, terwijl hun tickets nog geldig zijn)…
      const notified =
        event.status === "published"
          ? await notifyCancellation(ctx.db, updated!, input.reason ?? null)
          : 0;
      // …dan tickets automatisch terugbetalen (plan §4.2). Per bestelling, zodat één Stripe-fout
      // de rest niet blokkeert; mislukte bestellingen blijven zichtbaar in het ticketbeheer.
      const orders = await ctx.db.query.eventOrders.findMany({
        where: and(
          eq(eventOrders.eventId, event.id),
          inArray(eventOrders.status, ["paid", "free"]),
        ),
      });
      let refundFailures = 0;
      for (const order of orders) {
        try {
          await refundTickets(ctx.db, order, "all", "Event geannuleerd");
        } catch (err) {
          refundFailures++;
          console.error(
            `[events.cancel] terugbetaling ${order.id} mislukt:`,
            err,
          );
        }
      }
      return {
        notified,
        refunded: orders.length - refundFailures,
        refundFailures,
      };
    }),

  /** Volledige deelnemerslijst voor organisator (check-in, export). */
  attendees: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireManager(ctx, input.eventId);
      return ctx.db
        .select({
          id: eventAttendees.id,
          status: eventAttendees.status,
          createdAt: eventAttendees.createdAt,
          offerExpiresAt: eventAttendees.offerExpiresAt,
          user: {
            id: users.id,
            naam: users.naam,
            name: users.name,
            avatarUrl: users.avatarUrl,
            email: users.email,
          },
        })
        .from(eventAttendees)
        .innerJoin(users, eq(users.id, eventAttendees.userId))
        .where(
          and(
            eq(eventAttendees.eventId, input.eventId),
            inArray(eventAttendees.status, [
              "registered",
              "checked_in",
              "offered",
              "waitlisted",
            ]),
          ),
        )
        .orderBy(asc(eventAttendees.createdAt));
    }),

  // ── Beheer ───────────────────────────────────────────────────────────────

  adminList: adminProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "cancelled"]).optional(),
        format: z.enum(["in_person", "online", "hybrid"]).optional(),
        when: z.enum(["upcoming", "past"]).optional(),
        q: z.string().trim().max(100).optional(),
        sort: z
          .enum(["datum_nieuw", "datum_oud", "titel"])
          .default("datum_nieuw"),
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conds = [];
      if (input.status) conds.push(eq(events.status, input.status));
      if (input.format) conds.push(eq(events.format, input.format));
      if (input.when === "upcoming")
        conds.push(gte(events.startAt, new Date()));
      if (input.when === "past") conds.push(lt(events.startAt, new Date()));
      // Elk woord moet in minstens één veld voorkomen (titel, locatie, regio, thema, organisator).
      for (const word of (input.q ?? "").split(/\s+/).filter(Boolean)) {
        const pattern = `%${word.replace(/[\\%_]/g, "\\$&")}%`;
        conds.push(
          or(
            ilike(events.title, pattern),
            ilike(events.location, pattern),
            ilike(events.regio, pattern),
            ilike(events.thema, pattern),
            ilike(users.naam, pattern),
            ilike(users.name, pattern),
          ),
        );
      }
      const where = conds.length > 0 ? and(...conds) : undefined;
      const orderBy = {
        datum_nieuw: desc(events.startAt),
        datum_oud: asc(events.startAt),
        titel: asc(events.title),
      }[input.sort];

      const [rows, [totaal]] = await Promise.all([
        ctx.db
          .select({
            ...cardColumns,
            organiserNaam: users.naam,
            organiserName: users.name,
          })
          .from(events)
          .innerJoin(users, eq(users.id, events.organiserId))
          .where(where)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ n: sql<number>`count(*)::int` })
          .from(events)
          .innerJoin(users, eq(users.id, events.organiserId))
          .where(where),
      ]);
      return { items: rows.map(withPhase), total: totaal?.n ?? 0 };
    }),
});
