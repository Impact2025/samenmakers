"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

interface Attendee {
  id: string;
  status: string;
  createdAt: Date;
  offerExpiresAt: Date | null;
  user: {
    id: string;
    naam: string | null;
    name: string | null;
    avatarUrl: string | null;
    email: string | null;
  };
}

const STATUS_LABEL: Record<string, string> = {
  registered: "Aangemeld",
  checked_in: "Ingecheckt",
  offered: "Plek aangeboden",
  waitlisted: "Wachtlijst",
};

function csvCell(v: string) {
  return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function EventCheckinPanel({
  eventId,
  eventTitle,
  attendees,
}: {
  eventId: string;
  eventTitle: string;
  attendees: Attendee[];
}) {
  const [checkedIn, setCheckedIn] = useState<Set<string>>(
    () =>
      new Set(
        attendees
          .filter((a) => a.status === "checked_in")
          .map((a) => a.user.id),
      ),
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function handleCheckin(userId: string) {
    setLoading(userId);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) setCheckedIn((prev) => new Set([...prev, userId]));
      else
        setError(
          ((await res.json().catch(() => ({}))) as { error?: string }).error ??
            "Inchecken mislukt",
        );
    } finally {
      setLoading(null);
    }
  }

  const name = (a: Attendee) => a.user.naam ?? a.user.name ?? "Deelnemer";
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return attendees.filter(
      (a) =>
        name(a).toLowerCase().includes(q) ||
        (a.user.email ?? "").toLowerCase().includes(q),
    );
  }, [attendees, search]);

  const seated = filtered.filter(
    (a) => a.status === "registered" || a.status === "checked_in",
  );
  const pending = filtered.filter(
    (a) => a.status === "offered" || a.status === "waitlisted",
  );
  const totalSeated = attendees.filter(
    (a) => a.status === "registered" || a.status === "checked_in",
  ).length;

  function exportCsv() {
    const rows = [
      ["Naam", "E-mail", "Status", "Aangemeld op"],
      ...attendees.map((a) => [
        name(a),
        a.user.email ?? "",
        checkedIn.has(a.user.id)
          ? STATUS_LABEL.checked_in!
          : (STATUS_LABEL[a.status] ?? a.status),
        new Date(a.createdAt).toLocaleString("nl-NL"),
      ]),
    ];
    // Puntkomma + BOM: opent direct correct in Nederlandse Excel.
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `deelnemers-${eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (attendees.length === 0) {
    return (
      <p className="text-body-md text-secondary bg-surface-container-lowest shadow-card rounded-2xl p-5">
        Nog geen aanmeldingen.
      </p>
    );
  }

  return (
    <div className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of e-mail…"
          aria-label="Zoek deelnemer"
          className="text-on-surface placeholder:text-secondary bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 min-w-[12rem] flex-1 rounded-xl border border-transparent px-3 py-2 text-sm outline-none focus:ring-[3px]"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="text-label-md text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          <Download size={14} aria-hidden /> CSV
        </button>
      </div>

      <p className="text-label-md text-secondary mb-3" aria-live="polite">
        {checkedIn.size} / {totalSeated} ingecheckt
      </p>
      {error && (
        <p className="text-body-md text-error mb-3" role="alert">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {seated.map((a) => {
          const isCheckedIn = checkedIn.has(a.user.id);
          return (
            <li
              key={a.id}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${isCheckedIn ? "bg-tertiary/10" : "bg-surface-container-low"}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={a.user.avatarUrl}
                  naam={name(a)}
                  size="xs"
                  grayscale={false}
                />
                <div className="min-w-0">
                  <p className="text-on-surface truncate text-sm font-medium">
                    {name(a)}
                  </p>
                  {a.user.email && (
                    <p className="text-secondary truncate text-xs">
                      {a.user.email}
                    </p>
                  )}
                </div>
              </div>
              {isCheckedIn ? (
                <span className="text-primary shrink-0 text-xs font-medium">
                  ✓ Ingecheckt
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleCheckin(a.user.id)}
                  disabled={loading === a.user.id}
                  className="text-on-surface hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition-colors disabled:opacity-40"
                >
                  {loading === a.user.id ? <Spinner /> : "Inchecken"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {pending.length > 0 && (
        <div className="mt-5">
          <p className="text-label-md text-secondary mb-2">
            WACHTLIJST ({pending.length})
          </p>
          <ol className="space-y-2">
            {pending.map((a) => (
              <li
                key={a.id}
                className="bg-surface-container-low flex items-center gap-3 rounded-2xl px-3 py-2.5"
              >
                <Avatar
                  src={a.user.avatarUrl}
                  naam={name(a)}
                  size="xs"
                  grayscale
                />
                <span className="text-on-surface-variant truncate text-sm">
                  {name(a)}
                </span>
                <span className="text-secondary ml-auto shrink-0 text-xs">
                  {STATUS_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
