import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  History,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { breadcrumbSchema } from "@/lib/seo-kit";
import { FORMAT_LABEL } from "@/lib/event-format";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { ChipLink, ChipRow } from "@/components/ui/chip";
import { buttonClasses } from "@/components/ui/button";
import { fieldClasses } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";
import { EventsDiscover } from "./events-discover";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export const metadata: Metadata = {
  title: "Evenementen voor impact-ondernemers",
  description:
    "Bijeenkomsten, workshops en netwerkevents voor sociaal en duurzaam ondernemers. Vind een event bij jou in de buurt of online en meld je direct aan.",
  alternates: { canonical: `${APP_URL}/events` },
  openGraph: {
    title: "We Shape the Future events",
    url: `${APP_URL}/events`,
    type: "website",
  },
};

type Search = {
  q?: string;
  format?: string;
  regio?: string;
  thema?: string;
  tab?: string;
};

const FORMATS = ["in_person", "online", "hybrid"] as const;
type Format = (typeof FORMATS)[number];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const upcoming = sp.tab !== "afgelopen";
  const format = FORMATS.includes(sp.format as Format)
    ? (sp.format as Format)
    : undefined;
  const filters = {
    upcoming,
    limit: 20,
    ...(sp.q ? { q: sp.q.slice(0, 100) } : {}),
    ...(format ? { format } : {}),
    ...(sp.regio ? { regio: sp.regio } : {}),
    ...(sp.thema ? { thema: sp.thema } : {}),
  };
  const hasFilters = !!(sp.q || format || sp.regio || sp.thema);

  const [session, first, facets] = await Promise.all([
    auth(),
    api.events.list(filters),
    api.events.facets(),
  ]);
  const loggedIn = !!session?.user;

  const hrefWith = (patch: { [K in keyof Search]?: string | undefined }) => {
    const merged: Record<string, string | undefined> = { ...sp, ...patch };
    const p = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => !!v) as [string, string][],
    );
    const s = p.toString();
    return s ? `/events?${s}` : "/events";
  };

  const crumbs = breadcrumbSchema([
    { name: "We Shape the Future", url: APP_URL },
    { name: "Evenementen", url: `${APP_URL}/events` },
  ]);

  return (
    <div className="flex flex-col gap-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-on-surface">
            Evenementen &amp; sessies
          </h1>
          <p className="text-body-md text-secondary mt-0.5">
            Verdiep je kennis en ontmoet mede-ondernemers
          </p>
        </div>
        {loggedIn && (
          <div className="flex shrink-0 gap-2">
            <Link
              href="/events/mijn#agenda"
              aria-label="Agenda synchroniseren"
              className="bg-secondary-container/60 text-on-secondary-container hover:bg-secondary-container flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            >
              <CalendarPlus size={20} />
            </Link>
            <Link
              href="/events/nieuw"
              aria-label="Nieuw event"
              className={buttonClasses(
                "primary",
                "sm",
                "hidden sm:inline-flex",
              )}
            >
              <Plus size={16} /> Nieuw event
            </Link>
          </div>
        )}
      </div>

      <SegmentedTabs
        active={upcoming ? "komend" : "afgelopen"}
        tabs={[
          {
            key: "komend",
            label: "Aankomend",
            icon: <Sparkles size={16} />,
            href: hrefWith({ tab: undefined }),
          },
          ...(loggedIn
            ? [
                {
                  key: "mijn",
                  label: "Mijn aanmeldingen",
                  icon: <CheckCircle2 size={16} />,
                  href: "/events/mijn",
                },
              ]
            : []),
          {
            key: "afgelopen",
            label: "Afgelopen",
            icon: <History size={16} />,
            href: hrefWith({ tab: "afgelopen" }),
          },
        ]}
      />

      {facets.themas.length > 0 && (
        <ChipRow>
          <ChipLink href={hrefWith({ thema: undefined })} active={!sp.thema}>
            Alle types
          </ChipLink>
          {facets.themas.map((t) => (
            <ChipLink
              key={t}
              href={hrefWith({ thema: t })}
              active={sp.thema === t}
            >
              {t}
            </ChipLink>
          ))}
        </ChipRow>
      )}

      {/* Werkt ook zonder JavaScript: een gewone GET-form. */}
      <form
        action="/events"
        method="get"
        role="search"
        className="flex flex-col gap-3"
      >
        {!upcoming && <input type="hidden" name="tab" value="afgelopen" />}
        {sp.thema && <input type="hidden" name="thema" value={sp.thema} />}
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Zoeken</span>
            <Search
              size={20}
              className="text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <input
              name="q"
              type="search"
              defaultValue={sp.q ?? ""}
              placeholder="Zoek op titel, plaats of onderwerp..."
              className={cn(fieldClasses, "pl-12")}
            />
          </label>
          <button
            type="submit"
            className={buttonClasses("dark", "icon", "h-[50px] w-[50px]")}
            aria-label="Zoeken"
          >
            <Search size={20} />
          </button>
        </div>
        <details
          className="group bg-surface-container-low rounded-2xl"
          open={!!(format || sp.regio)}
        >
          <summary className="text-label-lg text-on-surface flex h-11 cursor-pointer list-none items-center gap-2 px-4">
            <SlidersHorizontal size={18} className="text-secondary" />
            Meer filters
            {(format || sp.regio) && (
              <span className="bg-primary-container h-2 w-2 rounded-full" />
            )}
          </summary>
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Select
              name="format"
              label="Vorm"
              value={format}
              options={FORMATS.map((f) => [f, FORMAT_LABEL[f]])}
            />
            <Select
              name="regio"
              label="Regio"
              value={sp.regio}
              options={facets.regios.map((r) => [r, r])}
            />
            <button
              type="submit"
              className={buttonClasses("dark", "md", "h-[50px]")}
            >
              Toepassen
            </button>
          </div>
        </details>
      </form>

      <EventsDiscover
        key={JSON.stringify(filters)}
        filters={filters}
        initial={first}
        allowNearMe={upcoming}
        featureFirst={upcoming && !hasFilters}
      />

      {loggedIn ? (
        <div className="bg-surface-container flex items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="bg-surface-container-lowest text-primary-container shadow-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <RefreshCw size={20} />
            </span>
            <div>
              <h2 className="text-title-md text-on-surface">
                Synchroniseer je agenda
              </h2>
              <p className="text-body-sm text-secondary mt-0.5">
                Zet je aanmeldingen automatisch in Google of Apple Agenda
              </p>
            </div>
          </div>
          <Link
            href="/events/mijn#agenda"
            className={buttonClasses("secondary", "sm", "shrink-0")}
          >
            Koppel iCal
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest shadow-elevated flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-headline-sm text-on-surface">
              Zelf een event organiseren?
            </h2>
            <p className="text-body-md text-secondary">
              Word lid van We Shape the Future en bereik impact-ondernemers in
              heel Nederland.
            </p>
          </div>
          <Link
            href="/aanmelden"
            className={buttonClasses("primary", "lg", "shrink-0")}
          >
            Gratis lid worden
          </Link>
        </div>
      )}
    </div>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | undefined;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-lg text-on-surface">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className={cn(fieldClasses, "bg-surface-container-lowest")}
      >
        <option value="">Alle</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
