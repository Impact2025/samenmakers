"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { EventPhase } from "@/server/events/status";
import { formatEuro } from "@/server/events/pricing";

interface Props {
  eventId: string;
  slug: string;
  phase: EventPhase;
  me: {
    status: string | null;
    offerExpiresAt: Date | null;
    canManage: boolean;
    ticketCount: number;
  } | null;
  meetingUrl: string | null;
  hasMeetingUrl: boolean;
  format: "in_person" | "online" | "hybrid";
  /** Ticketed event: aanmelden via /bestellen, wachtlijst blijft via RSVP. */
  ticketed: boolean;
  priceFrom: number | null;
}

function formatDeadline(d: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function RsvpPanel({
  eventId,
  slug,
  phase,
  me,
  meetingUrl,
  hasMeetingUrl,
  format,
  ticketed,
  priceFrom,
}: Props) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const refresh = () => startRefresh(() => router.refresh());

  const rsvp = trpc.events.rsvp.useMutation({
    onSuccess: (r) => {
      setMessage(
        r.status === "waitlisted"
          ? "Je staat op de wachtlijst. We laten het je weten zodra er een plek vrijkomt."
          : "Je bent aangemeld! Je ontvangt een bevestiging per mail.",
      );
      refresh();
    },
    onError: (e) => setMessage(e.message),
  });
  const cancel = trpc.events.cancelRsvp.useMutation({
    onSuccess: () => {
      setMessage(
        "Je bent afgemeld. Je plek gaat naar de volgende op de wachtlijst.",
      );
      refresh();
    },
    onError: (e) => setMessage(e.message),
  });
  const accept = trpc.events.acceptOffer.useMutation({
    onSuccess: () => {
      setMessage("Top, je plek is bevestigd!");
      refresh();
    },
    onError: (e) => setMessage(e.message),
  });

  const busy =
    rsvp.isPending || cancel.isPending || accept.isPending || refreshing;
  const status = me?.status ?? null;
  const open = phase === "open" || phase === "sold_out";

  const orderHref = `/events/${slug}/bestellen`;
  const priceLabel =
    priceFrom === null
      ? ""
      : priceFrom === 0
        ? "Gratis"
        : `Vanaf ${formatEuro(priceFrom)}`;

  let body: React.ReactNode;
  if (
    ticketed &&
    phase !== "cancelled" &&
    phase !== "ended" &&
    (me?.ticketCount ?? 0) > 0
  ) {
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-body-md text-on-surface flex-1">
          <strong>
            Je hebt{" "}
            {me!.ticketCount === 1
              ? "een ticket"
              : `${me!.ticketCount} tickets`}
            .
          </strong>
        </p>
        {meetingUrl && format !== "in_person" && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-container text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors"
          >
            <ExternalLink size={14} aria-hidden /> Deelnemen online
          </a>
        )}
        <Link
          href="/events/mijn"
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          Mijn tickets
        </Link>
      </div>
    );
  } else if (
    ticketed &&
    status === "offered" &&
    phase !== "cancelled" &&
    phase !== "ended"
  ) {
    body = (
      <div className="space-y-3">
        <p className="text-body-md text-on-surface">
          <strong>Er is een plek voor je vrij.</strong>
          {me?.offerExpiresAt && (
            <> Bestel je ticket vóór {formatDeadline(me.offerExpiresAt)}.</>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={orderHref}
            className="bg-primary-container text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 transition-colors"
          >
            Ticket bestellen
          </Link>
          <Button
            variant="ghost"
            onClick={() => cancel.mutate({ eventId })}
            disabled={busy}
          >
            Ik kan niet
          </Button>
        </div>
      </div>
    );
  } else if (ticketed && phase === "open") {
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={orderHref}
          className="bg-primary-container text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 transition-colors"
        >
          Tickets bestellen
        </Link>
        <p className="text-body-md text-secondary">
          {priceLabel}
          {priceLabel && " · "}ook zonder account
        </p>
      </div>
    );
  } else if (phase === "cancelled") {
    body = (
      <p className="text-body-md text-on-surface-variant">
        Aanmelden is niet meer mogelijk.
      </p>
    );
  } else if (phase === "ended") {
    body = (
      <p className="text-body-md text-on-surface-variant">
        Dit event is afgelopen.
      </p>
    );
  } else if (!me) {
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/inloggen?next=${encodeURIComponent(`/events/${slug}`)}`}
          className="bg-primary-container text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 transition-colors"
        >
          {phase === "sold_out"
            ? "Inloggen voor de wachtlijst"
            : "Inloggen en aanmelden"}
        </Link>
        <p className="text-body-md text-secondary">
          Nog geen lid?{" "}
          <Link href="/aanmelden" className="underline underline-offset-4">
            Maak gratis een account
          </Link>
        </p>
      </div>
    );
  } else if (status === "offered") {
    body = (
      <div className="space-y-3">
        <p className="text-body-md text-on-surface">
          <strong>Er is een plek voor je vrij.</strong>
          {me.offerExpiresAt && (
            <> Bevestig vóór {formatDeadline(me.offerExpiresAt)}.</>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => accept.mutate({ eventId })} disabled={busy}>
            {accept.isPending ? <Spinner /> : "Plek bevestigen"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => cancel.mutate({ eventId })}
            disabled={busy}
          >
            Ik kan niet
          </Button>
        </div>
      </div>
    );
  } else if (status === "registered" || status === "checked_in") {
    body = (
      <div className="space-y-3">
        <p className="text-body-md text-on-surface">
          <strong>
            {status === "checked_in"
              ? "Je bent ingecheckt."
              : "Je bent aangemeld."}
          </strong>
        </p>
        {meetingUrl && format !== "in_person" && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-container text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors"
          >
            <ExternalLink size={14} aria-hidden /> Deelnemen online
          </a>
        )}
        {open && status === "registered" && (
          <div>
            <Button
              variant="ghost"
              onClick={() => cancel.mutate({ eventId })}
              disabled={busy}
            >
              {cancel.isPending ? <Spinner /> : "Toch niet? Afmelden"}
            </Button>
          </div>
        )}
      </div>
    );
  } else if (status === "waitlisted") {
    body = (
      <div className="space-y-3">
        <p className="text-body-md text-on-surface">
          <strong>Je staat op de wachtlijst.</strong> Komt er een plek vrij, dan
          bieden we die je aan per mail en melding.
        </p>
        <Button
          variant="ghost"
          onClick={() => cancel.mutate({ eventId })}
          disabled={busy}
        >
          Van de wachtlijst af
        </Button>
      </div>
    );
  } else if (phase === "live") {
    body = (
      <p className="text-body-md text-on-surface-variant">
        Dit event is al begonnen; aanmelden kan niet meer.
      </p>
    );
  } else {
    body = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button onClick={() => rsvp.mutate({ eventId })} disabled={busy}>
          {rsvp.isPending ? (
            <Spinner />
          ) : phase === "sold_out" ? (
            "Op de wachtlijst"
          ) : (
            "Aanmelden"
          )}
        </Button>
        <p className="text-body-md text-secondary">
          {phase === "sold_out"
            ? "Vol. Op volgorde van aanmelding bieden we vrijgekomen plekken aan."
            : hasMeetingUrl && format !== "in_person"
              ? "Na aanmelding zie je hier de deelnamelink."
              : "Gratis · bevestiging per mail met agenda-item"}
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Aanmelden"
      className="bg-surface-container-lowest shadow-elevated space-y-3 rounded-2xl p-5"
    >
      {body}
      {message && (
        <p
          className="text-body-md text-on-surface-variant"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </section>
  );
}
