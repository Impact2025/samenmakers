import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth/config";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { formatEuro } from "@/server/events/pricing";
import { PendingRefresh } from "./pending-refresh";

export const metadata: Metadata = {
  title: "Je bestelling",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string; orderId: string }>;
  searchParams: Promise<{ t?: string; betaald?: string }>;
}

const STATUS: Record<string, string> = {
  pending: "Betaling wordt verwerkt",
  paid: "Betaald",
  free: "Bevestigd",
  expired: "Verlopen",
  cancelled: "Geannuleerd",
  refunded: "Terugbetaald",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: Props) {
  const { orderId } = await params;
  const { t, betaald } = await searchParams;
  const [order, session] = await Promise.all([
    api.tickets.order({ orderId, ...(t ? { token: t } : {}) }),
    auth(),
  ]);
  if (!order) notFound();
  const e = order.event;
  const done = order.status === "paid" || order.status === "free";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Stripe stuurt terug vóór de webhook soms binnen is: kort verversen. */}
      {order.status === "pending" && betaald && <PendingRefresh />}

      <header className="space-y-2">
        {done ? (
          <p className="text-label-md text-primary inline-flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden /> {STATUS[order.status]}
          </p>
        ) : (
          <p className="text-label-md text-secondary">{STATUS[order.status]}</p>
        )}
        <h1 className="text-headline-lg text-on-surface">
          {done ? `Tot bij ${e.title}!` : e.title}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {formatEventWhen(e.startAt, e.endAt, e.timezone)} · {eventWhere(e)}
        </p>
      </header>

      {order.status === "pending" && (
        <p
          className="text-body-md text-on-surface-variant bg-surface-container-lowest shadow-card rounded-2xl p-4"
          role="status"
        >
          {betaald
            ? "We verwerken je betaling. Dit duurt meestal een paar seconden; je tickets verschijnen hier en in je mail."
            : "Deze bestelling is nog niet betaald."}
        </p>
      )}

      {done && (
        <section className="space-y-2">
          <h2 className="text-label-md text-on-surface">Je tickets</h2>
          <ul className="space-y-2">
            {order.tickets.map((tk, i) => (
              <li key={tk.code}>
                <Link
                  href={`/tickets/${tk.code}`}
                  className={`hover:border-on-surface flex items-center gap-3 border bg-white p-4 ${tk.status === "valid" ? "border-hairline" : "border-hairline opacity-50"}`}
                >
                  <Ticket
                    size={18}
                    className="text-secondary shrink-0"
                    aria-hidden
                  />
                  <span className="flex-1">
                    <span className="text-on-surface block font-semibold">
                      Ticket {i + 1} · {tk.name}
                    </span>
                    <span className="text-body-md text-secondary block">
                      {tk.holderName}
                      {tk.status !== "valid" &&
                        ` · ${tk.status === "refunded" ? "terugbetaald" : "geannuleerd"}`}
                    </span>
                  </span>
                  <span className="text-label-md text-primary">Openen →</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-body-md text-secondary">
            We hebben alles ook gemaild naar {order.buyerEmail}. Een ticket
            doorgeven aan een collega? Open het ticket.
          </p>
        </section>
      )}

      <section className="bg-surface-container-lowest shadow-card space-y-2 rounded-2xl p-5">
        <h2 className="text-label-md text-secondary">Overzicht</h2>
        <ul className="text-body-md text-on-surface-variant space-y-1">
          {order.items.map((it) => (
            <li key={it.name} className="flex justify-between gap-4">
              <span>
                {it.quantity} × {it.name}
              </span>
              <span>
                {it.unitPriceCents === 0
                  ? "Gratis"
                  : formatEuro(it.quantity * it.unitPriceCents)}
              </span>
            </li>
          ))}
          {order.discountCents > 0 && (
            <li className="flex justify-between gap-4">
              <span>Korting</span>
              <span>− {formatEuro(order.discountCents)}</span>
            </li>
          )}
        </ul>
        <p className="border-hairline text-on-surface flex justify-between border-t pt-2 font-semibold">
          <span>Totaal</span>
          <span>
            {order.totalCents === 0 ? "Gratis" : formatEuro(order.totalCents)}
          </span>
        </p>
      </section>

      {!session?.user && done && (
        <section className="border-on-surface space-y-3 border bg-white p-5">
          <p className="text-on-surface font-extrabold">
            Blijf in contact met de andere deelnemers
          </p>
          <p className="text-body-md text-on-surface-variant">
            Met een gratis We Shape the Future-profiel zie je wie er nog meer
            komt, vind je je tickets terug en word je gematcht met
            impact-ondernemers die bij je passen.
          </p>
          <Link
            href={`/aanmelden?email=${encodeURIComponent(order.buyerEmail)}`}
            className="bg-primary-container text-on-primary text-label-md shadow-cta inline-block inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors"
          >
            Gratis profiel maken
          </Link>
        </section>
      )}
    </div>
  );
}
