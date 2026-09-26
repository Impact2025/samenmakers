// Mail + in-app meldingen rond events. Fouten bij versturen worden gelogd en
// nooit doorgegeven: een mislukte mail mag een boeking niet laten falen.
import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "@/server/db";
import { eventAttendees, eventIssuedTickets, users } from "@/server/db/schema";
import { createNotification } from "@/lib/notify";
import { sendEventEmail } from "@/lib/email";
import { eventWhere, formatEventWhen } from "@/lib/event-format";
import { buildIcs } from "./ics";
import type { FillResult } from "./booking";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export interface NotifiableEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  format: "in_person" | "online" | "hybrid";
  startAt: Date;
  endAt: Date | null;
  timezone: string;
  updatedAt: Date;
  status: "draft" | "published" | "cancelled";
}

export function eventUrl(e: { slug: string }) {
  return `${APP_URL}/events/${e.slug}`;
}

export function eventIcs(e: NotifiableEvent) {
  return buildIcs([
    {
      id: e.id,
      title: e.title,
      description: e.description,
      location: eventWhere(e),
      url: eventUrl(e),
      startAt: e.startAt,
      endAt: e.endAt,
      updatedAt: e.updatedAt,
      cancelled: e.status === "cancelled",
    },
  ]);
}

function summary(e: NotifiableEvent) {
  return {
    title: e.title,
    when: formatEventWhen(e.startAt, e.endAt, e.timezone),
    where: eventWhere(e),
  };
}

// createNotification is getypeerd op de postgres-js-driver; de API is gelijk.
type NotifyDb = Parameters<typeof createNotification>[0];

async function emailsFor(db: Database, userIds: string[]) {
  if (userIds.length === 0)
    return new Map<string, { email: string | null; naam: string }>();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      naam: users.naam,
      name: users.name,
    })
    .from(users)
    .where(inArray(users.id, userIds));
  return new Map(
    rows.map((r) => [
      r.id,
      { email: r.email, naam: r.naam ?? r.name ?? "Maker" },
    ]),
  );
}

async function safe(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.error(`[events/notify] ${label} mislukt:`, err);
  }
}

export async function notifyRegistration(
  db: Database,
  e: NotifiableEvent,
  userId: string,
  status: "registered" | "waitlisted",
) {
  const url = eventUrl(e);
  const people = await emailsFor(db, [userId]);
  const person = people.get(userId);
  const registered = status === "registered";

  await safe("in-app bevestiging", () =>
    createNotification(db as unknown as NotifyDb, {
      userId,
      type: "event_reminder",
      title: registered ? "Je bent aangemeld" : "Je staat op de wachtlijst",
      body: registered
        ? `Tot bij ${e.title}!`
        : `${e.title} is vol. Komt er een plek vrij, dan bieden we die je aan.`,
      url: `/events/${e.slug}`,
    }),
  );
  if (!person?.email) return;
  await safe("bevestigingsmail", () =>
    sendEventEmail({
      to: person.email!,
      subject: registered
        ? `Bevestiging: ${e.title}`
        : `Wachtlijst: ${e.title}`,
      heading: registered
        ? `Je bent erbij, ${person.naam}!`
        : "Je staat op de wachtlijst",
      intro: registered
        ? "Je aanmelding is bevestigd. Het event staat als bijlage klaar voor je agenda; we sturen je vooraf nog een herinnering."
        : "Het event is op dit moment vol. Komt er een plek vrij, dan krijg je die als eerste in de rij aangeboden per mail en melding.",
      event: summary(e),
      cta: { label: "Bekijk event", url },
      ...(registered ? { ics: eventIcs(e) } : {}),
    }),
  );
}

