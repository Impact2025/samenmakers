"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
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
      <div className="border-hairline border py-20 text-center">
        <p className="text-on-surface-variant mb-2">Nog geen gesprekken</p>
        <p className="text-body-md text-secondary">
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
    <div className="border-hairline divide-hairline divide-y border">
      {matches.map((match) => {
        const other = match.userId === me?.id ? match.target : match.user;
        const lastMsg = match.messages[0];
        const displayName = other.naam ?? other.name ?? "Maker";

        return (
          <Link
            key={match.id}
            href={`/berichten/${match.id}`}
            className="hover:bg-surface-container-low flex items-center gap-4 px-5 py-4 transition-colors"
          >
            <Avatar
              src={other.avatarUrl}
              naam={displayName}
              size="md"
              grayscale={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-on-surface text-sm font-semibold">
                  {displayName}
                </p>
                {lastMsg && (
                  <span className="text-secondary shrink-0 text-[10px]">
                    {formatRelative(new Date(lastMsg.createdAt))}
                  </span>
                )}
              </div>
              <p className="text-secondary mt-0.5 truncate text-xs">
                {lastMsg?.content ?? "Stuur een eerste bericht"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
