import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ code: string }>;
}

export const metadata: Metadata = { title: "Uitnodiging Samenmakers" };

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  redirect(`/aanmelden?ref=${code}`);
}
