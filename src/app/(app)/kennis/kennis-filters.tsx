"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { POST_CATEGORIES } from "@/lib/constants";

export function KennisFilters({ activeCategory }: { activeCategory?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setCategory(cat: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.push(`/kennis?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setCategory(null)}
        className={`px-4 py-2 text-label-caps border transition-colors ${
          !activeCategory
            ? "bg-on-surface text-on-primary border-on-surface"
            : "border-hairline text-outline hover:border-on-surface"
        }`}
      >
        Alles
      </button>
      {POST_CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setCategory(value)}
          className={`px-4 py-2 text-label-caps border transition-colors ${
            activeCategory === value
              ? "bg-on-surface text-on-primary border-on-surface"
              : "border-hairline text-outline hover:border-on-surface"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
