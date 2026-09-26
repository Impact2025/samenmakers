import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    author: {
      "@type": "Person",
      name: post.author.naam ?? post.author.name ?? "We Shape the Future",
    },
    publisher: { "@type": "Organization", name: "We Shape the Future" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    keywords: post.keywords.join(", ") || undefined,
  };

  return (
    <article className="flex flex-col gap-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/kennis"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Kennisbank
      </Link>

      {post.coverImageUrl && (
        <div className="bg-surface-container shadow-elevated aspect-video w-full overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="flex flex-col gap-3">
        <span className="bg-primary-fixed text-label-sm text-on-primary-fixed w-fit rounded-full px-2.5 py-0.5 uppercase">
          {POST_CATEGORIES.find((c) => c.value === post.category)?.label ??
            post.category}
        </span>
        <h1 className="text-headline-lg sm:text-display-lg text-on-surface">
          {post.title}
        </h1>
        <div className="bg-surface-container-low flex items-center gap-3 rounded-xl p-3">
          <Avatar
            src={post.author.avatarUrl}
            naam={post.author.naam ?? post.author.name ?? "?"}
            size="xs"
            className="!h-10 !w-10"
          />
          <div className="min-w-0">
            <p className="text-label-lg text-on-surface truncate">
              {post.author.naam ?? post.author.name}
            </p>
            {post.publishedAt && (
              <p className="text-body-sm text-secondary">
                {formatDate(post.publishedAt)}
              </p>
            )}
          </div>
        </div>
      </header>

      <div
        className="lesson-content bg-surface-container-lowest shadow-card rounded-2xl p-5 sm:p-6"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      <PostInteractions
        postId={post.id}
        reactionCount={post.reactions.length}
        comments={post.comments}
      />
    </article>
  );
}
