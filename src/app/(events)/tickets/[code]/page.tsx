import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { api } from "@/trpc/server";
import { formatEventWhen, eventWhere } from "@/lib/event-format";
import { TicketActions } from "./ticket-actions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

// Ticketlinks zijn geheim: nooit indexeren, nooit doorsturen als referrer.
export const metadata: Metadata = {
  title: "Je ticket",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const t = await api.tickets.byCode({ code }).catch(() => null);
  if (!t) notFound();
  const e = t.event;
  const valid = t.status === "valid" && e.status === "published";
  const qr = valid
    ? await QRCode.toString(`${APP_URL}/tickets/${t.code}`, {
        type: "svg",
        margin: 1,
        width: 240,
      })
    : null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <article className="bg-surface-container-lowest shadow-elevated overflow-hidden rounded-2xl">
        <div className="border-outline space-y-2 border-b border-dashed p-6">
          <p className="text-label-md text-secondary">
            TICKET · {t.ticketName}
          </p>
          <h1 className="text-headline-md text-on-surface">{e.title}</h1>
          <p className="text-body-md text-on-surface-variant">
            {formatEventWhen(e.startAt, e.endAt, e.timezone)}
          </p>
          <p className="text-body-md text-on-surface-variant">
            {eventWhere(e)}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6">
          {qr ? (
            <div
              className="h-60 w-60"
              aria-label="QR-code van je ticket"
              role="img"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          ) : (
            <p className="text-on-surface py-10 text-center font-extrabold">
              {e.status === "cancelled"
                ? "Dit event is geannuleerd"
                : t.status === "refunded"
                  ? "Dit ticket is terugbetaald"
                  : "Dit ticket is niet meer geldig"}
            </p>
          )}
          <p className="text-body-md text-on-surface font-semibold">
            {t.holderName}
          </p>
          {t.checkedInAt && (
            <p className="text-label-md text-primary">✓ Ingecheckt</p>
          )}
        </div>
      </article>

      {valid && e.meetingUrl && e.format !== "in_person" && (
        <a
          href={e.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary-container text-on-primary text-label-md shadow-cta block inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-center transition-colors"
        >
          Online deelnemen
        </a>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href={`/events/${e.slug}`}
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          Eventpagina
        </Link>
        <a
          href={`/api/events/${e.slug}/ics`}
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          In agenda
        </a>
      </div>

      {(t.canTransfer || t.canCancel) && (
        <TicketActions
          code={t.code}
          canTransfer={t.canTransfer}
          canCancel={t.canCancel}
        />
      )}
      <p className="text-secondary text-label-sm text-center">
        Deze link is je ticket. Deel hem alleen met wie het ticket gebruikt.
      </p>
    </div>
  );
}
