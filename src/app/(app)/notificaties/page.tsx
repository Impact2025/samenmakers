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
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <p className="text-label-caps text-outline mb-1">ACCOUNT</p>
          <h1 className="text-headline-md text-on-surface">Notificaties</h1>
        </div>
        {unreadCount > 0 && <div className="shrink-0"><MarkAllReadButton /></div>}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 border border-hairline">
          <p className="text-on-surface-variant mb-1">Geen notificaties</p>
          <p className="text-body-sm text-outline">Nieuwe activiteit verschijnt hier.</p>
        </div>
      ) : (
        <div className="divide-y divide-hairline border border-hairline">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.url ?? "/dashboard"}
              className={`flex gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors ${
                !n.readAt ? "bg-primary/3" : "bg-white"
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">
                {TYPE_ICONS[n.type] ?? "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-on-surface">{n.title}</p>
                  {!n.readAt && (
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5">{n.body}</p>
                <p className="text-xs text-outline mt-1">
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
