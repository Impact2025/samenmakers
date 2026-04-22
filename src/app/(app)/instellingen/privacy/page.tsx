import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { PrivacySettings } from "./privacy-settings";

export const metadata: Metadata = { title: "Privacy & beveiliging" };

export default async function PrivacyPage() {
  const [me, blocked] = await Promise.all([
    api.users.me(),
    api.reports.myBlockedUsers(),
  ]);

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <p className="text-label-caps text-outline mb-1">INSTELLINGEN</p>
        <h1 className="text-headline-md text-on-surface">Privacy & beveiliging</h1>
      </div>
      <PrivacySettings
        profileVisibility={(me?.profileVisibility as "public" | "members") ?? "members"}
        blockedUsers={blocked}
      />
    </div>
  );
}
