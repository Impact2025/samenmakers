"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface AppTopBarProps {
  user: {
    naam: string;
    avatarUrl?: string | null | undefined;
  } | null;
  unreadNotifications?: number;
  onMenuToggle?: () => void;
}

export function AppTopBar({ user, unreadNotifications = 0, onMenuToggle }: AppTopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white hairline-b flex justify-between items-center px-6 h-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-on-surface p-1"
          aria-label="Menu openen"
        >
          <Menu size={20} />
        </button>
        <Link
          href="/dashboard"
          className="text-xl font-black tracking-tighter text-on-surface"
        >
          SAMENMAKERS
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link href="/notificaties" className="relative p-1 text-outline hover:text-on-surface transition-colors">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>

        {user && (
          <Link href="/profiel" className="group">
            <Avatar
              src={user.avatarUrl}
              naam={user.naam}
              size="sm"
              grayscale={false}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
