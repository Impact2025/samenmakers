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
      <article className="border-on-surface border bg-white">
        <div className="border-outline space-y-2 border-b border-dashed p-6">
          <p className="text-label-caps text-outline">
            TICKET · {t.ticketName}
          </p>
          <h1 className="text-headline-sm text-on-surface">{e.title}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {formatEventWhen(e.startAt, e.endAt, e.timezone)}
          </p>
          <p className="text-body-sm text-on-surface-variant">
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
            <p className="text-on-surface py-10 text-center font-black">
              {e.status === "cancelled"
                ? "Dit event is geannuleerd"
                : t.status === "refunded"
                  ? "Dit ticket is terugbetaald"
                  : "Dit ticket is niet meer geldig"}
            </p>
          )}
          <p className="text-body text-on-surface font-semibold">
            {t.holderName}
          </p>
          {t.checkedInAt && (
            <p className="text-label-caps text-primary">✓ Ingecheckt</p>
          )}
        </div>
      </article>

      {valid && e.meetingUrl && e.format !== "in_person" && (
        <a
          href={e.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary-container text-on-primary text-label-caps block px-6 py-3 text-center"
        >
          Online deelnemen
        </a>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href={`/events/${e.slug}`}
          className="border-hairline text-label-caps text-on-surface hover:border-on-surface border px-4 py-2"
        >
          Eventpagina
        </Link>
        <a
          href={`/api/events/${e.slug}/ics`}
          className="border-hairline text-label-caps text-on-surface hover:border-on-surface border px-4 py-2"
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
      <p className="text-outline text-center text-[11px]">
        Deze link is je ticket. Deel hem alleen met wie het ticket gebruikt.
      </p>
    </div>
  );
}
