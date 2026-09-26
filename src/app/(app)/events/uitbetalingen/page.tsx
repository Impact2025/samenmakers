import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { PayoutActions } from "./payout-actions";

export const metadata: Metadata = {
  title: "Uitbetalingen",
  robots: { index: false },
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ terug?: string }>;
}) {
  if (!features.eventTickets) notFound();
  const { terug } = await searchParams;
  const [status, me] = await Promise.all([
    api.tickets.connectStatus(),
    api.users.me(),
  ]);
  const isPro = me?.subscriptionStatus === "active" || me?.role === "admin";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-label-md text-secondary mb-1">
          <Link href="/events/mijn" className="hover:text-on-surface">
            Mijn events
          </Link>
        </p>
        <h1 className="text-headline-lg text-on-surface">Uitbetalingen</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          De opbrengst van je ticketverkoop komt via Stripe rechtstreeks op je
          eigen rekening.
        </p>
      </div>

      {status.isAdmin && (
        <p className="text-body-md text-on-surface-variant bg-surface-container-lowest shadow-card rounded-2xl p-4">
          Als beheerder komen betalingen voor jouw events op de platformrekening
          binnen; een eigen koppeling is niet nodig.
        </p>
      )}

      <section className="border-on-surface space-y-4 border bg-white p-6">
        {status.state === "ready" ? (
          <>
            <p className="text-on-surface font-extrabold">
              ✓ Je uitbetaalrekening is gekoppeld
            </p>
            <p className="text-body-md text-on-surface-variant">
              Je kunt betaalde tickets verkopen. Uitbetalingen, bankgegevens en
              overzichten beheer je in je Stripe-dashboard.
            </p>
          </>
        ) : status.state === "pending" ? (
          <>
            <p className="text-on-surface font-extrabold">Nog niet compleet</p>
            <p className="text-body-md text-on-surface-variant">
              {terug
                ? "Bedankt! Stripe controleert je gegevens; dat duurt meestal een paar minuten. Ververs deze pagina straks."
                : "Stripe heeft nog gegevens nodig voordat je betalingen kunt ontvangen."}
            </p>
          </>
        ) : (
          <>
            <p className="text-on-surface font-extrabold">Koppel je rekening</p>
            <ul className="text-body-md text-on-surface-variant list-disc space-y-1 pl-5">
              <li>
                Eenmalig: KvK- of persoonsgegevens en IBAN via Stripe (ca. 5
                minuten).
              </li>
              <li>
                Deelnemers betalen met iDEAL of kaart; het geld staat binnen
                enkele werkdagen op je rekening.
              </li>
              <li>Terugbetalingen lopen automatisch via dezelfde weg terug.</li>
            </ul>
          </>
        )}
        <PayoutActions state={status.state} canStart={isPro} />
        {!isPro && status.state === "none" && (
          <p className="text-body-md text-secondary">
            Betaalde tickets zijn beschikbaar met{" "}
            <Link
              href="/instellingen/abonnement"
              className="underline underline-offset-4"
            >
              Pro
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
