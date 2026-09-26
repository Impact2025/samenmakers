import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { features } from "@/lib/features";
import { OrderForm } from "./order-form";

export const metadata: Metadata = {
  title: "Tickets bestellen",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ geannuleerd?: string }>;
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { geannuleerd } = await searchParams;
  const data = features.eventTickets
    ? await api.tickets.forEvent({ slug: decodeURIComponent(slug) })
    : null;
  if (!data || data.tickets.length === 0) notFound();
  const e = data.event;
  const open = e.phase === "open" || e.phase === "sold_out";

  return (
    <div className="max-w-2xl space-y-6">
      <nav aria-label="Kruimelpad" className="text-body-md text-secondary">
        <Link href={`/events/${e.slug}`} className="hover:text-on-surface">
          ← {e.title}
        </Link>
      </nav>
      <header>
        <p className="text-label-md text-secondary mb-1">TICKETS</p>
        <h1 className="text-headline-lg text-on-surface">{e.title}</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          {formatEventWhen(e.startAt, e.endAt, e.timezone)} · {eventWhere(e)}
        </p>
      </header>

      {geannuleerd && (
        <p
          className="border-hairline text-body-md text-on-surface-variant border bg-white p-4"
          role="status"
        >
          De betaling is afgebroken; er is niets afgeschreven. Je kunt het
          hieronder opnieuw proberen.
        </p>
      )}

      {open ? (
        <OrderForm
          eventId={e.id}
          slug={e.slug}
          tickets={data.tickets}
          fields={data.fields}
          buyer={data.buyer}
          refundUntilHours={e.refundUntilHours}
          allowTransfer={e.allowTransfer}
        />
      ) : (
        <p className="border-hairline text-body-md text-on-surface-variant border bg-white p-5">
          Bestellen is voor dit event niet meer mogelijk.
        </p>
      )}
    </div>
  );
}
