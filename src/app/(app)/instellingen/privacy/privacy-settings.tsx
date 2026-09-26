"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
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
                    ? "bg-on-surface text-on-primary border-on-surface"
                    : "border-hairline text-secondary hover:border-on-surface"
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
          <p className="text-body-md text-on-surface-variant mb-4">
            Als je je account verwijdert worden al je gegevens, matches en
            berichten permanent gewist. Dit is niet ongedaan te maken.
          </p>
          <a
            href="/api/gdpr/delete-request"
            className="text-error text-sm font-semibold hover:underline"
          >
            Account verwijdering aanvragen →
          </a>
        </CardBody>
      </Card>
    </div>
  );
}
