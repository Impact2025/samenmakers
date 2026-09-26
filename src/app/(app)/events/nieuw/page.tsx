import type { Metadata } from "next";
import { NewEventForm } from "./new-event-form";

export const metadata: Metadata = { title: "Nieuw event" };

export default function NieuwEventPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-label-md text-secondary mb-1">Events</p>
        <h1 className="text-headline-lg text-on-surface">Event aanmaken</h1>
        <p className="text-body-md text-secondary mt-1">
          Beschikbaar voor Pro-leden
        </p>
      </div>
      <NewEventForm />
    </div>
  );
}