export async function notifyFillResult(
  db: Database,
  e: NotifiableEvent,
  r: FillResult,
) {
  const all = [...r.expired, ...r.promoted, ...r.offered.map((o) => o.userId)];
  if (all.length === 0) return;
  const people = await emailsFor(db, all);
  const url = eventUrl(e);

  for (const o of r.offered) {
    const deadline = formatEventWhen(o.expiresAt, null, e.timezone);
    const p = people.get(o.userId);
    await safe("aanbod in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId: o.userId,
        type: "event_reminder",
        title: "Er is een plek vrij!",
        body: `Bevestig je plek voor ${e.title} vóór ${deadline}.`,
        url: `/events/${e.slug}`,
      }),
    );
    if (p?.email) {
      await safe("aanbodmail", () =>
        sendEventEmail({
          to: p.email!,
          subject: `Plek vrij: ${e.title}`,
          heading: "Er is een plek voor je vrij",
          intro: `Je stond op de wachtlijst en nu is er ruimte. Bevestig je plek vóór ${deadline}; daarna gaat hij naar de volgende op de lijst.`,
          event: summary(e),
          cta: { label: "Plek bevestigen", url },
        }),
      );
    }
  }

  for (const userId of r.promoted) {
    const p = people.get(userId);
    await safe("doorschuif in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId,
        type: "event_reminder",
        title: "Plek vrijgekomen!",
        body: `Je staat nu ingeschreven voor ${e.title}.`,
        url: `/events/${e.slug}`,
      }),
    );
    if (p?.email) {
      await safe("doorschuifmail", () =>
        sendEventEmail({
          to: p.email!,
          subject: `Je bent ingeschreven: ${e.title}`,
          heading: "Je bent van de wachtlijst af",
          intro:
            "Er kwam vlak voor de start een plek vrij en die is voor jou. Kun je toch niet, meld je dan af zodat iemand anders kan komen.",
          event: summary(e),
          cta: { label: "Bekijk event", url },
          ics: eventIcs(e),
        }),
      );
    }
  }

  for (const userId of r.expired) {
    await safe("verlopen in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId,
        type: "event_reminder",
        title: "Aanbod verlopen",
        body: `Je aangeboden plek voor ${e.title} is doorgegeven aan de volgende op de wachtlijst.`,
        url: `/events/${e.slug}`,
      }),
    );
  }
}

/** Iedereen die een plek heeft of op de wachtlijst staat. */
async function audience(db: Database, eventId: string) {
  const rows = await db
    .select({ userId: eventAttendees.userId })
    .from(eventAttendees)
    .where(
      and(
        eq(eventAttendees.eventId, eventId),
        inArray(eventAttendees.status, [
          "registered",
          "checked_in",
          "offered",
          "waitlisted",
        ]),
      ),
    );
  return rows.map((r) => r.userId);
}

/** Tickethouders (ook gasten), per e-mailadres ontdubbeld, zonder wie al via `ids` bericht krijgt. */
async function holders(db: Database, eventId: string, skipUserIds: string[]) {
  const rows = await db
    .selectDistinctOn([eventIssuedTickets.holderEmail], {
      email: eventIssuedTickets.holderEmail,
      name: eventIssuedTickets.holderName,
      userId: eventIssuedTickets.userId,
    })
    .from(eventIssuedTickets)
    .where(
      and(
        eq(eventIssuedTickets.eventId, eventId),
        eq(eventIssuedTickets.status, "valid"),
      ),
    );
  return rows.filter((r) => !r.userId || !skipUserIds.includes(r.userId));
}

export async function notifyCancellation(
  db: Database,
  e: NotifiableEvent,
  reason: string | null,
) {
  const ids = await audience(db, e.id);
  const people = await emailsFor(db, ids);
  for (const userId of ids) {
    await safe("annulering in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId,
        type: "event_reminder",
        title: "Event geannuleerd",
        body: `${e.title} gaat niet door.${reason ? ` ${reason}` : ""}`,
        url: `/events/${e.slug}`,
      }),
    );
    const p = people.get(userId);
    if (p?.email) {
      await safe("annuleringsmail", () =>
        sendEventEmail({
          to: p.email!,
          subject: `Geannuleerd: ${e.title}`,
          heading: "Dit event gaat niet door",
          intro: reason
            ? `De organisator heeft het event geannuleerd: ${reason}`
            : "De organisator heeft het event geannuleerd. Het agenda-item in de bijlage haalt het uit je agenda.",
          event: summary(e),
          cta: { label: "Andere events bekijken", url: `${APP_URL}/events` },
          ics: eventIcs(e),
        }),
      );
    }
  }
  // Tickethouders: tickets zijn op dit moment al terugbetaald (zie events.cancel).
  const extra = await holders(db, e.id, ids);
  for (const h of extra) {
    await safe("annuleringsmail ticket", () =>
      sendEventEmail({
        to: h.email,
        subject: `Geannuleerd: ${e.title}`,
        heading: "Dit event gaat niet door",
        intro: `${reason ? `De organisator heeft het event geannuleerd: ${reason}. ` : "De organisator heeft het event geannuleerd. "}Betaalde tickets worden automatisch terugbetaald; het bedrag staat binnen enkele werkdagen weer op je rekening.`,
        event: summary(e),
        cta: { label: "Andere events bekijken", url: `${APP_URL}/events` },
        ics: eventIcs(e),
      }),
    );
  }
  return ids.length + extra.length;
}

