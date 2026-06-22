"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";

export function BlogRowActions({
  id,
  isPublished,
  slug,
}: {
  id: string;
  isPublished: boolean;
  slug: string;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const setPublished = trpc.blog.setPublished.useMutation({
    onSuccess: () => {
      void utils.blog.list.invalidate();
      router.refresh();
    },
  });
  const remove = trpc.blog.remove.useMutation({
    onSuccess: () => {
      void utils.blog.list.invalidate();
      router.refresh();
    },
  });

  const busy = setPublished.isPending || remove.isPending;

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      {isPublished && (
        <Link href={`/kennis/${slug}`} className="text-outline hover:text-on-surface" target="_blank">
          Bekijk
        </Link>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => setPublished.mutate({ id, isPublished: !isPublished })}
        className="font-semibold text-primary hover:underline disabled:opacity-40"
      >
        {isPublished ? "Depubliceer" : "Publiceer"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm("Dit artikel definitief verwijderen?")) remove.mutate({ id });
        }}
        className="font-semibold text-red-500 hover:underline disabled:opacity-40"
      >
        Verwijder
      </button>
    </div>
  );
}
