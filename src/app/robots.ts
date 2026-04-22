import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/over", "/privacy", "/voorwaarden", "/sector/", "/profiel/"],
        disallow: [
          "/dashboard",
          "/berichten",
          "/matching",
          "/ontdekken",
          "/kennis/nieuw",
          "/events/nieuw",
          "/vragen/nieuw",
          "/instellingen",
          "/onboarding",
          "/admin",
          "/api/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