export async function notifyChange(
  db: Database,
  e: NotifiableEvent,
  what: string,
) {
  const ids = await audience(db, e.id);
  const people = await emailsFor(db, ids);
  for (const userId of ids) {
    await safe("wijziging in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId,
        type: "event_reminder",
        title: "Event gewijzigd",
        body: `${e.title}: ${what}`,
        url: `/events/${e.slug}`,
      }),
    );
    const p = people.get(userId);
    if (p?.email) {
      await safe("wijzigingsmail", () =>
        sendEventEmail({
          to: p.email!,
          subject: `Gewijzigd: ${e.title}`,
          heading: "Er is iets veranderd",
          intro: `De organisator heeft ${what} aangepast. Hieronder de actuele gegevens; de bijlage werkt je agenda bij.`,
          event: summary(e),
          cta: { label: "Bekijk event", url: eventUrl(e) },
          ics: eventIcs(e),
        }),
      );
    }
  }
  for (const h of await holders(db, e.id, ids)) {
    await safe("wijzigingsmail ticket", () =>
      sendEventEmail({
        to: h.email,
        subject: `Gewijzigd: ${e.title}`,
        heading: "Er is iets veranderd",
        intro: `De organisator heeft ${what} aangepast. Je ticket blijft geldig; de bijlage werkt je agenda bij.`,
        event: summary(e),
        cta: { label: "Bekijk event", url: eventUrl(e) },
        ics: eventIcs(e),
      }),
    );
  }
}

const REMINDER_COPY = {
  "7d": { subject: "Over een week", heading: "Nog een week te gaan" },
  "1d": { subject: "Morgen", heading: "Morgen is het zover" },
  "1h": { subject: "Over een uur", heading: "Zo begint het" },
} as const;

export async function sendReminder(
  db: Database,
  e: NotifiableEvent & { meetingUrl: string | null },
  userId: string | null,
  key: keyof typeof REMINDER_COPY,
  person: { email: string | null; naam: string },
) {
  const copy = REMINDER_COPY[key];
  const online = e.format !== "in_person" && e.meetingUrl;
  if (userId)
    await safe("herinnering in-app", () =>
      createNotification(db as unknown as NotifyDb, {
        userId,
        type: "event_reminder",
        title: `${copy.subject}: ${e.title}`,
        body: formatEventWhen(e.startAt, e.endAt, e.timezone),
        url: `/events/${e.slug}`,
      }),
    );
  if (!person.email) return;
  await safe("herinneringsmail", () =>
    sendEventEmail({
      to: person.email!,
      subject: `${copy.subject}: ${e.title}`,
      heading: copy.heading,
      intro:
        key === "1h" && online
          ? `Hoi ${person.naam}, over een uur begint het. Via de knop hieronder kom je direct in de sessie.`
          : `Hoi ${person.naam}, een herinnering aan je aanmelding. Kun je toch niet? Meld je af, dan geven we je plek aan iemand op de wachtlijst.`,
      event: summary(e),
      cta:
        key === "1h" && online
          ? { label: "Deelnemen", url: e.meetingUrl! }
          : { label: "Bekijk event", url: eventUrl(e) },
    }),
  );
}
