"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, Lock } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro } from "@/server/events/pricing";

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  kind: "free" | "paid" | "donation";
  priceCents: number;
  maxPerOrder: number;
  left: number | null;
  state: "not_started" | "on_sale" | "ended";
  salesStart: Date | null;
  salesEnd: Date | null;
}

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  required: boolean;
  options: string[];
}

const input =
  "w-full border border-hairline bg-white px-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-on-surface";

function dateShort(d: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

/** Eén scherm: tickets kiezen, gegevens, vragen → betalen. Samen met Stripe ≤ 3 stappen. */
export function OrderForm({
  eventId,
  slug,
  tickets,
  fields,
  buyer,
  refundUntilHours,
  allowTransfer,
}: {
  eventId: string;
  slug: string;
  tickets: Ticket[];
  fields: Field[];
  buyer: { name: string; email: string } | null;
  refundUntilHours: number | null;
  allowTransfer: boolean;
}) {
  const [qty, setQty] = useState<Record<string, number>>(() =>
    // Eén beschikbaar tickettype: alvast 1 selecteren scheelt een klik.
    tickets.filter((t) => t.state === "on_sale" && t.left !== 0).length === 1
      ? { [tickets.find((t) => t.state === "on_sale" && t.left !== 0)!.id]: 1 }
      : {},
  );
  const [amount, setAmount] = useState<Record<string, string>>({});
  const [name, setName] = useState(buyer?.name ?? "");
  const [email, setEmail] = useState(buyer?.email ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);

  const checkout = trpc.tickets.checkout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const lines = useMemo(
    () =>
      tickets
        .filter((t) => (qty[t.id] ?? 0) > 0)
        .map((t) => {
          const unit =
            t.kind === "free"
              ? 0
              : t.kind === "paid"
                ? t.priceCents
                : Math.round(
                    Number((amount[t.id] ?? "").replace(",", ".")) * 100,
                  ) || t.priceCents;
          return { t, q: qty[t.id]!, unit };
        }),
    [tickets, qty, amount],
  );
  const total = lines.reduce((s, l) => s + l.q * l.unit, 0);
  const count = lines.reduce((s, l) => s + l.q, 0);

  function change(t: Ticket, delta: number) {
    setQty((q) => {
      const max = Math.min(t.maxPerOrder, t.left ?? Infinity);
      const next = Math.max(0, Math.min(max, (q[t.id] ?? 0) + delta));
      return { ...q, [t.id]: next };
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    checkout.mutate({
      eventId,
      items: lines.map((l) => ({
        ticketId: l.t.id,
        quantity: l.q,
        ...(l.t.kind === "donation" ? { amountCents: l.unit } : {}),
      })),
      buyer: { name: name.trim(), email: email.trim() },
      answers,
      acceptTerms: true,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section aria-labelledby="t-kies" className="space-y-2">
        <h2 id="t-kies" className="text-label-md text-on-surface">
          1 · Kies je tickets
        </h2>
        <ul className="divide-hairline bg-surface-container-lowest shadow-card divide-y rounded-2xl">
          {tickets.map((t) => {
            const soldOut = t.left === 0;
            const available = t.state === "on_sale" && !soldOut;
            const q = qty[t.id] ?? 0;
            return (
              <li
                key={t.id}
                className={`flex flex-wrap items-center gap-4 p-4 ${available ? "" : "opacity-60"}`}
              >
                <div className="min-w-[12rem] flex-1">
                  <p className="text-on-surface font-semibold">{t.name}</p>
                  {t.description && (
                    <p className="text-body-md text-on-surface-variant">
                      {t.description}
                    </p>
                  )}
                  <p className="text-body-md text-secondary mt-1">
                    {t.state === "not_started" && t.salesStart
                      ? `Verkoop start ${dateShort(t.salesStart)}`
                      : t.state === "ended"
                        ? "Verkoop gesloten"
                        : soldOut
                          ? "Uitverkocht"
                          : t.left !== null && t.left <= 10
                            ? `Nog ${t.left} beschikbaar`
                            : t.salesEnd
                              ? `Te koop tot ${dateShort(t.salesEnd)}`
                              : null}
                  </p>
                </div>
                <div className="min-w-[5rem] text-right">
                  <p className="text-on-surface font-extrabold">
                    {t.kind === "free"
                      ? "Gratis"
                      : t.kind === "donation"
                        ? `Vanaf ${formatEuro(t.priceCents)}`
                        : formatEuro(t.priceCents)}
                  </p>
                  {t.kind === "paid" && (
                    <p className="text-secondary text-[11px]">incl. btw</p>
                  )}
                </div>
                <div
                  className="border-hairline flex items-center border"
                  role="group"
                  aria-label={`Aantal ${t.name}`}
                >
                  <button
                    type="button"
                    onClick={() => change(t, -1)}
                    disabled={!available || q === 0}
                    className="p-2 disabled:opacity-30"
                    aria-label="Minder"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="w-8 text-center text-sm font-semibold"
                    aria-live="polite"
                  >
                    {q}
                  </span>
                  <button
                    type="button"
                    onClick={() => change(t, 1)}
                    disabled={!available}
                    className="p-2 disabled:opacity-30"
                    aria-label="Meer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {t.kind === "donation" && q > 0 && (
                  <label className="text-body-md text-on-surface-variant flex w-full items-center gap-2">
                    Bedrag per ticket €
                    <input
                      inputMode="decimal"
                      value={
                        amount[t.id] ??
                        (t.priceCents / 100).toFixed(2).replace(".", ",")
                      }
                      onChange={(ev) =>
                        setAmount((a) => ({ ...a, [t.id]: ev.target.value }))
                      }
                      className="border-surface-container bg-surface-container-lowest inline-flex w-24 items-center justify-center gap-2 rounded-full border px-2 py-1 text-sm transition-colors"
                      aria-label={`Bedrag voor ${t.name}`}
                    />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="t-gegevens" className="space-y-3">
        <h2 id="t-gegevens" className="text-label-md text-on-surface">
          2 · Jouw gegevens
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-label-md text-secondary mb-1 block">
              Naam *
            </span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-label-md text-secondary mb-1 block">
              E-mail *
            </span>
            <input
              className={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
        </div>
        {!buyer && (
          <p className="text-body-md text-secondary">
            Bestellen kan zonder account; je tickets komen per mail.{" "}
            <Link
              href={`/inloggen?next=${encodeURIComponent(`/events/${slug}/bestellen`)}`}
              className="underline underline-offset-4"
            >
              Al lid? Log in
            </Link>
          </p>
        )}

        {fields.map((f) => (
          <label
            key={f.id}
            className={
              f.type === "checkbox" ? "flex items-start gap-2" : "block"
            }
          >
            {f.type === "checkbox" ? (
              <>
                <input
                  type="checkbox"
                  className="accent-primary mt-1"
                  checked={answers[f.id] === "ja"}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [f.id]: e.target.checked ? "ja" : "",
                    }))
                  }
                  required={f.required}
                />
                <span className="text-on-surface text-sm">
                  {f.label}
                  {f.required && " *"}
                </span>
              </>
            ) : (
              <>
                <span className="text-label-md text-secondary mb-1 block">
                  {f.label}
                  {f.required && " *"}
                </span>
                {f.type === "textarea" ? (
                  <textarea
                    className={input}
                    rows={3}
                    maxLength={1000}
                    required={f.required}
                    value={answers[f.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [f.id]: e.target.value }))
                    }
                  />
                ) : f.type === "select" ? (
                  <select
                    className={input}
                    required={f.required}
                    value={answers[f.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [f.id]: e.target.value }))
                    }
                  >
                    <option value="">Kies…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={input}
                    maxLength={1000}
                    required={f.required}
                    value={answers[f.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [f.id]: e.target.value }))
                    }
                  />
                )}
              </>
            )}
          </label>
        ))}
      </section>

      <section
        aria-labelledby="t-afrekenen"
        className="border-on-surface space-y-4 border bg-white p-5"
      >
        <h2 id="t-afrekenen" className="text-label-md text-on-surface">
          3 · {total > 0 ? "Afrekenen" : "Bevestigen"}
        </h2>
        {lines.length > 0 && (
          <ul className="text-body-md text-on-surface-variant space-y-1">
            {lines.map((l) => (
              <li key={l.t.id} className="flex justify-between gap-4">
                <span>
                  {l.q} × {l.t.name}
                </span>
                <span>
                  {l.unit === 0 ? "Gratis" : formatEuro(l.q * l.unit)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="border-hairline flex items-baseline justify-between border-t pt-3">
          <span className="text-label-md text-secondary">Totaal</span>
          <span className="text-headline-md text-on-surface">
            {total === 0 ? "Gratis" : formatEuro(total)}
          </span>
        </div>
        <label className="text-body-md text-on-surface-variant flex items-start gap-2">
          <input
            type="checkbox"
            className="accent-primary mt-1"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
          />
          <span>
            Ik ga akkoord met de{" "}
            <Link
              href="/voorwaarden"
              className="underline underline-offset-4"
              target="_blank"
            >
              voorwaarden
            </Link>
            .{" "}
            {refundUntilHours === null
              ? "Tickets worden niet terugbetaald."
              : `Annuleren met terugbetaling kan tot ${refundUntilHours >= 48 ? `${Math.round(refundUntilHours / 24)} dagen` : `${refundUntilHours} uur`} voor de start.`}
            {allowTransfer && " Je kunt je ticket doorgeven aan iemand anders."}
          </span>
        </label>
        {checkout.error && (
          <p className="text-body-md text-error" role="alert">
            {checkout.error.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={count === 0 || !terms || checkout.isPending}
        >
          {checkout.isPending ? (
            <Spinner />
          ) : total > 0 ? (
            <>
              <Lock size={14} className="mr-2" aria-hidden /> Betalen met iDEAL
              of kaart
            </>
          ) : (
            "Tickets bevestigen"
          )}
        </Button>
        {total > 0 && (
          <p className="text-secondary text-center text-[11px]">
            Veilig betalen via Stripe. Kortingscode? Die vul je in bij het
            betalen.
          </p>
        )}
      </section>
    </form>
  );
}
