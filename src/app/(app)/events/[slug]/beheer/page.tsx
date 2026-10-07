import type { Metadata } from "next";
import { EventBeheer } from "./event-beheer";

export const metadata: Metadata = {
  title: "Event beheren",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ManageEventPage({ params }: Props) {
  const { slug } = await params;
  return (
    <EventBeheer
      slug={slug}
      terug={{ href: "/events/mijn", label: "Mijn events" }}
    />
  );
}
