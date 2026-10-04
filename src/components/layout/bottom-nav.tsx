"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/persona";
import { navFor, isActive } from "./nav-items";

interface BottomNavProps {
  unreadCount?: number;
  persona?: Persona;
}

export function BottomNav({
  unreadCount = 0,
  persona = "lid",
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="pb-safe bg-surface-container-lowest/90 shadow-bar-up fixed inset-x-0 bottom-0 z-50 backdrop-blur-xl lg:hidden"
    >
      <div className="flex h-16 items-center justify-around px-1">
        {navFor(persona).primary.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          const showBadge = item.href === "/berichten" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] min-w-[56px] flex-col items-center justify-center py-1 transition-colors",
                active
                  ? "text-primary-container"
                  : "text-secondary hover:text-on-surface",
              )}
            >
              <span className="relative">
                <Icon size={24} strokeWidth={active ? 2.25 : 1.75} />
                {showBadge && (
                  <span className="bg-primary-container text-on-primary text-label-sm absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-label-sm mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
