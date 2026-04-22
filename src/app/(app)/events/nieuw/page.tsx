import type { Metadata } from "next";
import { NewEventForm } from "./new-event-form";

export const metadata: Metadata = { title: "Nieuw event" };

export default function NieuwEventPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">EVENTS</p>
        <h1 className="text-headline-md text-on-surface">Event aanmaken</h1>
        <p className="text-body-sm text-outline mt-1">Beschikbaar voor Pro-leden</p>
      </div>
      <NewEventForm />
    </div>
  );
}
