import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationSettings } from "./notification-settings";

export const metadata: Metadata = { title: "Meldingen" };

export default async function NotificatiesPage() {
  const me = await api.users.me();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/instellingen"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Instellingen
      </Link>
      <PageHeader title="Meldingen & updates" className="mb-0" />
      <NotificationSettings weeklyDigest={me?.weeklyDigestEnabled ?? true} />
    </div>
  );
}
