"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/date-utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Matches = inferRouterOutputs<AppRouter>["matches"]["myMatches"];

export function ConversationList({ initialMatches }: { initialMatches: Matches }) {
  const { data: matches } = trpc.matches.myMatches.useQuery(undefined, {
    initialData: initialMatches,
  });
  const { data: me } = trpc.users.me.useQuery();

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-20 border border-hairline">
        <p className="text-on-surface-variant mb-2">Nog geen gesprekken</p>
        <p className="text-body-sm text-outline">
          Maak matches via de{" "}
          <Link href="/matching" className="text-primary underline">
            Matching pagina
          </Link>{" "}
          om te beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-hairline divide-y divide-hairline">
      {matches.map((match) => {
        const other = match.userId === me?.id ? match.target : match.user;
        const lastMsg = match.messages[0];
        const displayName = other.naam ?? other.name ?? "Maker";

        return (
          <Link
            key={match.id}
            href={`/berichten/${match.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors"
          >
            <Avatar
              src={other.avatarUrl}
              naam={displayName}
              size="md"
              grayscale={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-on-surface text-sm">{displayName}</p>
                {lastMsg && (
                  <span className="text-[10px] text-outline shrink-0">
                    {formatRelative(new Date(lastMsg.createdAt))}
                  </span>
                )}
              </div>
              <p className="text-xs text-outline truncate mt-0.5">
                {lastMsg?.content ?? "Stuur een eerste bericht"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
