"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

export function MarkAllReadButton() {
  const router = useRouter();
  const markAll = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <button
      onClick={() => markAll.mutate()}
      disabled={markAll.isPending}
      className="bg-primary-fixed/50 text-label-md text-primary-container hover:bg-primary-fixed h-9 rounded-full px-4 transition-colors disabled:opacity-50"
    >
      Alles gelezen
    </button>
  );
}
