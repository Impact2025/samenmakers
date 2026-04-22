import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { formatDate } from "@/lib/date-utils";

export const metadata: Metadata = { title: "Admin — Events" };

export default async function AdminEventsPage() {
  const { items: events } = await api.events.list({ limit: 50 }).catch(() => ({
    items: [],
    nextCursor: undefined,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-label-caps text-outline mb-1">ADMIN</p>
          <h1 className="text-headline-md text-on-surface">Events</h1>
        </div>
        <Link
          href="/events/nieuw"
          className="px-4 py-2 bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          + Nieuw event
        </Link>
      </div>

      <div className="border border-hairline">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline-b bg-surface-container-low">
              <th className="text-left px-4 py-3 text-label-caps text-outline font-normal">TITEL</th>
              <th className="text-left px-4 py-3 text-label-caps text-outline font-normal">DATUM</th>
              <th className="text-left px-4 py-3 text-label-caps text-outline font-normal">LOCATIE</th>
              <th className="text-left px-4 py-3 text-label-caps text-outline font-normal">STATUS</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-outline text-sm">
                  Geen events gevonden.
                </td>
              </tr>
            )}
            {events.map((event) => {
              const isPast = new Date(event.startAt) < new Date();
              return (
                <tr key={event.id} className="hairline-b last:border-0 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{event.title}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {formatDate(new Date(event.startAt))}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {event.isOnline ? "Online" : (event.location ?? "—")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 border ${
                      isPast
                        ? "border-outline/30 text-outline"
                        : "border-primary/30 text-primary"
                    }`}>
                      {isPast ? "Afgelopen" : "Aankomend"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Bekijken →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
