import type { Metadata } from "next";
import { EventBeheer } from "@/app/(app)/events/[slug]/beheer/event-beheer";

export const metadata: Metadata = {
  title: "Admin — Event beheren",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminEventPage({ params }: Props) {
  const { slug } = await params;
  return (
    <EventBeheer
      slug={slug}
      terug={{ href: "/admin/events", label: "Events" }}
    />
  );
}
