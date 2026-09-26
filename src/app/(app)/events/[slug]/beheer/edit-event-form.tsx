"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  EventForm,
  type EventFormInitial,
} from "@/components/events/event-form";

export function EditEventForm({
  event,
}: {
  event: EventFormInitial & { id: string };
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const update = trpc.events.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      router.refresh();
    },
  });

  return (
    <>
      <EventForm
        initial={event}
        submitting={update.isPending}
        error={update.error?.message}
        onSubmit={(values) => {
          setSaved(false);
          update.mutate({ id: event.id, data: values });
        }}
        actions={
          <Button type="submit" value="save">
            Wijzigingen opslaan
          </Button>
        }
      />
      {saved && (
        <p className="text-body-sm text-on-surface mt-3" role="status">
          Opgeslagen.
        </p>
      )}
    </>
  );
}
