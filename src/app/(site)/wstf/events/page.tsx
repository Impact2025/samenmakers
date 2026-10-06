import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Users, Video } from "lucide-react";
import { api } from "@/trpc/server";
import {
  DEFAULT_EVENT_TZ,
  FORMAT_LABEL,
  eventDateParts,
  eventWhere,
} from "@/lib/event-format";
import { siteHref } from "@/components/site/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events | We Shape the Future",
  description:
    "Masterclasses, intervisies, verdiepingsdagen en netwerkevents voor sociaal ondernemers en changemakers. Bekijk wat er aankomt en meld je direct aan.",
};

export const dynamic = "force-dynamic";

const FORMATS = ["in_person", "online", "hybrid"] as const;
type Format = (typeof FORMATS)[number];

type Search = {
  tab?: string;
  format?: string;
  thema?: string;
  cursor?: string;
};

/** Beschrijvingen zijn markdown; voor een kaart willen we platte tekst. */
function excerpt(md: string | null, max = 180) {
  if (!md) return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function timeRange(start: Date, end: Date | null, timeZone: string): string {
  const f = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
  return end ? `${f.format(start)} – ${f.format(end)}` : f.format(start);
}

export default async function SiteEventsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const upcoming = sp.tab !== "afgelopen";
  const format = FORMATS.includes(sp.format as Format)
    ? (sp.format as Format)
    : undefined;

  const [data, facets] = await Promise.all([
    api.events.list({
      upcoming,
      limit: 12,
      ...(format ? { format } : {}),
      ...(sp.thema ? { thema: sp.thema } : {}),
      ...(sp.cursor ? { cursor: sp.cursor } : {}),
    }),
    api.events.facets(),
  ]);

  const href = (patch: Partial<Record<keyof Search, string | undefined>>) => {
    const merged: Record<string, string | undefined> = {
      tab: sp.tab,
      format: sp.format,
      thema: sp.thema,
      ...patch,
    };
    const p = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => !!v) as [string, string][],
    );
    const s = p.toString();
    return siteHref(s ? `/events?${s}` : "/events");
  };

  return (
    <>
      <section className="events-hero">
        <div className="events-hero__inner">
          <p className="events-hero__eyebrow">Community &amp; events</p>
          <h1 className="events-hero__title">
            Samen leren, delen en verbinden
          </h1>
          <p className="events-hero__lead">
            Masterclasses, intervisies, verdiepingsdagen en netwerkmomenten voor
            sociaal ondernemers en changemakers. Meld je aan voor het event dat
            bij jou past.
          </p>
        </div>
      </section>

      <section className="events-list">
        <div className="events-list__inner">
          <div className="events-toolbar">
            <div className="events-tabs" role="tablist" aria-label="Periode">
              <Link
                role="tab"
                aria-selected={upcoming}
                href={href({ tab: undefined, cursor: undefined })}
                className={cn("events-tab", upcoming && "events-tab--active")}
              >
                Aankomend
              </Link>
              <Link
                role="tab"
                aria-selected={!upcoming}
                href={href({ tab: "afgelopen", cursor: undefined })}
                className={cn("events-tab", !upcoming && "events-tab--active")}
              >
                Afgelopen
              </Link>
            </div>

            <div className="events-chips">
              <Link
                href={href({ format: undefined, cursor: undefined })}
                className={cn("events-chip", !format && "events-chip--active")}
              >
                Alle
              </Link>
              {FORMATS.map((f) => (
                <Link
                  key={f}
                  href={href({ format: f, cursor: undefined })}
                  className={cn(
                    "events-chip",
                    format === f && "events-chip--active",
                  )}
                >
                  {FORMAT_LABEL[f]}
                </Link>
              ))}
              {facets.themas.map((t) => (
                <Link
                  key={t}
                  href={href({
                    thema: sp.thema === t ? undefined : t,
                    cursor: undefined,
                  })}
                  className={cn(
                    "events-chip",
                    sp.thema === t && "events-chip--active",
                  )}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {data.items.length === 0 ? (
            <p className="events-empty">
              {upcoming
                ? "Er staan op dit moment geen events gepland. Kom snel terug!"
                : "Geen afgelopen events gevonden."}
            </p>
          ) : (
            <div className="events-grid">
              {data.items.map((e) => {
                const tz = e.timezone || DEFAULT_EVENT_TZ;
                const { day, month } = eventDateParts(e.startAt, tz);
                const left =
                  e.maxAttendees !== null
                    ? e.maxAttendees - e.seatsTaken
                    : null;
                const badge =
                  e.phase === "live"
                    ? { text: "Nu bezig", cls: " event-tile__badge--ok" }
                    : e.phase === "ended"
                      ? { text: "Afgelopen", cls: "" }
                      : e.phase === "sold_out"
                        ? {
                            text: "Volgeboekt – wachtlijst",
                            cls: " event-tile__badge--warn",
                          }
                        : left !== null && left <= 5
                          ? {
                              text: `Nog ${left} ${left === 1 ? "plek" : "plekken"}`,
                              cls: " event-tile__badge--warn",
                            }
                          : null;

                return (
                  <Link
                    key={e.id}
                    href={siteHref(`/events/${e.slug}`)}
                    className="event-tile"
                  >
                    <div
                      className={cn(
                        "event-tile__media",
                        !e.coverImageUrl && "event-tile__media--empty",
                      )}
                    >
                      {e.coverImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.coverImageUrl} alt="" loading="lazy" />
                      )}
                      <div className="event-tile__date">
                        <span className="event-tile__day">{day}</span>
                        <span className="event-tile__month">{month}</span>
                      </div>
                      {badge && (
                        <span className={cn("event-tile__badge", badge.cls)}>
                          {badge.text}
                        </span>
                      )}
                    </div>

                    <div className="event-tile__body">
                      <ul className="event-tile__meta">
                        <li>
                          <Clock aria-hidden="true" />
                          {timeRange(e.startAt, e.endAt, tz)}
                        </li>
                        <li>
                          {e.format === "online" ? (
                            <Video aria-hidden="true" />
                          ) : (
                            <MapPin aria-hidden="true" />
                          )}
                          {eventWhere(e)}
                        </li>
                        {e.ticketed && (
                          <li>
                            <Users aria-hidden="true" />
                            Tickets
                          </li>
                        )}
                      </ul>
                      <h2 className="event-tile__title">{e.title}</h2>
                      <p className="event-tile__excerpt">
                        {excerpt(e.description)}
                      </p>
                      <span className="event-tile__cta">
                        {e.phase === "ended"
                          ? "Bekijk event →"
                          : "Meer info & aanmelden →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {data.nextCursor && (
            <div className="events-more">
              <Link
                className="cta__button"
                href={href({ cursor: data.nextCursor })}
              >
                <span className="cta__button-text">Meer events</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
