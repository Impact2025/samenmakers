"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

const PERKS = [
  "Gratis toegang tot de meeste events",
  "Toegang tot de alumni-community",
  "Blijvend contact met je klas en het netwerk",
];

export function MembershipPanel({
  priceLabel,
  pastDue,
}: {
  priceLabel: string;
  pastDue: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const checkout = trpc.membership.checkout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  return (
    <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
      {pastDue && (
        <p role="alert" className="text-body-md text-error">
          Je vorige betaling is niet gelukt. Sluit het lidmaatschap opnieuw af
          of werk je betaalgegevens bij.
        </p>
      )}
      <div>
        <p className="text-display-lg text-on-surface">{priceLabel}</p>
        <p className="text-body-md text-secondary">per jaar, incl. btw</p>
      </div>
      <ul className="flex flex-col gap-2">
        {PERKS.map((p) => (
          <li key={p} className="text-body-md text-on-surface flex gap-2">
            <Check size={18} className="text-tertiary mt-0.5 shrink-0" />
            {p}
          </li>
        ))}
      </ul>
      <p className="text-body-sm text-secondary">
        Niet gratis: meerdaagse programma&apos;s met een eigen prijs. Je
        lidmaatschap verlengt automatisch en je kunt het altijd opzeggen.
      </p>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="text-body-md text-on-surface">
          Ik ga akkoord met de{" "}
          <Link
            href="/voorwaarden"
            target="_blank"
            className="text-primary-container underline"
          >
            algemene voorwaarden
          </Link>{" "}
          en de{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="text-primary-container underline"
          >
            privacyverklaring
          </Link>
          .
        </span>
      </label>
      {checkout.error && (
        <p role="alert" className="text-body-sm text-error">
          {checkout.error.message}
        </p>
      )}
      <div>
        <Button
          disabled={!accepted || checkout.isPending}
          onClick={() => checkout.mutate({ acceptTerms: true })}
        >
          {checkout.isPending ? "Bezig..." : `Lid worden voor ${priceLabel}`}
        </Button>
      </div>
    </section>
  );
}
