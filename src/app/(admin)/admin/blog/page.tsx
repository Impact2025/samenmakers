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
  return "text-error";
}

export default async function AdminBlogPage() {
  const posts = await api.blog.list();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Blog</h1>
          <p className="text-secondary mt-1 text-sm">
            AI-gegenereerde, SEO-geoptimaliseerde artikelen
          </p>
        </div>
        <Link
          href="/admin/blog/nieuw"
          className="bg-primary-container text-on-primary text-label-sm px-5 py-3 font-bold uppercase"
        >
          + Nieuw artikel
        </Link>
      </div>

      <Card hover={false}>
        <CardBody className="p-0">
          {posts.length === 0 ? (
            <p className="text-secondary p-8 text-sm">Nog geen artikelen.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-hairline border-b text-left">
                  <th className="text-secondary text-label-sm p-4 uppercase">
                    Titel
                  </th>
                  <th className="text-secondary text-label-sm p-4 uppercase">
                    SEO
                  </th>
                  <th className="text-secondary text-label-sm p-4 uppercase">
                    Status
                  </th>
                  <th className="text-secondary text-label-sm p-4 uppercase">
                    Bijgewerkt
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-hairline/50 border-b last:border-0"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/blog/${p.id}`}
                        className="text-on-surface font-semibold hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="default" size="sm">
                          {p.category}
                        </Badge>
                        {p.aiGenerated && (
                          <Badge variant="primary" size="sm">
                            AI
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-extrabold ${scoreColor(p.seoScore)}`}
                      >
                        {p.seoScore}
                      </span>
                      <span className="text-secondary text-xs">/100</span>
                    </td>
                    <td className="p-4">
                      {p.isPublished ? (
                        <Badge variant="primary" size="sm">
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Concept
                        </Badge>
                      )}
                    </td>
                    <td className="text-secondary p-4 text-xs">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="p-4 text-right">
                      <BlogRowActions
                        id={p.id}
                        isPublished={p.isPublished}
                        slug={p.slug}
                      />
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
