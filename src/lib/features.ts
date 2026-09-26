// Feature flags. Each leeromgeving phase ships behind a flag so it can be
// piloted before general release (docs/leeromgeving-plan.md §9).
// NEXT_PUBLIC_ vars are inlined at build time, so these work client-side too.

export const features = {
  /** Leeromgeving fase 1: programma's, edities, leerpad. On by default outside production. */
  leren:
    process.env.NEXT_PUBLIC_FEATURE_LEREN === "true" ||
    (process.env.NEXT_PUBLIC_FEATURE_LEREN !== "false" &&
      process.env.NODE_ENV !== "production"),
  /** Events fase 2: tickets, Stripe Checkout, Connect-uitbetaling (docs/events-plan.md §9). */
  eventTickets:
    process.env.NEXT_PUBLIC_FEATURE_EVENT_TICKETS === "true" ||
    (process.env.NEXT_PUBLIC_FEATURE_EVENT_TICKETS !== "false" &&
      process.env.NODE_ENV !== "production"),
};
