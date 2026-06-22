import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { POST_CATEGORIES } from "@/lib/constants";
import { renderMarkdown } from "@/lib/markdown";
import { PostInteractions } from "./post-interactions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.posts.bySlug({ slug });
  if (!post) return { title: "Niet gevonden" };

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const image = post.ogImageUrl ?? post.coverImageUrl ?? undefined;
  const canonical = post.canonicalUrl ?? `${APP_URL}/kennis/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords.length ? post.keywords : undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: image ? [image] : [],
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await api.posts.bySlug({ slug });
  if (!post) notFound();

  const canonical = post.canonicalUrl ?? `${APP_URL}/kennis/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    image: post.ogImageUrl ?? post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { "@type": "Person", name: post.author.naam ?? post.author.name ?? "Samenmakers" },
    publisher: { "@type": "Organization", name: "Samenmakers" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    keywords: post.keywords.join(", ") || undefined,
  };

  return (
    <article className="max-w-2xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden border border-hairline">
          <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <Badge variant="default" className="mb-4">
          {POST_CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
        </Badge>
        <h1 className="text-headline-md text-on-surface mb-4">{post.title}</h1>

        <div className="flex items-center gap-3">
          <Avatar
            src={post.author.avatarUrl}
            naam={post.author.naam ?? post.author.name ?? "?"}
            size="sm"
            grayscale={false}
          />
          <div>
            <p className="font-semibold text-on-surface text-sm">
              {post.author.naam ?? post.author.name}
            </p>
            {post.publishedAt && (
              <p className="text-xs text-outline">{formatDate(post.publishedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose prose-sm max-w-none text-on-surface-variant prose-headings:text-on-surface prose-a:text-primary prose-strong:text-on-surface"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      {/* Interactions */}
      <PostInteractions
        postId={post.id}
        reactionCount={post.reactions.length}
        comments={post.comments}
      />
    </article>
  );
}
