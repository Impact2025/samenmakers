import type { MetadataRoute } from "next";
import { and, eq, desc, gte } from "drizzle-orm";
import { SECTOREN } from "@/lib/constants";
import { db } from "@/server/db";
import { events, posts } from "@/server/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

// Leest uit de database: niet tijdens de build prerenderen (CI heeft geen database).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sectorUrls = SECTOREN.map((s) => ({
    url: `${APP_URL}/sector/${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const publishedPosts = await db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.publishedAt))
    .limit(1000);

  const postUrls = publishedPosts.map((p) => ({
    url: `${APP_URL}/kennis/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Publieke, gepubliceerde events (ook recent afgelopen: die pagina's blijven waardevol).
  const publicEvents = await db
    .select({ slug: events.slug, updatedAt: events.updatedAt })
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        eq(events.visibility, "public"),
        gte(events.startAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      ),
    )
    .orderBy(desc(events.startAt))
    .limit(1000);

  const eventUrls = publicEvents.map((e) => ({
    url: `${APP_URL}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${APP_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `https://samenmakers.nl/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${APP_URL}/over`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/voorwaarden`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/aanmelden`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/inloggen`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...sectorUrls,
    ...postUrls,
    ...eventUrls,
  ];
}
