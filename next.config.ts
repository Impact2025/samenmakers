import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.stripe.com https://*.pusher.com wss://*.pusher.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.openstreetmap.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "web-push", "pusher"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  // Oude URL's van weshapethefuture.nl → de nieuwe pagina's. Tijdelijk (307) zolang de
  // site nog onder /wstf staat; maak ze permanent bij de verhuizing naar de hoofdroute.
  async redirects() {
    const old: Array<[string, string]> = [
      ["/about.php", "/wstf/over-ons"],
      ["/programs.php", "/wstf/programmas"],
      [
        "/social-entrepreneurship-course.php",
        "/wstf/leergang-sociaal-ondernemen",
      ],
      [
        "/social-intrapreneurship-course.php",
        "/wstf/leergang-social-intrapreneurship",
      ],
      ["/reshaping-your-future.php", "/wstf/reshaping-your-future"],
      ["/alumni.php", "/wstf/alumni"],
      ["/community.php", "/wstf/community"],
      ["/contact.php", "/wstf/contact"],
      ["/privacy-policy.php", "/wstf/privacybeleid"],
      [
        "/cancellelation-policy-events.php",
        "/wstf/annuleringsbeleid-evenementen",
      ],
      ["/terms-and-condition.php", "/wstf/algemene-voorwaarden"],
    ];
    return [
      ...old.map(([source, destination]) => ({
        source,
        destination,
        permanent: false,
      })),
      {
        source: "/interview-:slug.php",
        destination: "/wstf/interview/:slug",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Alleen rapporteren: de browser meldt schendingen in de console zonder iets te
          // blokkeren. Pas na een schone periode omzetten naar Content-Security-Policy.
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
};

// Zonder SENTRY_AUTH_TOKEN worden geen sourcemaps geüpload en doet de build niets extra's.
export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
