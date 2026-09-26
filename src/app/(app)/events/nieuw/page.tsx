import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NewEventForm } from "./new-event-form";

export const metadata: Metadata = { title: "Nieuw event" };

export default function NieuwEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/events"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Evenementen
      </Link>
      <PageHeader
        title="Event aanmaken"
        description="Beschikbaar voor Pro-leden"
        className="mb-0"
      />
      <NewEventForm />
    </div>
  );
}
