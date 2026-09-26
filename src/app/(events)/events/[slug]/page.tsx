import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  MapPin,
  Monitor,
  Users,
  Settings,
} from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { breadcrumbSchema, eventSchema } from "@/lib/seo-kit";
import { FORMAT_LABEL, eventWhere, formatEventWhen } from "@/lib/event-format";
import { PHASE_LABEL, effectiveEnd } from "@/server/events/status";
import { calendarLinks } from "@/server/events/ics";
import { features } from "@/lib/features";
import { RsvpPanel } from "./rsvp-panel";
import { ShareButton } from "./share-button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

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
  const url = `${APP_URL}/events/${e.slug}`;
  const description =
    (e.description ?? "").replace(/\s+/g, " ").slice(0, 155) ||
    `${formatEventWhen(e.startAt, e.endAt, e.timezone)} · ${eventWhere(e)}`;
  return {
    title: e.title,
    description,
    alternates: { canonical: url },
    // Alleen publieke, gepubliceerde events in de index.
    robots:
      e.visibility === "public" && e.status !== "draft"
        ? undefined
        : { index: false, follow: false },
    openGraph: {
      title: e.title,
      description,
      url,
      type: "website",
      ...(e.coverImageUrl ? { images: [{ url: e.coverImageUrl }] } : {}),
    },
    twitter: { card: "summary_large_image", title: e.title, description },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (data.access === "not_found") notFound();
  if (data.access === "login_required") {
    return (
      <div className="bg-surface-container-lowest shadow-card max-w-xl rounded-2xl p-8">
        <p className="text-label-md text-secondary mb-2">ALLEEN VOOR LEDEN</p>
        <h1 className="text-headline-lg text-on-surface mb-4">{data.title}</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          Log in om dit event te bekijken en je aan te melden.
        </p>
        <Link
          href={`/inloggen?next=${encodeURIComponent(`/events/${data.slug}`)}`}
          className="bg-primary-container text-on-primary text-label-md inline-block px-6 py-3"
        >
          Inloggen
        </Link>
      </div>
    );
  }

  const { event: e, organiser, attendeesPreview, me } = data;
  // Oude links op id → canonieke slug-URL.
  if (decodeURIComponent(slug) !== e.slug)
    permanentRedirect(`/events/${e.slug}`);

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

  const infoRow = "flex items-start gap-3";
  const infoIcon =
    "w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0";

  return (
    <article className="flex flex-col gap-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Kruimelpad"
        className="text-label-md text-secondary flex items-center gap-1"
      >
        <Link
          href="/events"
          className="hover:text-primary-container inline-flex items-center gap-1"
        >
          <ChevronLeft size={16} aria-hidden /> Evenementen
        </Link>
      </nav>

      {e.status === "cancelled" && (
        <div className="bg-error-container rounded-2xl p-4" role="status">
          <p className="text-title-md text-on-error-container">
            Dit event is geannuleerd
          </p>
          {e.cancellationReason && (
            <p className="text-body-md text-on-error-container mt-1">
              {e.cancellationReason}
            </p>
          )}
        </div>
      )}
      {e.status === "draft" && (
        <div
          className="border-outline-variant bg-surface-container-low text-body-md text-on-surface-variant rounded-2xl border border-dashed p-4"
          role="status"
        >
          Dit is een concept en alleen zichtbaar voor jou. Publiceer het via
          Beheren.
        </div>
      )}

      {/* Hero */}
      <div className="from-primary-container to-primary shadow-elevated relative overflow-hidden rounded-2xl bg-gradient-to-br">
        {e.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="from-inverse-surface/90 via-inverse-surface/40 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="relative flex min-h-56 flex-col justify-end gap-3 p-5 sm:min-h-72 sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-surface-container-lowest/90 text-label-sm text-on-surface rounded-full px-2.5 py-1 uppercase backdrop-blur-md">
              {FORMAT_LABEL[e.format]}
            </span>
            {e.thema && (
              <span className="bg-primary-container text-label-sm text-on-primary rounded-full px-2.5 py-1 uppercase">
                {e.thema}
              </span>
            )}
            {e.phase !== "open" && (
              <span className="bg-tertiary-fixed text-label-sm text-on-tertiary-fixed-variant rounded-full px-2.5 py-1 uppercase">
                {PHASE_LABEL[e.phase]}
              </span>
            )}
          </div>
          <h1 className="text-headline-lg sm:text-display-lg text-inverse-on-surface">
            {e.title}
          </h1>
        </div>
      </div>

      {/* Kerngegevens */}
      <dl className="bg-surface-container-lowest shadow-card grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
        <div className={infoRow}>
          <span className={infoIcon}>
            <CalendarDays size={20} aria-hidden />
          </span>
          <div>
            <dt className="text-label-sm text-secondary uppercase">Wanneer</dt>
            <dd className="text-body-md text-on-surface">
              <time dateTime={e.startAt.toISOString()}>
                {formatEventWhen(e.startAt, e.endAt, e.timezone)}
              </time>
            </dd>
          </div>
        </div>
        <div className={infoRow}>
          <span className={infoIcon}>
            {e.format === "online" ? (
              <Monitor size={20} aria-hidden />
            ) : (
              <MapPin size={20} aria-hidden />
            )}
          </span>
          <div>
            <dt className="text-label-sm text-secondary uppercase">Waar</dt>
            <dd className="text-body-md text-on-surface">{where}</dd>
          </div>
        </div>
        <div className={infoRow}>
          <span className={infoIcon}>
            <Users size={20} aria-hidden />
          </span>
          <div>
            <dt className="text-label-sm text-secondary uppercase">
              Deelnemers
            </dt>
            <dd className="text-body-md text-on-surface">
              {e.seatsTaken} {e.seatsTaken === 1 ? "deelnemer" : "deelnemers"}
              {e.maxAttendees ? ` van ${e.maxAttendees}` : ""}
              {e.waitlistCount > 0 ? ` · ${e.waitlistCount} wachtlijst` : ""}
            </dd>
          </div>
        </div>
      </dl>

      <RsvpPanel
        eventId={e.id}
        slug={e.slug}
        phase={e.phase}
        me={me}
        meetingUrl={e.meetingUrl}
        hasMeetingUrl={e.hasMeetingUrl}
        format={e.format}
        ticketed={e.ticketed && features.eventTickets}
        priceFrom={e.priceFrom}
      />

      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/events/${e.id}/ics`}
          className={buttonClasses("secondary", "sm")}
        >
          <CalendarPlus size={16} aria-hidden /> Agenda (.ics)
        </a>
        <a
          href={links.google}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "sm")}
        >
          Google Agenda
        </a>
        <a
          href={links.outlook}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "sm")}
        >
          Outlook
        </a>
        <ShareButton url={url} title={e.title} />
        {me?.canManage && (
          <Link
            href={`/events/${e.slug}/beheer`}
            className={buttonClasses("dark", "sm")}
          >
            <Settings size={16} aria-hidden /> Beheren
          </Link>
        )}
      </div>

      {e.description && (
        <section className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
          <h2 className="text-headline-sm text-on-surface mb-2">
            Over dit event
          </h2>
          <p className="text-body-lg text-on-surface-variant whitespace-pre-line">
            {e.description}
          </p>
        </section>
      )}

      {mapBox && e.format !== "online" && (
        <section className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-5">
          <h2 className="text-headline-sm text-on-surface">Locatie</h2>
          <p className="bg-surface-container-low text-body-md text-on-surface flex items-center gap-1.5 rounded-lg p-2">
            <MapPin
              size={18}
              className="text-primary-container shrink-0"
              aria-hidden
            />
            {e.location}
          </p>
          <iframe
            title={`Kaart: ${e.location ?? e.title}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBox}&layer=mapnik&marker=${e.latitude},${e.longitude}`}
            className="h-64 w-full rounded-xl"
            loading="lazy"
          />
          <a
            href={`https://www.openstreetmap.org/?mlat=${e.latitude}&mlon=${e.longitude}#map=16/${e.latitude}/${e.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-lg text-primary-container inline-flex items-center gap-1"
          >
            Route plannen <ArrowRight size={16} aria-hidden />
          </a>
        </section>
      )}

      <section className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
        <h2 className="text-label-sm text-secondary mb-3 uppercase">
          Organisator
        </h2>
        <div className="bg-surface-container-low flex items-center gap-3 rounded-xl p-3">
          <Avatar
            src={organiser?.avatarUrl ?? null}
            naam={organiserNaam}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-title-md text-on-surface truncate">
              {organiserNaam}
            </p>
            {organiser?.sector && (
              <p className="text-body-sm text-secondary truncate">
                {organiser.sector}
              </p>
            )}
          </div>
        </div>
      </section>

      {attendeesPreview.length > 0 && (
        <section className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
          <h2 className="text-headline-sm text-on-surface mb-3">
            Wie komen er
          </h2>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {attendeesPreview.map((a) => (
                <Avatar
                  key={a.id}
                  src={a.avatarUrl}
                  naam={a.naam ?? a.name ?? "?"}
                  size="xs"
                  className="[&>div]:ring-surface-container-lowest [&>div]:ring-2"
                />
              ))}
            </div>
            {e.seatsTaken > attendeesPreview.length && (
              <span className="text-label-md text-secondary ml-3">
                +{e.seatsTaken - attendeesPreview.length} anderen
              </span>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
