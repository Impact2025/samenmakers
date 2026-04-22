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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, bio of missie…"
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 border text-sm font-semibold transition-colors ${
            showFilters || Object.keys(filters).length > 0
              ? "bg-on-surface text-on-primary border-on-surface"
              : "border-hairline text-outline hover:border-on-surface"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="w-5 h-5 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="border border-hairline bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-label-caps text-on-surface">FILTERS</p>
            <button
              onClick={() => { setFilters({}); setShowFilters(false); }}
              className="text-xs text-outline hover:text-on-surface flex items-center gap-1"
            >
              <X size={12} /> Wis alles
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-label-caps text-outline block mb-2">SECTOR</label>
              <select
                value={filters.sector ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.sector = v; else delete next.sector;
                    return next;
                  });
                }}
                className="w-full border border-hairline bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-on-surface"
              >
                <option value="">Alle sectoren</option>
                {SECTOREN.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">REGIO</label>
              <select
                value={filters.regio ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.regio = v; else delete next.regio;
                    return next;
                  });
                }}
                className="w-full border border-hairline bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-on-surface"
              >
                <option value="">Alle regio&apos;s</option>
                {REGIO_S.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">FASE</label>
              <select
                value={filters.fase ?? ""}
                onChange={(e) => {
                  const v = e.target.value as "starter" | "groei" | "scale" | "";
                  setFilters((f) => {
                    const next = { ...f };
                    if (v) next.fase = v; else delete next.fase;
                    return next;
                  });
                }}
                className="w-full border border-hairline bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-on-surface"
              >
                <option value="">Alle fasen</option>
                {FASEN.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <button
                key={key}
                onClick={() => setFilters((f) => { const next = { ...f }; delete next[key as keyof Filters]; return next; })}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold"
              >
                {value}
                <X size={10} />
              </button>
            )
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-on-surface-variant mb-2">Geen makers gevonden</p>
          <p className="text-body-sm text-outline">Pas je filters aan om meer resultaten te zien</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 border border-hairline text-label-caps text-on-surface hover:border-on-surface transition-colors disabled:opacity-50"
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
    <Link href={`/makers/${user.id}`} className="block group">
      <Card className="h-full">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-start gap-3 mb-3">
            <Avatar
              src={user.avatarUrl}
              naam={displayName}
              size="md"
              grayscale
            />
            <div className="flex-1 min-w-0">
              <p className="font-black text-on-surface text-sm truncate group-hover:text-primary transition-colors">
                {displayName}
              </p>
              {user.isFeatured && (
                <Badge variant="primary" size="sm" className="mt-0.5">FEATURED</Badge>
              )}
            </div>
          </div>

          {user.missie && (
            <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-3 flex-1">
              &ldquo;{user.missie}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap gap-1 mt-auto">
            {user.sector && <Badge variant="default" size="sm">{user.sector}</Badge>}
            {user.regio && <Badge variant="default" size="sm">{user.regio}</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
