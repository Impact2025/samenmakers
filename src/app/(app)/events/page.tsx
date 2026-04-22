import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import { Spinner } from "@/components/ui/spinner";
import { EventsList } from "./events-list";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const { items } = await api.events.list({ upcoming: true, limit: 20 });

  return (
    <div>
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">COMMUNITY</p>
        <h1 className="text-headline-md text-on-surface">Events</h1>
      </div>
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <EventsList initialItems={items} />
      </Suspense>
    </div>
  );
}
