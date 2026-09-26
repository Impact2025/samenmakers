import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Eye,
  Gift,
  Handshake,
  MessageCircle,
  PenLine,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/trpc/server";
import { formatRelative } from "@/lib/date-utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { MarkAllReadButton } from "./mark-all-read-button";

export const metadata: Metadata = { title: "Meldingen" };

const TYPE_ICONS: Record<string, LucideIcon> = {
  new_match: Handshake,
  connection_request: UserPlus,
  new_message: MessageCircle,
  event_reminder: CalendarDays,
  profile_view: Eye,
  milestone: Trophy,
  referral_reward: Gift,
  system: Bell,
  event_post_suggestion: PenLine,
};

export default async function NotificatiesPage() {
  const notifications = await api.notifications.list({ limit: 50 });
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      <PageHeader
        title="Meldingen"
        description={
          unreadCount > 0 ? `${unreadCount} ongelezen` : "Alles gelezen"
        }
        action={unreadCount > 0 ? <MarkAllReadButton /> : undefined}
        className="mb-5"
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="Geen meldingen"
          description="Nieuwe activiteit verschijnt hier."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            const unread = !n.readAt;
            return (
              <Link
                key={n.id}
                href={n.url ?? "/dashboard"}
                className={cn(
                  "flex gap-3 rounded-2xl p-4 transition-colors",
                  unread
                    ? "bg-surface-container-lowest shadow-card"
                    : "bg-surface-container-low hover:bg-surface-container",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    unread
                      ? "bg-primary-container/10 text-primary-container"
                      : "bg-surface-container text-secondary",
                  )}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-title-md",
                        unread ? "text-on-surface" : "text-on-surface-variant",
                      )}
                    >
                      {n.title}
                    </p>
                    {unread && (
                      <span className="bg-primary-container mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant mt-0.5">
                    {n.body}
                  </p>
                  <p className="text-label-sm text-secondary mt-1">
                    {formatRelative(new Date(n.createdAt))}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
