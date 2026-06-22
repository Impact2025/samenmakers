import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import { BlogRowActions } from "./blog-row-actions";

export const metadata: Metadata = { title: "Admin — Blog" };

function scoreColor(score: number) {
  if (score >= 80) return "text-primary";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

export default async function AdminBlogPage() {
  const posts = await api.blog.list();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface">Blog</h1>
          <p className="text-sm text-outline mt-1">
            AI-gegenereerde, SEO-geoptimaliseerde artikelen
          </p>
        </div>
        <Link
          href="/admin/blog/nieuw"
          className="px-5 py-3 bg-primary-container text-on-primary text-[11px] font-bold tracking-widest uppercase"
        >
          + Nieuw artikel
        </Link>
      </div>

      <Card hover={false}>
        <CardBody className="p-0">
          {posts.length === 0 ? (
            <p className="p-8 text-sm text-outline">Nog geen artikelen.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">TITEL</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">SEO</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">STATUS</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">BIJGEWERKT</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-hairline/50 last:border-0">
                    <td className="p-4">
                      <Link href={`/admin/blog/${p.id}`} className="font-semibold text-on-surface hover:underline">
                        {p.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" size="sm">{p.category}</Badge>
                        {p.aiGenerated && <Badge variant="primary" size="sm">AI</Badge>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-black ${scoreColor(p.seoScore)}`}>{p.seoScore}</span>
                      <span className="text-outline text-xs">/100</span>
                    </td>
                    <td className="p-4">
                      {p.isPublished ? (
                        <Badge variant="primary" size="sm">Live</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Concept</Badge>
                      )}
                    </td>
                    <td className="p-4 text-outline text-xs">{formatDate(p.updatedAt)}</td>
                    <td className="p-4 text-right">
                      <BlogRowActions id={p.id} isPublished={p.isPublished} slug={p.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
