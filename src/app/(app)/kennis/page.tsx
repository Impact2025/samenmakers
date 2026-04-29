import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { POST_CATEGORIES } from "@/lib/constants";
import { KennisFilters } from "./kennis-filters";

export const metadata: Metadata = { title: "Kennisbank" };

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function KennisPage({ searchParams }: Props) {
  const { category, search } = await searchParams;

  const { items } = await api.posts.list({
    category: category as "blog" | "kennisbank" | "tool" | "funding" | undefined,
    search,
    limit: 20,
  });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-caps text-outline mb-1">PLATFORM</p>
          <h1 className="text-headline-md text-on-surface">Kennisbank</h1>
        </div>
        <Link href="/kennis/nieuw" className="shrink-0 mt-1">
          <Button size="sm" variant="primary">+ Artikel</Button>
        </Link>
      </div>

      <KennisFilters {...(category ? { activeCategory: category } : {})} />

      <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-hairline">
            <p className="text-on-surface-variant">Geen artikelen gevonden</p>
          </div>
        ) : (
          items.map((post) => (
            <Link key={post.id} href={`/kennis/${post.slug}`}>
              <Card className="h-full">
                <CardBody className="p-5 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" size="sm">
                      {POST_CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                    </Badge>
                  </div>
                  {post.coverImageUrl && (
                    <div className="aspect-video w-full overflow-hidden mb-3 bg-surface-container">
                      <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-black text-on-surface mb-2 flex-1 line-clamp-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto">
                    <Avatar
                      src={post.author.avatarUrl}
                      naam={post.author.naam ?? post.author.name ?? "?"}
                      size="xs"
                      grayscale={false}
                    />
                    <div>
                      <p className="text-xs font-semibold text-on-surface">
                        {post.author.naam ?? post.author.name}
                      </p>
                      {post.publishedAt && (
                        <p className="text-[10px] text-outline">{formatDate(post.publishedAt)}</p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
