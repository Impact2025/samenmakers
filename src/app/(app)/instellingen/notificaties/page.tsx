import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { NotificationSettings } from "./notification-settings";

export const metadata: Metadata = { title: "Notificaties" };

export default async function NotificatiesPage() {
  const me = await api.users.me();

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <p className="text-label-caps text-outline mb-1">INSTELLINGEN</p>
        <h1 className="text-headline-md text-on-surface">Notificaties</h1>
      </div>
      <NotificationSettings weeklyDigest={me?.weeklyDigestEnabled ?? true} />
    </div>
  );
}
