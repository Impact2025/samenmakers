import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";
import { api } from "@/trpc/server";
import { breadcrumbSchema, eventSchema } from "@/lib/seo-kit";
import { FORMAT_LABEL, eventWhere, formatEventWhen } from "@/lib/event-format";
import { PHASE_LABEL, effectiveEnd } from "@/server/events/status";
import { calendarLinks } from "@/server/events/ics";
import { formatEuro } from "@/server/events/pricing";
import { features } from "@/lib/features";
import { siteHref } from "@/components/site/site-config";
import { cn } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// Eén query per request, gedeeld door generateMetadata en de pagina.
const load = cache((slug: string) =>
  api.events.bySlug({ slug: decodeURIComponent(slug) }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (data.access === "not_found") return { title: "Event niet gevonden" };
  if (data.access === "login_required")
    return { title: data.title, robots: { index: false } };
  const e = data.event;
  const description =
    (e.description ?? "").replace(/\s+/g, " ").slice(0, 155) ||
    `${formatEventWhen(e.startAt, e.endAt, e.timezone)} · ${eventWhere(e)}`;
  return {
    title: `${e.title} | We Shape the Future`,
    description,
    alternates: { canonical: `${APP_URL}/events/${e.slug}` },
    robots:
      e.visibility === "public" && e.status !== "draft"
        ? undefined
        : { index: false, follow: false },
    openGraph: {
      title: e.title,
      description,
      type: "website",
      ...(e.coverImageUrl ? { images: [{ url: e.coverImageUrl }] } : {}),
    },
  };
}

export default async function SiteEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (data.access === "not_found") notFound();

  if (data.access === "login_required") {
    return (
      <section className="event-detail">
        <div className="event-detail__inner">
          <div className="event-notice">
            <p className="event-detail__eyebrow">Alleen voor leden</p>
            <h1 className="event-detail__title event-detail__title--plain">
              {data.title}
            </h1>
            <p>Log in om dit event te bekijken en je aan te melden.</p>
            <Link
              className="cta__button"
              href={`/inloggen?next=${encodeURIComponent(siteHref(`/events/${data.slug}`))}`}
            >
              <span className="cta__button-text">Inloggen</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { event: e, organiser, me } = data;
  if (decodeURIComponent(slug) !== e.slug)
    permanentRedirect(siteHref(`/events/${e.slug}`));

  const url = `${APP_URL}/events/${e.slug}`;
  const where = eventWhere(e);
  const organiserNaam =
    organiser?.naam ?? organiser?.name ?? "We Shape the Future";
  const links = calendarLinks({
    id: e.id,
    title: e.title,
    description: e.description,
    location: where,
    url,
    startAt: e.startAt,
    endAt: e.endAt,
  });

  const jsonLd = [
    eventSchema({
      url,
      name: e.title,
      description: e.description ?? e.title,
      startDate: e.startAt.toISOString(),
      endDate: effectiveEnd(e.startAt, e.endAt).toISOString(),
      ...(e.coverImageUrl ? { image: e.coverImageUrl } : {}),
      attendance:
        e.format === "online"
          ? "online"
          : e.format === "hybrid"
            ? "mixed"
            : "offline",
      status: e.status === "cancelled" ? "cancelled" : "scheduled",
      ...(e.location ? { locationName: e.location, address: e.location } : {}),
      ...(e.latitude !== null && e.longitude !== null
        ? { latitude: e.latitude, longitude: e.longitude }
        : {}),
      organizerName: organiserNaam,
      offerUrl: e.ticketed ? `${url}/bestellen` : url,
      ...(e.priceFrom !== null ? { price: e.priceFrom / 100 } : {}),
      availability: e.phase === "sold_out" ? "SoldOut" : "InStock",
    }),
    breadcrumbSchema([
      { name: "We Shape the Future", url: APP_URL },
      { name: "Events", url: `${APP_URL}/events` },
      { name: e.title, url },
    ]),
  ];

  const mapBox =
    e.latitude !== null && e.longitude !== null
      ? [
          e.longitude - 0.01,
          e.latitude - 0.006,
          e.longitude + 0.01,
          e.latitude + 0.006,
        ].join(",")
      : null;

  const canRegister = e.phase === "open" || e.phase === "sold_out";
  const ticketed = e.ticketed && features.eventTickets;
  const left =
    e.maxAttendees !== null ? Math.max(0, e.maxAttendees - e.seatsTaken) : null;
  const registered =
    me?.status === "registered" ||
    me?.status === "checked_in" ||
    me?.status === "converted";
  const waitlisted = me?.status === "waitlisted";

  // De transactie (aanmelden, tickets, wachtlijst) loopt via de flow van de app.
  const ctaHref =
    ticketed && e.phase === "open"
      ? `/events/${e.slug}/bestellen`
      : `/events/${e.slug}`;
  const ctaLabel =
    ticketed && e.phase === "open"
      ? e.priceFrom
        ? `Bestel tickets vanaf ${formatEuro(e.priceFrom)}`
        : "Bestel tickets"
      : e.phase === "sold_out"
        ? "Zet me op de wachtlijst"
        : "Meld je aan";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        className={cn("event-hero", !e.coverImageUrl && "event-hero--empty")}
      >
        {e.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="event-hero__image" src={e.coverImageUrl} alt="" />
        )}
        <div className="event-hero__shade" />
        <div className="event-hero__inner">
          <Link className="event-hero__back" href={siteHref("/events")}>
            <ChevronLeft aria-hidden="true" /> Alle events
          </Link>
          <div className="event-hero__tags">
            <span className="event-tag">{FORMAT_LABEL[e.format]}</span>
            {e.thema && (
              <span className="event-tag event-tag--accent">{e.thema}</span>
            )}
            {e.phase !== "open" && (
              <span className="event-tag event-tag--warn">
                {PHASE_LABEL[e.phase]}
              </span>
            )}
          </div>
          <h1 className="event-hero__title">{e.title}</h1>
        </div>
      </section>

      <section className="event-detail">
        <div className="event-detail__inner">
          {e.status === "cancelled" && (
            <div className="event-notice event-notice--warn" role="status">
              <strong>Dit event is geannuleerd.</strong>
              {e.cancellationReason && <span> {e.cancellationReason}</span>}
            </div>
          )}

          <div className="event-detail__layout">
            <div className="event-detail__main">
              {e.description && (
                <div className="event-block">
                  <h2 className="event-block__title">Over dit event</h2>
                  <p className="event-block__text">{e.description}</p>
                </div>
              )}

              {mapBox && e.format !== "online" && (
                <div className="event-block">
                  <h2 className="event-block__title">Locatie</h2>
                  <p className="event-block__text">
                    <MapPin className="event-inline-icon" aria-hidden="true" />
                    {e.location}
                  </p>
                  <iframe
                    className="event-map"
                    title={`Kaart: ${e.location ?? e.title}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBox}&layer=mapnik&marker=${e.latitude},${e.longitude}`}
                    loading="lazy"
                  />
                  <a
                    className="event-link"
                    href={`https://www.openstreetmap.org/?mlat=${e.latitude}&mlon=${e.longitude}#map=16/${e.latitude}/${e.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Route plannen <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              )}

              <div className="event-block">
                <h2 className="event-block__title">Organisator</h2>
                <p className="event-block__text">
                  <strong>{organiserNaam}</strong>
                  {organiser?.sector && <> · {organiser.sector}</>}
                </p>
              </div>
            </div>

            <aside className="event-aside">
              <dl className="event-facts">
                <div className="event-fact">
                  <CalendarDays aria-hidden="true" />
                  <div>
                    <dt>Wanneer</dt>
                    <dd>
                      <time dateTime={e.startAt.toISOString()}>
                        {formatEventWhen(e.startAt, e.endAt, e.timezone)}
                      </time>
                    </dd>
                  </div>
                </div>
                <div className="event-fact">
                  {e.format === "online" ? (
                    <Monitor aria-hidden="true" />
                  ) : (
                    <MapPin aria-hidden="true" />
                  )}
                  <div>
                    <dt>Waar</dt>
                    <dd>{where}</dd>
                  </div>
                </div>
                <div className="event-fact">
                  <Users aria-hidden="true" />
                  <div>
                    <dt>Deelnemers</dt>
                    <dd>
                      {e.seatsTaken}{" "}
                      {e.seatsTaken === 1 ? "deelnemer" : "deelnemers"}
                      {e.maxAttendees ? ` van ${e.maxAttendees}` : ""}
                      {e.waitlistCount > 0
                        ? ` · ${e.waitlistCount} wachtlijst`
                        : ""}
                    </dd>
                  </div>
                </div>
              </dl>

              {registered && (
                <p className="event-status event-status--ok">
                  <Check aria-hidden="true" /> Je bent aangemeld voor dit event
                </p>
              )}
              {waitlisted && (
                <p className="event-status">Je staat op de wachtlijst</p>
              )}

              {canRegister && !registered && !waitlisted && (
                <>
                  {left !== null && left > 0 && left <= 5 && (
                    <p className="event-status event-status--warn">
                      Nog {left} {left === 1 ? "plek" : "plekken"} beschikbaar
                    </p>
                  )}
                  <Link className="event-aside__cta" href={ctaHref}>
                    {ctaLabel}
                  </Link>
                </>
              )}
              {(registered || waitlisted) && (
                <Link
                  className="event-aside__cta event-aside__cta--ghost"
                  href={ctaHref}
                >
                  Beheer mijn aanmelding
                </Link>
              )}

              {e.phase !== "ended" && e.status !== "cancelled" && (
                <div className="event-cal">
                  <p className="event-cal__label">
                    <CalendarPlus aria-hidden="true" /> Zet in je agenda
                  </p>
                  <div className="event-cal__links">
                    <a href={`/api/events/${e.id}/ics`}>Agenda (.ics)</a>
                    <a
                      href={links.google}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google
                    </a>
                    <a
                      href={links.outlook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Outlook
                    </a>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
