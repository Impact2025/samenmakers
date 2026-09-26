"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";

interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

interface Props {
  profileVisibility: "public" | "members";
  blockedUsers: BlockedUser[];
}

export function PrivacySettings({ profileVisibility, blockedUsers }: Props) {
  const [visibility, setVisibility] = useState(profileVisibility);
  const utils = trpc.useUtils();

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => void utils.users.me.invalidate(),
  });

  const unblock = trpc.reports.unblock.useMutation({
    onSuccess: () => void utils.reports.myBlockedUsers.invalidate(),
  });

  function saveVisibility() {
    updateUser.mutate({ profileVisibility: visibility });
  }

  return (
    <div className="space-y-6">
      {/* Profile visibility */}
      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">
            Profielzichtbaarheid
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            {(["members", "public"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`text-label-md flex-1 border py-3 transition-colors ${
                  visibility === v
                    ? "bg-on-surface text-surface-container-lowest border-transparent"
                    : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
                }`}
              >
                {v === "members" ? "Alleen leden" : "Publiek"}
              </button>
            ))}
          </div>
          <p className="text-body-md text-secondary">
            {visibility === "members"
              ? "Alleen ingelogde leden kunnen je profiel bekijken."
              : "Je profiel is vindbaar via zoekmachines."}
          </p>
          <Button
            variant="primary"
            onClick={saveVisibility}
            disabled={updateUser.isPending || visibility === profileVisibility}
          >
            {updateUser.isPending ? <Spinner /> : "Opslaan"}
          </Button>
        </CardBody>
      </Card>

      {/* Blocked users */}
      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">
            GEBLOKKEERDE GEBRUIKERS ({blockedUsers.length})
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {blockedUsers.length === 0 ? (
            <p className="text-body-md text-secondary px-6 py-6">
              Geen geblokkeerde gebruikers
            </p>
          ) : (
            <ul className="divide-hairline divide-y">
              {blockedUsers.map((bu) => (
                <li
                  key={bu.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <span className="text-on-surface text-secondary font-mono text-sm text-xs">
                    {bu.blockedId}
                  </span>
                  <button
                    onClick={() => unblock.mutate({ targetId: bu.blockedId })}
                    disabled={unblock.isPending}
                    className="text-secondary hover:text-error flex items-center gap-1 text-xs transition-colors"
                  >
                    <X size={12} />
                    Deblokkeren
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Account deletion */}
      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">Account verwijderen</h2>
        </CardHeader>
        <CardBody>
          <DeleteAccount />
        </CardBody>
      </Card>
    </div>
  );
}

function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestDeletion() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/gdpr/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Er is iets misgegaan");
        return;
      }
      await signOut({ callbackUrl: "/?account=verwijderd" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-on-surface-variant">
        Na je aanvraag heb je 30 dagen bedenktijd. Daarna worden je profiel,
        matches en berichten definitief gewist. Log je binnen die 30 dagen
        opnieuw in, dan annuleer je de verwijdering.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-error text-sm font-semibold hover:underline"
        >
          Account verwijdering aanvragen →
        </button>
      ) : (
        <div className="space-y-3">
          <Input
            label='Typ "VERWIJDER" om te bevestigen'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
          {error && (
            <p className="text-body-sm text-error" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => void requestDeletion()}
              disabled={loading || confirm !== "VERWIJDER"}
            >
              {loading ? <Spinner /> : "Definitief aanvragen"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuleren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
