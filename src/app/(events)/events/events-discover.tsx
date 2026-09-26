"use client";

import { useState } from "react";
import { LocateFixed, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import { EventCard } from "@/components/events/event-card";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type ListInput = inferRouterInputs<AppRouter>["events"]["list"];
type ListOutput = inferRouterOutputs<AppRouter>["events"]["list"];

export function EventsDiscover({
  filters,
  initial,
  allowNearMe,
}: {
  filters: ListInput;
  initial: ListOutput;
  allowNearMe: boolean;
}) {
  const [near, setNear] = useState<{
    lat: number;
    lng: number;
    radiusKm: number;
  } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const input = { ...filters, ...(near ? { near } : {}) };
  const query = trpc.events.list.useInfiniteQuery(input, {
    getNextPageParam: (last) => last.nextCursor,
    // Zonder "in mijn buurt" is de server-render de eerste pagina.
    ...(near
      ? {}
      : { initialData: { pages: [initial], pageParams: [undefined] } }),
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeoError("Je browser ondersteunt geen locatiebepaling.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setNear({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusKm: 25,
        });
      },
      () => {
        setLocating(false);
        setGeoError("Locatie niet beschikbaar. Kies anders een regio.");
      },
      { maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );
  }

  return (
    <div className="space-y-4">
      {allowNearMe && (
        <div className="flex flex-wrap items-center gap-2">
          {near ? (
            <>
              <span className="text-body-md text-on-surface">Binnen</span>
              <select
                aria-label="Straal"
                value={near.radiusKm}
                onChange={(e) =>
                  setNear({ ...near, radiusKm: Number(e.target.value) })
                }
                className="border-hairline border bg-white px-2 py-1 text-sm"
              >
                {[10, 25, 50, 100].map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
              <span className="text-body-md text-on-surface">van jou</span>
              <button
                type="button"
                onClick={() => setNear(null)}
                className="text-label-md text-secondary hover:text-on-surface inline-flex items-center gap-1"
              >
                <X size={12} aria-hidden /> Wissen
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="border-hairline text-label-md text-on-surface hover:border-on-surface inline-flex items-center gap-2 border px-4 py-2 disabled:opacity-40"
            >
              {locating ? <Spinner /> : <LocateFixed size={14} aria-hidden />}{" "}
              In mijn buurt
            </button>
          )}
          {geoError && (
            <span className="text-body-md text-error">{geoError}</span>
          )}
        </div>
      )}

      {query.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="border-hairline border bg-white py-16 text-center">
          <p className="text-on-surface-variant">
            Geen events gevonden met deze filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {query.hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="border-on-surface text-label-md text-on-surface hover:bg-on-surface hover:text-on-primary border px-6 py-3 disabled:opacity-40"
          >
            {query.isFetchingNextPage ? <Spinner /> : "Meer events"}
          </button>
        </div>
      )}
    </div>
  );
}
