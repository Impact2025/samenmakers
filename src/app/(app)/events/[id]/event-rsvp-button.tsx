"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function EventRsvpButton({ eventId }: { eventId: string }) {
  const utils = trpc.useUtils();

  const rsvp = trpc.events.rsvp.useMutation({
    onSuccess: () => void utils.events.byId.invalidate({ id: eventId }),
  });

  const cancel = trpc.events.cancelRsvp.useMutation({
    onSuccess: () => void utils.events.byId.invalidate({ id: eventId }),
  });

  const isPending = rsvp.isPending || cancel.isPending;

  return (
    <div className="flex gap-3">
      <Button
        variant="primary"
        onClick={() => rsvp.mutate({ eventId })}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : "Aanmelden"}
      </Button>
      <Button
        variant="secondary"
        onClick={() => cancel.mutate({ eventId })}
        disabled={isPending}
      >
        Afmelden
      </Button>
    </div>
  );
}
