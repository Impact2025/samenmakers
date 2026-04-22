import type { MetadataRoute } from "next";
import { SECTOREN } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const sectorUrls = SECTOREN.map((s) => ({
    url: `${APP_URL}/sector/${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
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
  ];
}
