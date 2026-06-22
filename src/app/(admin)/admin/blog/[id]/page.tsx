import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { BlogEditor } from "../blog-editor";

export const metadata: Metadata = { title: "Admin — Artikel bewerken" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const post = await api.blog.get({ id }).catch(() => null);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Artikel bewerken</h1>
        <span className="text-xs text-outline">
          {post.isPublished ? "Live" : "Concept"}
        </span>
      </div>
      <BlogEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? "",
          category: post.category,
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          focusKeyword: post.focusKeyword ?? "",
          keywords: post.keywords,
          canonicalUrl: post.canonicalUrl ?? "",
          ogImageUrl: post.ogImageUrl ?? "",
          isPublished: post.isPublished,
          aiGenerated: post.aiGenerated,
        }}
      />
    </div>
  );
}
