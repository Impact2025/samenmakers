import type { Metadata } from "next";
import { ContactDetail } from "./contact-detail";

export const metadata: Metadata = { title: "Admin — Contact" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContactPage({ params }: Props) {
  const { id } = await params;
  return <ContactDetail id={id} />;
}
