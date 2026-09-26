"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Users,
  X,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow } from "@/components/ui/chip";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { fieldClasses } from "@/components/ui/field-styles";
import { SECTOREN, REGIO_S, FASEN } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Fase = "starter" | "groei" | "scale";
type Filters = {
  sector?: string;
  regio?: string;
  fase?: Fase;
};

const FASE_LABEL: Record<Fase, string> = Object.fromEntries(
  FASEN.map((f) => [f.value, f.label]),
) as Record<Fase, string>;

export function DiscoverContent() {
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.users.list.useInfiniteQuery(
      { ...filters, ...(search ? { search } : {}), limit: 24 },
      { getNextPageParam: (last) => last.nextCursor },
    );

  const users = data?.pages.flatMap((p) => p.items) ?? [];
  const extraFilters = (filters.regio ? 1 : 0) + (filters.fase ? 1 : 0);
  const pristine = !search && Object.keys(filters).length === 0;
  const featured = pristine
    ? users.filter((u) => u.isFeatured).slice(0, 8)
    : [];

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K] | "") {
    setFilters((f) => {
      const next = { ...f };
      if (value) next[key] = value as Filters[K];
      else delete next[key];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Zoeken + filters */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Zoeken</span>
            <Search
              size={20}
              className="text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam, missie of expertise..."
              className={cn(fieldClasses, "pl-12")}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-label="Meer filters"
            className={cn(
              "relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl transition-colors",
              showFilters || extraFilters > 0
                ? "bg-on-surface text-surface-container-lowest"
                : "bg-surface-container-low text-secondary hover:text-on-surface",
            )}
          >
            <SlidersHorizontal size={20} />
            {extraFilters > 0 && (
              <span className="bg-primary-container text-on-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                {extraFilters}
              </span>
            )}
          </button>
        </div>

        <ChipRow>
          <Chip
            active={!filters.sector}
            onClick={() => setFilter("sector", "")}
          >
            Alles
          </Chip>
          {SECTOREN.map((s) => (
            <Chip
              key={s}
              active={filters.sector === s}
              onClick={() => setFilter("sector", filters.sector === s ? "" : s)}
            >
              {s}
            </Chip>
          ))}
        </ChipRow>

        {showFilters && (
          <div className="bg-surface-container-low grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-label-lg text-on-surface">Regio</span>
              <select
                value={filters.regio ?? ""}
                onChange={(e) => setFilter("regio", e.target.value)}
                className={cn(fieldClasses, "bg-surface-container-lowest")}
              >
                <option value="">Alle regio&apos;s</option>
                {REGIO_S.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-lg text-on-surface">Fase</span>
              <select
                value={filters.fase ?? ""}
                onChange={(e) => setFilter("fase", e.target.value as Fase | "")}
                className={cn(fieldClasses, "bg-surface-container-lowest")}
              >
                <option value="">Alle fasen</option>
                {FASEN.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({});
                setShowFilters(false);
              }}
            >
              <X size={16} /> Wis filters
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-primary-container flex justify-center py-20">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="Geen makers gevonden"
          description="Pas je zoekterm of filters aan om meer resultaten te zien."
        />
      ) : (
        <>
          {featured.length > 0 && (
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-headline-sm text-on-surface">
                    Uitgelichte makers
                  </h2>
                  <span className="bg-primary-fixed text-label-sm text-primary rounded-full px-2 py-0.5">
                    Spotlight
                  </span>
                </div>
              </div>
              <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
                {featured.map((u) => (
                  <FeaturedCard key={u.id} user={u} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-headline-sm text-on-surface">
                {pristine ? "Changemakers in het netwerk" : "Resultaten"}
              </h2>
              <span className="text-label-md text-secondary">
                {users.length}
                {hasNextPage ? "+" : ""} makers
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </section>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Spinner size="sm" />
                ) : (
                  "Meer makers laden"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type User = {
  id: string;
  naam: string | null;
  name: string | null;
  bio: string | null;
  missie: string | null;
  sector: string | null;
  regio: string | null;
  fase: Fase | null;
  avatarUrl: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  expertise: string[];
};

function FeaturedCard({ user }: { user: User }) {
  const displayName = user.naam ?? user.name ?? "Maker";
  return (
    <Link
      href={`/makers/${user.id}`}
      className="bg-surface-container-low shadow-card hover:shadow-elevated flex w-60 shrink-0 snap-start flex-col items-center rounded-2xl p-4 text-center transition-shadow"
    >
      <Avatar
        src={user.avatarUrl}
        naam={displayName}
        size="lg"
        className="mb-3"
      />
      <h3 className="text-title-md text-on-surface flex items-center gap-1">
        <span className="truncate">{displayName}</span>
        {user.isVerified && (
          <BadgeCheck
            size={16}
            className="text-primary-container shrink-0"
            aria-label="Geverifieerd"
          />
        )}
      </h3>
      {user.sector && (
        <p className="text-body-sm text-primary-container mt-0.5 font-semibold">
          {user.sector}
        </p>
      )}
      {user.missie && (
        <p className="text-body-sm text-secondary mt-1 line-clamp-1">
          {user.missie}
        </p>
      )}
      <span className="bg-primary-container text-label-md text-on-primary shadow-cta mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-full">
        Bekijk profiel <ArrowRight size={16} />
      </span>
    </Link>
  );
}

function UserCard({ user }: { user: User }) {
  const displayName = user.naam ?? user.name ?? "Maker";
  const subtitle = [user.sector, user.regio].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/makers/${user.id}`}
      className="group bg-surface-container-lowest shadow-card hover:shadow-elevated flex h-full flex-col gap-3 rounded-2xl p-4 transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <Avatar src={user.avatarUrl} naam={displayName} size="sm" />
          <div className="min-w-0">
            <h3 className="text-title-md text-on-surface group-hover:text-primary-container flex items-center gap-1 transition-colors">
              <span className="truncate">{displayName}</span>
              {user.isVerified && (
                <BadgeCheck
                  size={16}
                  className="text-primary-container shrink-0"
                  aria-label="Geverifieerd"
                />
              )}
            </h3>
            {subtitle && (
              <p className="text-body-sm text-secondary truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {user.fase && (
          <span className="bg-primary-container/10 text-label-sm text-primary-container shrink-0 rounded-full px-2 py-0.5">
            {FASE_LABEL[user.fase]}
          </span>
        )}
      </div>
      {(user.missie ?? user.bio) && (
        <p className="text-body-sm text-on-surface-variant line-clamp-2">
          {user.missie ?? user.bio}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {user.expertise[0] ? (
          <span className="bg-surface-container-low text-label-sm text-secondary truncate rounded-md px-2 py-1">
            Expertise: {user.expertise[0]}
          </span>
        ) : (
          <span />
        )}
        <span className="bg-surface-container-high text-label-md text-primary-container group-hover:bg-primary-container group-hover:text-on-primary flex h-9 shrink-0 items-center gap-1 rounded-full px-4 transition-colors">
          Bekijk <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
