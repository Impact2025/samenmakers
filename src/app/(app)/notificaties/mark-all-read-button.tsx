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
      className="text-label-caps text-primary hover:underline disabled:opacity-50"
    >
      Alles als gelezen markeren
    </button>
  );
}
