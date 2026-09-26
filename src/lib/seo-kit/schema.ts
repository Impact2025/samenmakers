// ─────────────────────────────────────────────────────────────────────────
// seo-kit — drop-in JSON-LD builders (geen dependencies)
// Copy deze map naar ELKE Next.js-site: src/lib/seo-kit/
// Render elk object via:
//   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
// ─────────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleInput {
  url: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  publisherName: string;
  publisherLogo: string;
}

export function organizationSchema(i: {
  name: string;
  url: string;
  logo: string;
  description: string;
  email?: string;
  foundingDate?: string;
  areaServed?: string;
  founderName?: string;
  founderUrl?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: i.name,
    url: i.url,
    logo: i.logo,
    description: i.description,
    ...(i.email ? { email: i.email } : {}),
    ...(i.foundingDate ? { foundingDate: i.foundingDate } : {}),
    ...(i.areaServed ? { areaServed: i.areaServed } : {}),
    ...(i.founderName
      ? {
          founder: {
            "@type": "Person",
            name: i.founderName,
            ...(i.founderUrl ? { url: i.founderUrl } : {}),
          },
        }
      : {}),
    ...(i.sameAs?.length ? { sameAs: i.sameAs } : {}),
  };
}

export function websiteSchema(i: {
  name: string;
  url: string;
  description: string;
  searchUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: i.name,
    url: i.url,
    description: i.description,
    ...(i.searchUrl
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${i.searchUrl}?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface EventInput {
  url: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  image?: string;
  /** schema.org EventAttendanceMode */
  attendance: "offline" | "online" | "mixed";
  status: "scheduled" | "cancelled";
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  onlineUrl?: string;
  organizerName: string;
  organizerUrl?: string;
  offerUrl?: string;
  /** Laagste ticketprijs in euro's; standaard 0 (gratis). */
  price?: number;
  availability?: "InStock" | "SoldOut";
  currency?: string;
}

export function eventSchema(i: EventInput) {
  const mode = {
    offline: "https://schema.org/OfflineEventAttendanceMode",
    online: "https://schema.org/OnlineEventAttendanceMode",
    mixed: "https://schema.org/MixedEventAttendanceMode",
  }[i.attendance];
  const place =
    i.attendance !== "online"
      ? {
          "@type": "Place",
          name: i.locationName ?? i.address ?? "Locatie volgt",
          ...(i.address ? { address: i.address } : {}),
          ...(i.latitude !== undefined && i.longitude !== undefined
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: i.latitude,
                  longitude: i.longitude,
                },
              }
            : {}),
        }
      : null;
  const virtual =
    i.attendance !== "offline"
      ? { "@type": "VirtualLocation", url: i.onlineUrl ?? i.url }
      : null;
  const location = place && virtual ? [place, virtual] : (place ?? virtual);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: i.name,
    description: i.description,
    startDate: i.startDate,
    ...(i.endDate ? { endDate: i.endDate } : {}),
    eventAttendanceMode: mode,
    eventStatus:
      i.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    location,
    ...(i.image ? { image: [i.image] } : {}),
    organizer: {
      "@type": "Organization",
      name: i.organizerName,
      ...(i.organizerUrl ? { url: i.organizerUrl } : {}),
    },
    ...(i.offerUrl
      ? {
          offers: {
            "@type": "Offer",
            url: i.offerUrl,
            price: i.price ?? 0,
            priceCurrency: i.currency ?? "EUR",
            availability: `https://schema.org/${i.availability ?? "InStock"}`,
          },
        }
      : {}),
    url: i.url,
  };
}

export function articleSchema(i: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: i.headline,
    description: i.description,
    image: i.image,
    datePublished: i.datePublished,
    dateModified: i.dateModified,
    author: { "@type": "Person", name: i.authorName },
    publisher: {
      "@type": "Organization",
      name: i.publisherName,
      logo: { "@type": "ImageObject", url: i.publisherLogo },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": i.url },
  };
}
