"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

interface Attendee {
  id: string;
  status: string;
  user: { id: string; naam: string | null; name: string | null; avatarUrl: string | null };
}

interface Props {
  eventId: string;
  attendees: Attendee[];
}

export function EventCheckinPanel({ eventId, attendees }: Props) {
  const [checkedIn, setCheckedIn] = useState<Set<string>>(
    new Set(attendees.filter((a) => a.status === "checked_in").map((a) => a.user.id)),
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function handleCheckin(userId: string) {
    setLoading(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setCheckedIn((prev) => new Set([...prev, userId]));
      }
    } finally {
      setLoading(null);
    }
  }

  const filtered = attendees.filter((a) => {
    const naam = (a.user.naam ?? a.user.name ?? "").toLowerCase();
    return naam.includes(search.toLowerCase());
  });

  const registered = filtered.filter((a) => a.status !== "waitlisted");
  const waitlisted = filtered.filter((a) => a.status === "waitlisted");

  return (
    <div className="border border-hairline p-5">
      <p className="text-label-caps text-outline mb-4">CHECK-IN PANEL</p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Zoek deelnemer…"
        className="w-full border border-hairline px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface mb-4"
      />

      <div className="space-y-2">
        {registered.map((a) => {
          const naam = a.user.naam ?? a.user.name ?? "Deelnemer";
          const isCheckedIn = checkedIn.has(a.user.id);
          const isLoading = loading === a.user.id;

          return (
            <div
              key={a.id}
              className={`flex items-center justify-between px-3 py-2.5 border transition-colors ${
                isCheckedIn
                  ? "border-primary/20 bg-primary/5"
                  : "border-hairline bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={a.user.avatarUrl} naam={naam} size="xs" grayscale={false} />
                <span className="text-sm font-medium text-on-surface">{naam}</span>
              </div>
              {isCheckedIn ? (
                <span className="text-xs font-medium text-primary">✓ Ingecheckt</span>
              ) : (
                <button
                  onClick={() => handleCheckin(a.user.id)}
                  disabled={isLoading}
                  className="text-xs font-bold text-on-surface border border-hairline px-3 py-1 hover:border-on-surface transition-colors disabled:opacity-40"
                >
                  {isLoading ? <Spinner /> : "Inchecken"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {waitlisted.length > 0 && (
        <div className="mt-4">
          <p className="text-label-caps text-outline mb-2">WACHTLIJST</p>
          <div className="space-y-2">
            {waitlisted.map((a) => {
              const naam = a.user.naam ?? a.user.name ?? "Deelnemer";
              return (
                <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 border border-hairline bg-surface-container-low opacity-60">
                  <Avatar src={a.user.avatarUrl} naam={naam} size="xs" grayscale />
                  <span className="text-sm text-on-surface-variant">{naam}</span>
                  <span className="ml-auto text-xs text-outline">Wachtlijst</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-outline mt-4">
        {checkedIn.size} / {registered.length} ingecheckt
      </p>
    </div>
  );
}
