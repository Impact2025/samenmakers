import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { Calendar, MapPin, Monitor, Users, Settings } from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardBody } from "@/components/ui/card";
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
      <div className="border-hairline max-w-xl border bg-white p-8">
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

  return (
    <article className="max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Kruimelpad" className="text-body-md text-secondary">
        <Link href="/events" className="hover:text-on-surface">
          Events
        </Link>{" "}
        / <span className="text-on-surface-variant">{e.title}</span>
      </nav>

      {e.status === "cancelled" && (
        <div className="border-on-surface border bg-white p-4" role="status">
          <p className="text-on-surface font-extrabold">
            Dit event is geannuleerd
          </p>
          {e.cancellationReason && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {e.cancellationReason}
            </p>
          )}
        </div>
      )}
      {e.status === "draft" && (
        <div
          className="border-outline text-body-md text-on-surface-variant border border-dashed bg-white p-4"
          role="status"
        >
          Dit is een concept en alleen zichtbaar voor jou. Publiceer het via
          Beheren.
        </div>
      )}

      {e.coverImageUrl && (
        <div className="border-hairline bg-surface-container-low aspect-[2/1] w-full overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={e.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="space-y-4">
        <div className="text-label-md flex flex-wrap gap-2">
          <span className="border-hairline text-secondary border px-2 py-1">
            {FORMAT_LABEL[e.format]}
          </span>
          {e.thema && (
            <span className="border-hairline text-secondary border px-2 py-1">
              {e.thema}
            </span>
          )}
          {e.phase !== "open" && (
            <span className="bg-on-surface text-on-primary px-2 py-1">
              {PHASE_LABEL[e.phase]}
            </span>
          )}
        </div>
        <h1 className="text-headline-lg sm:text-display-lg text-on-surface">
          {e.title}
        </h1>
        <dl className="text-body-md text-on-surface-variant grid gap-2">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Wanneer</dt>
            <Calendar size={16} className="mt-1 shrink-0" aria-hidden />
            <dd>
              <time dateTime={e.startAt.toISOString()}>
                {formatEventWhen(e.startAt, e.endAt, e.timezone)}
              </time>
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Waar</dt>
            {e.format === "online" ? (
              <Monitor size={16} className="mt-1 shrink-0" aria-hidden />
            ) : (
              <MapPin size={16} className="mt-1 shrink-0" aria-hidden />
            )}
            <dd>{where}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Deelnemers</dt>
            <Users size={16} className="mt-1 shrink-0" aria-hidden />
            <dd>
              {e.seatsTaken} {e.seatsTaken === 1 ? "deelnemer" : "deelnemers"}
              {e.maxAttendees ? ` van ${e.maxAttendees} plekken` : ""}
              {e.waitlistCount > 0
                ? ` · ${e.waitlistCount} op de wachtlijst`
                : ""}
            </dd>
          </div>
        </dl>
      </header>

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
          className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-4 py-2"
        >
          Agenda (.ics)
        </a>
        <a
          href={links.google}
          target="_blank"
          rel="noopener noreferrer"
          className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-4 py-2"
        >
          Google Agenda
        </a>
        <a
          href={links.outlook}
          target="_blank"
          rel="noopener noreferrer"
          className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-4 py-2"
        >
          Outlook
        </a>
        <ShareButton url={url} title={e.title} />
        {me?.canManage && (
          <Link
            href={`/events/${e.slug}/beheer`}
            className="bg-on-surface text-on-primary text-label-md inline-flex items-center gap-2 px-4 py-2"
          >
            <Settings size={14} aria-hidden /> Beheren
          </Link>
        )}
      </div>

      {e.description && (
        <Card hover={false}>
          <CardBody>
            <h2 className="text-label-md text-secondary mb-3">
              OVER DIT EVENT
            </h2>
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">
              {e.description}
            </p>
          </CardBody>
        </Card>
      )}

      {mapBox && e.format !== "online" && (
        <Card hover={false}>
          <CardBody className="space-y-3">
            <h2 className="text-label-md text-secondary">LOCATIE</h2>
            <p className="text-body-md text-on-surface">{e.location}</p>
            <iframe
              title={`Kaart: ${e.location ?? e.title}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBox}&layer=mapnik&marker=${e.latitude},${e.longitude}`}
              className="border-hairline h-64 w-full border"
              loading="lazy"
            />
            <a
              href={`https://www.openstreetmap.org/?mlat=${e.latitude}&mlon=${e.longitude}#map=16/${e.latitude}/${e.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label-md text-primary"
            >
              Route plannen →
            </a>
          </CardBody>
        </Card>
      )}

      <Card hover={false}>
        <CardBody>
          <h2 className="text-label-md text-secondary mb-3">ORGANISATOR</h2>
          <div className="flex items-center gap-3">
            <Avatar
              src={organiser?.avatarUrl ?? null}
              naam={organiserNaam}
              size="md"
              grayscale={false}
            />
            <div>
              <p className="text-on-surface font-semibold">{organiserNaam}</p>
              {organiser?.sector && (
                <p className="text-body-md text-secondary">
                  {organiser.sector}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {attendeesPreview.length > 0 && (
        <Card hover={false}>
          <CardBody>
            <h2 className="text-label-md text-secondary mb-3">WIE KOMEN ER</h2>
            <div className="flex flex-wrap gap-2">
              {attendeesPreview.map((a) => (
                <Avatar
                  key={a.id}
                  src={a.avatarUrl}
                  naam={a.naam ?? a.name ?? "?"}
                  size="sm"
                  grayscale={false}
                />
              ))}
              {e.seatsTaken > attendeesPreview.length && (
                <span className="text-body-md text-secondary self-center">
                  +{e.seatsTaken - attendeesPreview.length}
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </article>
  );
}
