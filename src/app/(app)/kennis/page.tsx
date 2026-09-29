import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Lock, Plus, Search } from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { fieldClasses } from "@/components/ui/field-styles";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/date-utils";
import { POST_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { KennisFilters } from "./kennis-filters";

export const metadata: Metadata = { title: "Kennisbank" };

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

type Category = "blog" | "kennisbank" | "tool" | "funding";

export default async function KennisPage({ searchParams }: Props) {
  const { category, search } = await searchParams;
  const cat = POST_CATEGORIES.some((c) => c.value === category)
    ? (category as Category)
    : undefined;

  const { items } = await api.posts.list({
    ...(cat ? { category: cat } : {}),
    ...(search ? { search } : {}),
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        label="Kennis delen"
        title="Kennisbank"
        description="Toolkits, artikelen en funding-tips van en voor changemakers"
        action={
          <Link href="/kennis/nieuw" className={buttonClasses("primary", "sm")}>
            <Plus size={16} /> Artikel
          </Link>
        }
        className="mb-0"
      />

      <Link
        href="/kennis/materiaal"
        className="bg-surface-container-low hover:bg-surface-container text-label-lg text-on-surface flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Lock size={16} className="text-secondary" />
          Lesmateriaal uit de leergangen
        </span>
        <span className="text-label-md text-secondary">Alleen voor alumni</span>
      </Link>

      <form action="/kennis" method="get" role="search" className="relative">
        {cat && <input type="hidden" name="category" value={cat} />}
        <label>
          <span className="sr-only">Zoeken in de kennisbank</span>
          <Search
            size={20}
            className="text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
            name="search"
            type="search"
            defaultValue={search ?? ""}
            placeholder="Zoek artikelen, tools en tips..."
            className={cn(fieldClasses, "pl-12")}
          />
        </label>
      </form>

      <KennisFilters
        {...(cat ? { activeCategory: cat } : {})}
        {...(search ? { search } : {})}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="Geen artikelen gevonden"
          description="Probeer een andere categorie of deel zelf je kennis."
          action={
            <Link href="/kennis/nieuw" className={buttonClasses("tonal", "sm")}>
              Artikel schrijven
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((post) => (
            <Link
              key={post.id}
              href={`/kennis/${post.slug}`}
              className="group bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col overflow-hidden rounded-2xl transition-shadow"
            >
              {post.coverImageUrl && (
                <div className="bg-surface-container relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.coverImageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="bg-primary-fixed text-label-sm text-on-primary-fixed w-fit rounded-full px-2.5 py-0.5 uppercase">
                  {POST_CATEGORIES.find((c) => c.value === post.category)
                    ?.label ?? post.category}
                </span>
                <h3 className="text-title-md text-on-surface group-hover:text-primary-container line-clamp-2 transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-body-sm text-secondary line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Avatar
                    src={post.author.avatarUrl}
                    naam={post.author.naam ?? post.author.name ?? "?"}
                    size="xs"
                  />
                  <div className="min-w-0">
                    <p className="text-label-md text-on-surface truncate">
                      {post.author.naam ?? post.author.name}
                    </p>
                    {post.publishedAt && (
                      <p className="text-body-sm text-secondary">
                        {formatDate(post.publishedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
