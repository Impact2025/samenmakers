import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { PHASE_LABEL } from "@/server/events/status";

export const metadata: Metadata = { title: "Admin — Events" };

const TABS = [
  { key: undefined, label: "Alle" },
  { key: "published", label: "Gepubliceerd" },
  { key: "draft", label: "Concept" },
  { key: "cancelled", label: "Geannuleerd" },
] as const;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status =
    raw === "published" || raw === "draft" || raw === "cancelled"
      ? raw
      : undefined;
  const events = await api.events.adminList({
    ...(status ? { status } : {}),
    limit: 200,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-label-md text-secondary mb-1">ADMIN</p>
          <h1 className="text-headline-lg text-on-surface">Events</h1>
        </div>
        <Link
          href="/events/nieuw"
          className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 text-sm font-bold transition-colors"
        >
          + Nieuw event
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/events?status=${t.key}` : "/admin/events"}
            className={`text-label-md border px-4 py-1.5 ${status === t.key ? "bg-on-surface text-on-primary border-on-surface" : "border-hairline text-secondary hover:border-on-surface"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="border-hairline overflow-x-auto border">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline-b bg-surface-container-low">
              {[
                "TITEL",
                "DATUM",
                "LOCATIE",
                "ORGANISATOR",
                "BEZETTING",
                "STATUS",
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
                  <span className="border-hairline text-on-surface-variant border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
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
    </div>
  );
}
