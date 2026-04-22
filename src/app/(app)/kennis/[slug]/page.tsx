import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { POST_CATEGORIES } from "@/lib/constants";
import { PostInteractions } from "./post-interactions";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.posts.bySlug({ slug });
  if (!post) return { title: "Niet gevonden" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { images: post.coverImageUrl ? [post.coverImageUrl] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await api.posts.bySlug({ slug });
  if (!post) notFound();

  return (
    <article className="max-w-2xl space-y-8">
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
      <div className="prose prose-sm max-w-none text-on-surface-variant">
        <p className="whitespace-pre-line">{post.content}</p>
      </div>

      {/* Interactions */}
      <PostInteractions
        postId={post.id}
        reactionCount={post.reactions.length}
        comments={post.comments}
      />
    </article>
  );
}
