"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Bookmark,
  Flag,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export function MakerActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const swipe = trpc.matches.swipe.useMutation({
    onSuccess: (data) => {
      if (data.matched) {
        router.push("/berichten");
      }
    },
  });

  const canStart = trpc.messages.canStart.useQuery({ targetId: userId });
  const start = trpc.messages.start.useMutation({
    onSuccess: ({ matchId }) => router.push(`/berichten/${matchId}`),
  });

  const bookmark = trpc.connections.bookmark.useMutation();
  const report = trpc.reports.submit.useMutation();
  const block = trpc.reports.block.useMutation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="primary"
        onClick={() => swipe.mutate({ targetId: userId, decision: "like" })}
        disabled={swipe.isPending}
      >
        <Heart size={16} />
        Connect
      </Button>

      {canStart.data?.allowed && (
        <Button
          variant="secondary"
          onClick={() => start.mutate({ targetId: userId })}
          disabled={start.isPending}
        >
          <MessageCircle size={16} />
          Bericht
        </Button>
      )}

      <Button
        variant="secondary"
        onClick={() => bookmark.mutate({ targetUserId: userId })}
        disabled={bookmark.isPending}
      >
        <Bookmark size={16} />
        {bookmark.data?.bookmarked === false ? "Verwijderd" : "Opslaan"}
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setShowMore((v) => !v)}
          aria-label="Meer opties"
        >
          <MoreHorizontal size={16} />
        </Button>

        {showMore && (
          <div className="bg-surface-container-lowest shadow-floating absolute top-full right-0 z-10 mt-1 min-w-48 overflow-hidden rounded-2xl p-1">
            <button
              className="text-on-surface hover:bg-surface-container-low text-label-lg flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left"
              onClick={() => {
                report.mutate({ targetUserId: userId, type: "other" });
                setShowMore(false);
              }}
            >
              <Flag size={14} />
              Rapporteer gebruiker
            </button>
            <button
              className="text-error hover:bg-error-container text-label-lg flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left"
              onClick={() => {
                block.mutate({ targetId: userId });
                setShowMore(false);
                router.push("/ontdekken");
              }}
            >
              Blokkeer gebruiker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
