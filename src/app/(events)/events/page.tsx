import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { breadcrumbSchema } from "@/lib/seo-kit";
import { FORMAT_LABEL } from "@/lib/event-format";
import { EventsDiscover } from "./events-discover";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export const metadata: Metadata = {
  title: "Events voor impact-ondernemers",
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

  const [session, first, facets] = await Promise.all([
    auth(),
    api.events.list(filters),
    api.events.facets(),
  ]);
  const loggedIn = !!session?.user;
  const tabHref = (tab: "komend" | "afgelopen") => {
    const p = new URLSearchParams(
      Object.entries({ ...sp, tab }).filter(([, v]) => !!v) as [
        string,
        string,
      ][],
    );
    if (tab === "komend") p.delete("tab");
    const s = p.toString();
    return s ? `/events?${s}` : "/events";
  };

  const crumbs = breadcrumbSchema([
    { name: "We Shape the Future", url: APP_URL },
    { name: "Events", url: `${APP_URL}/events` },
  ]);

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-label-md text-secondary mb-1">COMMUNITY</p>
          <h1 className="text-headline-lg text-on-surface">Events</h1>
        </div>
        {loggedIn && (
          <div className="flex shrink-0 gap-2">
            <Link
              href="/events/mijn"
              className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-4 py-2"
            >
              Mijn events
            </Link>
            <Link
              href="/events/nieuw"
              className="bg-primary-container text-on-primary text-label-md px-4 py-2"
            >
              + Nieuw
            </Link>
          </div>
        )}
      </div>

      {/* Werkt ook zonder JavaScript: een gewone GET-form. */}
      <form
        action="/events"
        method="get"
        className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]"
        role="search"
      >
        {!upcoming && <input type="hidden" name="tab" value="afgelopen" />}
        <label className="flex flex-col gap-1">
          <span className="text-label-md text-secondary">Zoeken</span>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Titel, plaats of onderwerp"
            className="border-hairline focus:border-on-surface border bg-white px-3 py-2 text-sm focus:outline-none"
          />
        </label>
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
        <Select
          name="thema"
          label="Thema"
          value={sp.thema}
          options={facets.themas.map((t) => [t, t])}
        />
        <button
          type="submit"
          className="bg-on-surface text-on-primary text-label-md h-[38px] px-5 py-2"
        >
          Filter
        </button>
      </form>

      <div className="flex gap-2" role="tablist">
        <Link
          href={tabHref("komend")}
          role="tab"
          aria-selected={upcoming}
          className={`text-label-md border px-5 py-2 ${upcoming ? "bg-on-surface text-on-primary border-on-surface" : "border-hairline text-secondary hover:border-on-surface"}`}
        >
          Komend
        </Link>
        <Link
          href={tabHref("afgelopen")}
          role="tab"
          aria-selected={!upcoming}
          className={`text-label-md border px-5 py-2 ${!upcoming ? "bg-on-surface text-on-primary border-on-surface" : "border-hairline text-secondary hover:border-on-surface"}`}
        >
          Afgelopen
        </Link>
      </div>

      <EventsDiscover
        key={JSON.stringify(filters)}
        filters={filters}
        initial={first}
        allowNearMe={upcoming}
      />

      {!loggedIn && (
        <div className="border-hairline flex flex-col justify-between gap-4 border bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-on-surface font-extrabold">
              Zelf een event organiseren?
            </p>
            <p className="text-body-md text-on-surface-variant">
              Word lid van We Shape the Future en bereik impact-ondernemers in
              heel Nederland.
            </p>
          </div>
          <Link
            href="/aanmelden"
            className="bg-primary-container text-on-primary text-label-md px-6 py-3 text-center"
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
    <label className="flex flex-col gap-1">
      <span className="text-label-md text-secondary">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="border-hairline focus:border-on-surface h-[38px] border bg-white px-3 py-2 text-sm focus:outline-none"
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
