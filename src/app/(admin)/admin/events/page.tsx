import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { api } from "@/trpc/server";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { PHASE_LABEL } from "@/server/events/status";
import { fieldClasses } from "@/components/ui/field-styles";

export const metadata: Metadata = { title: "Admin — Events" };

const PAGE_SIZE = 25;

const TABS = [
  { key: undefined, label: "Alle" },
  { key: "published", label: "Gepubliceerd" },
  { key: "draft", label: "Concept" },
  { key: "cancelled", label: "Geannuleerd" },
] as const;
const STATUSSEN = ["published", "draft", "cancelled"] as const;
const FORMATS = [
  ["in_person", "Fysiek"],
  ["online", "Online"],
  ["hybrid", "Hybride"],
] as const;
const WANNEER = [
  ["upcoming", "Komende events"],
  ["past", "Afgelopen events"],
] as const;
const SORTERINGEN = [
  ["datum_nieuw", "Datum: nieuwste eerst"],
  ["datum_oud", "Datum: oudste eerst"],
  ["titel", "Titel A–Z"],
] as const;

type Params = Record<string, string | string[] | undefined>;

function text(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const v = text(value);
  return allowed.find((a) => a === v);
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const q = text(sp.q).trim();
  const status = pick(sp.status, STATUSSEN);
  const format = pick(
    sp.format,
    FORMATS.map(([v]) => v),
  );
  const when = pick(
    sp.when,
    WANNEER.map(([v]) => v),
  );
  const sort =
    pick(
      sp.sort,
      SORTERINGEN.map(([v]) => v),
    ) ?? "datum_nieuw";
  const pagina = Math.max(1, Number.parseInt(text(sp.pagina), 10) || 1);

  const { items: events, total } = await api.events.adminList({
    q: q || undefined,
    status,
    format,
    when,
    sort,
    limit: PAGE_SIZE,
    offset: (pagina - 1) * PAGE_SIZE,
  });

  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActief = Boolean(q || status || format || when);

  function href(patch: { status?: string | undefined; pagina?: number }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nieuweStatus = "status" in patch ? patch.status : status;
    if (nieuweStatus) params.set("status", nieuweStatus);
    if (format) params.set("format", format);
    if (when) params.set("when", when);
    if (sort !== "datum_nieuw") params.set("sort", sort);
    if (patch.pagina && patch.pagina > 1)
      params.set("pagina", String(patch.pagina));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const select = `${fieldClasses} cursor-pointer`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-label-md text-secondary mb-1">Admin</p>
          <h1 className="text-headline-lg text-on-surface">Events</h1>
          <p className="text-secondary mt-1 text-sm">
            {filtersActief ? `${total} events gevonden` : `${total} events`}
          </p>
        </div>
        <Link
          href="/events/nieuw"
          className="bg-primary text-on-primary hover:bg-primary/90 shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors"
        >
          + Nieuw event
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={href({ status: t.key })}
            className={`text-label-md rounded-full border px-4 py-1.5 ${status === t.key ? "bg-on-surface text-surface-container-lowest border-transparent" : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form
        method="get"
        className="bg-surface-container-lowest shadow-card mb-4 space-y-3 rounded-2xl p-4"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative">
          <Search
            className="text-secondary pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Zoek op titel, locatie, regio, thema of organisator"
            aria-label="Zoeken"
            className={`${fieldClasses} pl-11`}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            name="format"
            defaultValue={format ?? ""}
            className={select}
            aria-label="Type"
          >
            <option value="">Alle types</option>
            {FORMATS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <select
            name="when"
            defaultValue={when ?? ""}
            className={select}
            aria-label="Periode"
          >
            <option value="">Alle data</option>
            {WANNEER.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className={select}
            aria-label="Sorteren"
          >
            {SORTERINGEN.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary-container text-on-primary-container rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Zoeken
          </button>
          {filtersActief && (
            <Link href="?" className="text-secondary text-sm hover:underline">
              Filters wissen
            </Link>
          )}
        </div>
      </form>

      <div className="border-hairline overflow-x-auto border">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline-b bg-surface-container-low">
              {[
                "Titel",
                "Datum",
                "Locatie",
                "Organisator",
                "Bezetting",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-label-md text-secondary px-4 py-3 text-left font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-secondary px-4 py-8 text-center text-sm"
                >
                  Geen events gevonden.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr
                key={e.id}
                className="hairline-b hover:bg-surface-container-low transition-colors last:border-0"
              >
                <td className="text-on-surface px-4 py-3 font-medium">
                  {e.title}
                </td>
                <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                  {formatEventWhen(e.startAt, null, e.timezone)}
                </td>
                <td className="text-on-surface-variant px-4 py-3">
                  {eventWhere(e)}
                </td>
                <td className="text-on-surface-variant px-4 py-3">
                  {e.organiserNaam ?? e.organiserName ?? "—"}
                </td>
                <td className="text-on-surface-variant px-4 py-3 whitespace-nowrap">
                  {e.seatsTaken}
                  {e.maxAttendees ? ` / ${e.maxAttendees}` : ""}
                  {e.waitlistCount > 0 ? ` (+${e.waitlistCount})` : ""}
                </td>
                <td className="px-4 py-3">
                  <span className="text-on-surface-variant border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors">
                    {PHASE_LABEL[e.phase]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/events/${e.slug}/beheer`}
                    className="text-primary text-xs hover:underline"
                  >
                    Beheren →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav
          className="text-secondary mt-4 flex items-center justify-between text-sm"
          aria-label="Paginering"
        >
          {pagina > 1 ? (
            <Link
              href={href({ pagina: pagina - 1 })}
              className="hover:underline"
            >
              ← Vorige
            </Link>
          ) : (
            <span />
          )}
          <span>
            Pagina {pagina} van {paginas}
          </span>
          {pagina < paginas ? (
            <Link
              href={href({ pagina: pagina + 1 })}
              className="hover:underline"
            >
              Volgende →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
