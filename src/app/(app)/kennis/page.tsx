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
    category: category as
      | "blog"
      | "kennisbank"
      | "tool"
      | "funding"
      | undefined,
    search,
    limit: 20,
  });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-md text-secondary mb-1">PLATFORM</p>
          <h1 className="text-headline-lg text-on-surface">Kennisbank</h1>
        </div>
        <Link href="/kennis/nieuw" className="mt-1 shrink-0">
          <Button size="sm" variant="primary">
            + Artikel
          </Button>
        </Link>
      </div>

      <KennisFilters {...(category ? { activeCategory: category } : {})} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="border-hairline col-span-full border py-20 text-center">
            <p className="text-on-surface-variant">Geen artikelen gevonden</p>
          </div>
        ) : (
          items.map((post) => (
            <Link key={post.id} href={`/kennis/${post.slug}`}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="default" size="sm">
                      {POST_CATEGORIES.find((c) => c.value === post.category)
                        ?.label ?? post.category}
                    </Badge>
                  </div>
                  {post.coverImageUrl && (
                    <div className="bg-surface-container mb-3 aspect-video w-full overflow-hidden">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-on-surface mb-2 line-clamp-2 flex-1 font-extrabold">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-body-md text-on-surface-variant mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-2">
                    <Avatar
                      src={post.author.avatarUrl}
                      naam={post.author.naam ?? post.author.name ?? "?"}
                      size="xs"
                      grayscale={false}
                    />
                    <div>
                      <p className="text-on-surface text-xs font-semibold">
                        {post.author.naam ?? post.author.name}
                      </p>
                      {post.publishedAt && (
                        <p className="text-secondary text-[10px]">
                          {formatDate(post.publishedAt)}
                        </p>
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
