"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { formatRelative } from "@/lib/date-utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Matches = inferRouterOutputs<AppRouter>["matches"]["myMatches"];

export function ConversationList({
  initialMatches,
}: {
  initialMatches: Matches;
}) {
  const { data: matches } = trpc.matches.myMatches.useQuery(undefined, {
    initialData: initialMatches,
  });
  const { data: me } = trpc.users.me.useQuery();

  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={22} />}
        title="Nog geen gesprekken"
        description="Maak matches om een gesprek te starten."
        action={
          <Link href="/matching" className={buttonClasses("primary", "sm")}>
            Naar matching
          </Link>
        }
      />
    );
  }

  return (
    <div className="bg-surface-container-lowest shadow-card flex flex-col gap-1 rounded-2xl p-1.5">
      {matches.map((match) => {
        const other = match.userId === me?.id ? match.target : match.user;
        const lastMsg = match.messages[0];
        const displayName = other.naam ?? other.name ?? "Maker";

        return (
          <Link
            key={match.id}
            href={`/berichten/${match.id}`}
            className="hover:bg-surface-container-low flex items-center gap-3 rounded-xl p-2.5 transition-colors"
          >
            <Avatar src={other.avatarUrl} naam={displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-title-md text-on-surface truncate">
                  {displayName}
                </p>
                {lastMsg && (
                  <span className="text-label-sm text-secondary shrink-0">
                    {formatRelative(new Date(lastMsg.createdAt))}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-secondary truncate">
                {lastMsg?.content ?? "Stuur een eerste bericht"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
