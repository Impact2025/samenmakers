import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { formatRelative } from "@/lib/date-utils";
import { MarkAllReadButton } from "./mark-all-read-button";

export const metadata: Metadata = { title: "Notificaties" };

const TYPE_ICONS: Record<string, string> = {
  new_match: "🤝",
  connection_request: "👋",
  new_message: "💬",
  event_reminder: "📅",
  profile_view: "👁",
  milestone: "🏆",
  referral_reward: "🎁",
  system: "🔔",
  event_post_suggestion: "✍️",
};

export default async function NotificatiesPage() {
  const notifications = await api.notifications.list({ limit: 50 });
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-md text-secondary mb-1">ACCOUNT</p>
          <h1 className="text-headline-lg text-on-surface">Notificaties</h1>
        </div>
        {unreadCount > 0 && (
          <div className="shrink-0">
            <MarkAllReadButton />
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border-hairline border py-20 text-center">
          <p className="text-on-surface-variant mb-1">Geen notificaties</p>
          <p className="text-body-md text-secondary">
            Nieuwe activiteit verschijnt hier.
          </p>
        </div>
      ) : (
        <div className="divide-hairline border-hairline divide-y border">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.url ?? "/dashboard"}
              className={`hover:bg-surface-container-low flex gap-4 px-5 py-4 transition-colors ${
                !n.readAt ? "bg-primary/3" : "bg-white"
              }`}
            >
              <span className="mt-0.5 shrink-0 text-xl">
                {TYPE_ICONS[n.type] ?? "🔔"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-on-surface text-sm font-semibold">
                    {n.title}
                  </p>
                  {!n.readAt && (
                    <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="text-body-md text-on-surface-variant mt-0.5">
                  {n.body}
                </p>
                <p className="text-secondary mt-1 text-xs">
                  {formatRelative(new Date(n.createdAt))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
