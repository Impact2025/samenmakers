import type { ErrorEvent } from "@sentry/nextjs";

// AVG: geen persoonsgegevens naar Sentry. Gebruikers-, cookie- en headerdata gaan eruit;
// alleen de fout, de stacktrace en de route blijven over.
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    delete event.request.query_string;
  }
  return event;
}

export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Zonder DSN is Sentry uit (lokaal, tests, voordat het account gekoppeld is).
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubEvent,
};
