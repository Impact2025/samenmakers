"use client";

import { useState } from "react";
import { CalendarX2, LocateFixed, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import { EventCard, FeaturedEventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type ListInput = inferRouterInputs<AppRouter>["events"]["list"];
type ListOutput = inferRouterOutputs<AppRouter>["events"]["list"];

export function EventsDiscover({
  filters,
  initial,
  allowNearMe,
  featureFirst = false,
}: {
  filters: ListInput;
  initial: ListOutput;
  allowNearMe: boolean;
  /** Eerste event groot uitlichten (standaardoverzicht zonder filters). */
  featureFirst?: boolean;
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
  const [featured, ...rest] =
    featureFirst && !near ? items : [undefined, ...items];

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
    <div className="flex flex-col gap-5">
      {allowNearMe && (
        <div className="flex flex-wrap items-center gap-2">
          {near ? (
            <div className="bg-primary-fixed/60 flex h-10 items-center gap-2 rounded-full pr-1 pl-4">
              <LocateFixed
                size={16}
                className="text-primary-container"
                aria-hidden
              />
              <span className="text-label-md text-on-primary-fixed">
                Binnen
              </span>
              <select
                aria-label="Straal"
                value={near.radiusKm}
                onChange={(e) =>
                  setNear({ ...near, radiusKm: Number(e.target.value) })
                }
                className="bg-surface-container-lowest text-label-md text-on-surface h-8 rounded-full px-2 outline-none"
              >
                {[10, 25, 50, 100].map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
              <span className="text-label-md text-on-primary-fixed">
                van jou
              </span>
              <button
                type="button"
                onClick={() => setNear(null)}
                aria-label="Locatiefilter wissen"
                className="text-on-primary-fixed hover:bg-surface-container-lowest flex h-8 w-8 items-center justify-center rounded-full"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={locate}
              disabled={locating}
            >
              {locating ? (
                <Spinner size="sm" />
              ) : (
                <LocateFixed size={16} aria-hidden />
              )}
              In mijn buurt
            </Button>
          )}
          {geoError && (
            <span className="text-body-sm text-error">{geoError}</span>
          )}
        </div>
      )}

      {query.isLoading ? (
        <div className="text-primary-container flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 size={22} />}
          title="Geen evenementen gevonden"
          description="Probeer een ander thema of verwijder een paar filters."
        />
      ) : (
        <>
          {featured && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm text-primary uppercase">
                  Uitgelicht evenement
                </span>
                {featured.format !== "in_person" && (
                  <span className="text-label-sm text-tertiary flex items-center gap-1">
                    <span className="bg-tertiary h-1.5 w-1.5 animate-pulse rounded-full" />{" "}
                    Online te volgen
                  </span>
                )}
              </div>
              <FeaturedEventCard event={featured} />
            </section>
          )}
          {rest.length > 0 && (
            <section className="flex flex-col gap-3">
              {featured && (
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-sm text-on-surface">
                    Binnenkort op de agenda
                  </h2>
                  <span className="text-label-sm text-secondary">
                    {rest.length} evenementen
                  </span>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
                {rest.map(
                  (event) =>
                    event && <EventCard key={event.id} event={event} />,
                )}
              </div>
            </section>
          )}
        </>
      )}

      {query.hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? (
              <Spinner size="sm" />
            ) : (
              "Meer evenementen"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
