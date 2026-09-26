"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SECTOREN, REGIO_S, FASEN } from "@/lib/constants";

type Filters = {
  sector?: string;
  regio?: string;
  fase?: "starter" | "groei" | "scale";
  search?: string;
};

export function DiscoverContent() {
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.users.list.useInfiniteQuery(
      { ...filters, search: search || undefined, limit: 24 },
      { getNextPageParam: (last) => last.nextCursor },
    );

  const users = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="text-secondary absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, bio of missie…"
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 border px-4 text-sm font-semibold transition-colors ${
            showFilters || Object.keys(filters).length > 0
              ? "bg-on-surface text-on-primary border-on-surface"
              : "border-hairline text-secondary hover:border-on-surface"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="bg-primary text-on-primary flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="border-hairline space-y-4 border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-label-md text-on-surface">FILTERS</p>
            <button
              onClick={() => {
                setFilters({});
                setShowFilters(false);
              }}
              className="text-secondary hover:text-on-surface flex items-center gap-1 text-xs"
            >
              <X size={12} /> Wis alles
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                SECTOR
              </label>
              <select
                value={filters.sector ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.sector = v;
                    else delete next.sector;
                    return next;
                  });
                }}
                className="border-hairline text-on-surface focus:border-on-surface w-full border bg-white px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Alle sectoren</option>
                {SECTOREN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                REGIO
              </label>
              <select
                value={filters.regio ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.regio = v;
                    else delete next.regio;
                    return next;
                  });
                }}
                className="border-hairline text-on-surface focus:border-on-surface w-full border bg-white px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Alle regio&apos;s</option>
                {REGIO_S.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                FASE
              </label>
              <select
                value={filters.fase ?? ""}
                onChange={(e) => {
                  const v = e.target.value as
                    | "starter"
                    | "groei"
                    | "scale"
                    | "";
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.fase = v;
                    else delete next.fase;
                    return next;
                  });
                }}
                className="border-hairline text-on-surface focus:border-on-surface w-full border bg-white px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Alle fasen</option>
                {FASEN.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <button
                  key={key}
                  onClick={() =>
                    setFilters((f) => {
                      const next = { ...f };
                      delete next[key as keyof Filters];
                      return next;
                    })
                  }
                  className="bg-primary/10 text-primary flex items-center gap-1 px-3 py-1 text-xs font-semibold"
                >
                  {value}
                  <X size={10} />
                </button>
              ),
          )}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-on-surface-variant mb-2">Geen makers gevonden</p>
          <p className="text-body-md text-secondary">
            Pas je filters aan om meer resultaten te zien
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="border-hairline text-label-md text-on-surface hover:border-on-surface border px-8 py-3 transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? <Spinner /> : "Meer laden"}
              </button>
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
  fase: "starter" | "groei" | "scale" | null;
  avatarUrl: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  expertise: string[];
};

function UserCard({ user }: { user: User }) {
  const displayName = user.naam ?? user.name ?? "Maker";

  return (
    <Link href={`/makers/${user.id}`} className="group block">
      <Card className="h-full">
        <div className="flex h-full flex-col p-5">
          <div className="mb-3 flex items-start gap-3">
            <Avatar
              src={user.avatarUrl}
              naam={displayName}
              size="md"
              grayscale
            />
            <div className="min-w-0 flex-1">
              <p className="text-on-surface group-hover:text-primary truncate text-sm font-extrabold transition-colors">
                {displayName}
              </p>
              {user.isFeatured && (
                <Badge variant="primary" size="sm" className="mt-0.5">
                  FEATURED
                </Badge>
              )}
            </div>
          </div>

          {user.missie && (
            <p className="text-on-surface-variant mb-3 line-clamp-2 flex-1 text-xs italic">
              &ldquo;{user.missie}&rdquo;
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-1">
            {user.sector && (
              <Badge variant="default" size="sm">
                {user.sector}
              </Badge>
            )}
            {user.regio && (
              <Badge variant="default" size="sm">
                {user.regio}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
