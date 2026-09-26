"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro } from "@/server/events/pricing";

const input =
  "w-full h-[50px] px-4 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-secondary border border-transparent outline-none transition-all focus:bg-surface-container-lowest focus:border-primary-container focus:ring-[3px] focus:ring-primary-container/15";

export function TicketActions({
  code,
  canTransfer,
  canCancel,
}: {
  code: string;
  canTransfer: boolean;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "transfer" | "cancel">("none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const transfer = trpc.tickets.transfer.useMutation({
    onSuccess: () => {
      setMode("none");
      setDone(
        `Doorgegeven aan ${name}. Die ontvangt het ticket per mail; deze link werkt niet meer.`,
      );
    },
  });
  const cancel = trpc.tickets.cancelByCode.useMutation({
    onSuccess: (r) => {
      setMode("none");
      setDone(
        r.refundedCents > 0
          ? `Geannuleerd. ${formatEuro(r.refundedCents)} wordt teruggestort.`
          : "Geannuleerd.",
      );
      router.refresh();
    },
  });

  if (done)
    return (
      <p
        className="text-body-md text-on-surface bg-surface-container-lowest shadow-card rounded-2xl p-4"
        role="status"
      >
        {done}
      </p>
    );

  return (
    <section
      className="bg-surface-container-lowest shadow-card space-y-4 rounded-2xl p-5"
      aria-label="Ticket beheren"
    >
      {mode === "none" && (
        <div className="flex flex-wrap gap-3">
          {canTransfer && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMode("transfer")}
            >
              Doorgeven
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" size="sm" onClick={() => setMode("cancel")}>
              Annuleren
            </Button>
          )}
        </div>
      )}

      {mode === "transfer" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            transfer.mutate({ code, name: name.trim(), email: email.trim() });
          }}
        >
          <p className="text-body-md text-on-surface-variant">
            Kun je zelf niet? Geef je ticket door aan een collega of vriend.
          </p>
          <label className="block">
            <span className="text-label-lg text-on-surface mb-1.5 block">
              Naam
            </span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </label>
          <label className="block">
            <span className="text-label-lg text-on-surface mb-1.5 block">
              E-mail
            </span>
            <input
              className={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {transfer.error && (
            <p className="text-body-md text-error" role="alert">
              {transfer.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={transfer.isPending}>
              {transfer.isPending ? <Spinner /> : "Doorgeven"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode("none")}
            >
              Terug
            </Button>
          </div>
        </form>
      )}

      {mode === "cancel" && (
        <div className="space-y-3">
          <p className="text-body-md text-on-surface">
            Weet je het zeker? Je ticket vervalt en een betaald bedrag wordt
            teruggestort. Je plek gaat naar de wachtlijst.
          </p>
          {cancel.error && (
            <p className="text-body-md text-error" role="alert">
              {cancel.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => cancel.mutate({ code })}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? <Spinner /> : "Ja, annuleren"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode("none")}>
              Nee
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
