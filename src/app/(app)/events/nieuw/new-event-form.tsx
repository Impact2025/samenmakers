"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/events/event-form";

export function NewEventForm() {
  const router = useRouter();
  const create = trpc.events.create.useMutation({
    onSuccess: (event, vars) => {
      router.push(
        vars.publish ? `/events/${event.slug}` : `/events/${event.slug}/beheer`,
      );
    },
  });

  return (
    <EventForm
      submitting={create.isPending}
      error={create.error?.message}
      onSubmit={(values, intent) =>
        create.mutate({ ...values, publish: intent === "publish" })
      }
      actions={
        <>
          <Button type="submit" name="intent" value="publish" variant="primary">
            Publiceren
          </Button>
          <Button type="submit" name="intent" value="draft" variant="secondary">
            Opslaan als concept
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuleren
          </Button>
        </>
      }
    />
  );
}
