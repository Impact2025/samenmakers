"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Flag, MoreHorizontal } from "lucide-react";
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

  const bookmark = trpc.connections.bookmark.useMutation();
  const report = trpc.reports.submit.useMutation();
  const block = trpc.reports.block.useMutation();

  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        variant="primary"
        onClick={() => swipe.mutate({ targetId: userId, decision: "like" })}
        disabled={swipe.isPending}
      >
        <Heart size={14} className="mr-2" />
        Connect
      </Button>

      <Button
        variant="secondary"
        onClick={() => bookmark.mutate({ targetUserId: userId })}
        disabled={bookmark.isPending}
      >
        <Bookmark size={14} className="mr-2" />
        {bookmark.data?.bookmarked === false ? "Verwijderd" : "Opslaan"}
      </Button>

      <div className="relative ml-auto">
        <Button
          variant="ghost"
          onClick={() => setShowMore((v) => !v)}
          aria-label="Meer opties"
        >
          <MoreHorizontal size={16} />
        </Button>

        {showMore && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-hairline shadow-sm z-10 min-w-44">
            <button
              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2"
              onClick={() => {
                report.mutate({ targetUserId: userId, type: "other" });
                setShowMore(false);
              }}
            >
              <Flag size={14} />
              Rapporteer gebruiker
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-surface-container-low flex items-center gap-2"
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
