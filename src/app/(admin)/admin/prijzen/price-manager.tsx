"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";

const toEuro = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const toCents = (value: string) =>
  Math.round(Number(value.replace(",", ".")) * 100);

export function PriceManager({
  membershipCents,
  eventCents,
  activeMembers,
}: {
  membershipCents: number;
  eventCents: number;
  activeMembers: number;
}) {
  const router = useRouter();
  const [membership, setMembership] = useState(toEuro(membershipCents));
  const [event, setEvent] = useState(toEuro(eventCents));
  const [saved, setSaved] = useState(false);
  const save = trpc.admin.setPrices.useMutation({
    onSuccess: () => {
      setSaved(true);
      router.refresh();
    },
  });

  return (
    <form
      className="bg-surface-container-lowest shadow-card grid max-w-xl gap-5 rounded-2xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        save.mutate({
          membershipCents: toCents(membership),
          eventCents: toCents(event),
        });
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>
          Jaarlidmaatschap alumni (€ per jaar)
        </span>
        <input
          required
          inputMode="decimal"
          className={fieldClasses}
          value={membership}
          onChange={(e) => setMembership(e.target.value)}
        />
        <span className="text-body-sm text-secondary">
          Geldt voor nieuwe leden. {activeMembers} actieve{" "}
          {activeMembers === 1 ? "lid houdt" : "leden houden"} de prijs waarvoor
          ze zijn ingestapt.
        </span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Standaardprijs per event (€)</span>
        <input
          required
          inputMode="decimal"
          className={fieldClasses}
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        />
        <span className="text-body-sm text-secondary">
          Voor niet-leden en cursisten. Wordt voorgesteld bij het aanmaken van
          een betaald ticket; per event blijft aanpassen mogelijk.
        </span>
      </label>
      {save.error && (
        <p role="alert" className="text-body-sm text-error">
          {save.error.message}
        </p>
      )}
      {saved && (
        <p role="status" className="text-body-md text-on-surface">
          Opgeslagen.
        </p>
      )}
      <div>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Bezig..." : "Prijzen opslaan"}
        </Button>
      </div>
    </form>
  );
}
