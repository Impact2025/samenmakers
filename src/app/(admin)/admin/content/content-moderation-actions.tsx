"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  type: "post" | "event" | "report";
  id: string;
}

export function ContentModerationActions({ type, id }: Props) {
  const utils = trpc.useUtils();

  const publishPost = trpc.admin.publishPost.useMutation({
    onSuccess: () => void utils.admin.pendingContent.invalidate(),
  });

  const publishEvent = trpc.admin.publishEvent.useMutation({
    onSuccess: () => void utils.admin.pendingContent.invalidate(),
  });

  const resolveReport = trpc.admin.resolveReport.useMutation({
    onSuccess: () => void utils.admin.pendingContent.invalidate(),
  });

  if (type === "post") {
    return (
      <Button
        variant="primary"
        onClick={() => publishPost.mutate({ id })}
        disabled={publishPost.isPending}
      >
        {publishPost.isPending ? <Spinner /> : "Publiceren"}
      </Button>
    );
  }

  if (type === "event") {
    return (
      <Button
        variant="primary"
        onClick={() => publishEvent.mutate({ id })}
        disabled={publishEvent.isPending}
      >
        {publishEvent.isPending ? <Spinner /> : "Publiceren"}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        onClick={() => resolveReport.mutate({ id, status: "resolved" })}
        disabled={resolveReport.isPending}
      >
        Oplossen
      </Button>
      <Button
        variant="secondary"
        onClick={() => resolveReport.mutate({ id, status: "dismissed" })}
        disabled={resolveReport.isPending}
      >
        Afwijzen
      </Button>
    </div>
  );
}
