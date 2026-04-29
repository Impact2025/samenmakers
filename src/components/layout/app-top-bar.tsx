"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, LayoutGrid, Search, MessageSquare, Calendar, BookOpen, HelpCircle, Heart, GraduationCap, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutGrid },
  { href: "/ontdekken", label: "ONTDEKKEN", icon: Search },
  { href: "/matching", label: "MATCHING", icon: Heart },
  { href: "/berichten", label: "BERICHTEN", icon: MessageSquare },
  { href: "/events", label: "EVENTS", icon: Calendar },
  { href: "/kennis", label: "KENNISBANK", icon: BookOpen },
  { href: "/vragen", label: "Q&A", icon: HelpCircle },
  { href: "/mentorship", label: "MENTORSHIP", icon: GraduationCap },
  { href: "/instellingen", label: "INSTELLINGEN", icon: Settings },
];

interface AppTopBarProps {
  user: {
    naam: string;
    avatarUrl?: string | null | undefined;
  } | null;
  unreadNotifications?: number;
}

export function AppTopBar({ user, unreadNotifications = 0 }: AppTopBarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white hairline-b flex justify-between items-center px-6 h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-on-surface p-3 -ml-3"
            aria-label="Menu openen"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="text-xl font-black tracking-tighter text-on-surface">
            SAMENMAKERS
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/notificaties" className="relative p-3 -mr-1 text-outline hover:text-on-surface transition-colors">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </Link>
          {user && (
            <Link href="/profiel" className="group">
              <Avatar src={user.avatarUrl} naam={user.naam} size="sm" grayscale={false} />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 h-20 hairline-b shrink-0">
          <span className="text-xl font-black tracking-tighter text-on-surface">SAMENMAKERS</span>
          <button onClick={() => setOpen(false)} className="p-2 text-outline hover:text-on-surface" aria-label="Menu sluiten">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col flex-1 overflow-y-auto py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-4 py-4 px-8 transition-all duration-150",
                  isActive
                    ? "bg-surface-container-low text-primary border-l-2 border-primary"
                    : "text-outline hover:bg-surface-container-low hover:text-on-surface",
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-label-caps">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
