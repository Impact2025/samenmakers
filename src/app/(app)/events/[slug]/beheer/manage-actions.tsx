"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ManageActions({
  eventId,
  slug,
  status,
  hasAudience,
}: {
  eventId: string;
  slug: string;
  status: "draft" | "published" | "cancelled";
  hasAudience: boolean;
}) {
  const router = useRouter();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const done = (msg: string) => {
    setNotice(msg);
    router.refresh();
  };

  const publish = trpc.events.publish.useMutation({
    onSuccess: () =>
      done("Gepubliceerd. Je event is nu te vinden en te delen."),
  });
  const unpublish = trpc.events.unpublish.useMutation({
    onSuccess: () => done("Terug naar concept."),
  });
  const cancel = trpc.events.cancel.useMutation({
    onSuccess: (r) => {
      setConfirmCancel(false);
      const parts = ["Geannuleerd."];
      if (r.notified > 0)
        parts.push(
          `${r.notified} deelnemers zijn per mail en melding geïnformeerd.`,
        );
      if ("refunded" in r && r.refunded > 0)
        parts.push(`${r.refunded} bestellingen terugbetaald.`);
      if ("refundFailures" in r && r.refundFailures > 0)
        parts.push(
          `${r.refundFailures} terugbetalingen mislukt: controleer ze bij Tickets.`,
        );
      done(parts.join(" "));
    },
  });
  const error = publish.error ?? unpublish.error ?? cancel.error;
  const busy = publish.isPending || unpublish.isPending || cancel.isPending;

  if (status === "cancelled") {
    return (
      <p className="text-body-md text-on-surface-variant bg-surface-container-lowest shadow-card rounded-2xl p-4">
        Dit event is geannuleerd.
      </p>
    );
  }

  return (
    <section
      className="border-on-surface space-y-4 border bg-white p-5"
      aria-label="Status"
    >
      <div className="flex flex-wrap items-center gap-3">
        {status === "draft" ? (
          <Button
            onClick={() => publish.mutate({ id: eventId })}
            disabled={busy}
          >
            {publish.isPending ? <Spinner /> : "Publiceren"}
          </Button>
        ) : (
          !hasAudience && (
            <Button
              variant="secondary"
              onClick={() => unpublish.mutate({ id: eventId })}
              disabled={busy}
            >
              Terug naar concept
            </Button>
          )
        )}
        <Link
          href={`/events/${slug}`}
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          {status === "draft" ? "Voorbeeld bekijken" : "Eventpagina"}
        </Link>
        {!confirmCancel && (
          <Button
            variant="ghost"
            onClick={() => setConfirmCancel(true)}
            disabled={busy}
          >
            Event annuleren
          </Button>
        )}
      </div>

      {confirmCancel && (
        <div className="border-hairline space-y-3 border-t pt-4">
          <label
            htmlFor="cancel-reason"
            className="text-label-md text-secondary block"
          >
            Reden (komt in de mail aan deelnemers)
          </label>
          <textarea
            id="cancel-reason"
            rows={2}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 w-full rounded-xl border border-transparent px-3 py-2 text-sm outline-none focus:ring-[3px]"
            placeholder="Bijvoorbeeld: de spreker is ziek; we plannen een nieuwe datum."
          />
          <div className="flex gap-3">
            <Button
              onClick={() =>
                cancel.mutate({
                  id: eventId,
                  ...(reason.trim() ? { reason: reason.trim() } : {}),
                })
              }
              disabled={busy}
            >
              {cancel.isPending ? <Spinner /> : "Definitief annuleren"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmCancel(false)}
              disabled={busy}
            >
              Toch niet
            </Button>
          </div>
        </div>
      )}

      {status === "draft" && (
        <p className="text-body-md text-secondary">
          Een concept is alleen voor jou zichtbaar. Na publiceren kunnen leden
          zich aanmelden.
        </p>
      )}
      {error && (
        <p className="text-body-md text-error" role="alert">
          {error.message}
        </p>
      )}
      {notice && (
        <p className="text-body-md text-on-surface" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
