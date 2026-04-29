"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Search, MessageSquare, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutGrid },
  { href: "/ontdekken", label: "ONTDEKKEN", icon: Search },
  { href: "/berichten", label: "BERICHTEN", icon: MessageSquare },
  { href: "/profiel", label: "PROFIEL", icon: User },
];

interface BottomNavProps {
  unreadCount?: number;
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white hairline-t z-50 flex justify-around items-stretch h-bottom-nav">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || pathname.startsWith(href + "/");
        const showBadge = href === "/berichten" && unreadCount > 0;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-start flex-1 gap-1 pt-2 transition-colors relative",
              isActive
                ? "text-primary border-t-2 border-primary"
                : "text-outline",
            )}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
