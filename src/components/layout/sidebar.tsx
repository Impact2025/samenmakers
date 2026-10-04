"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/persona";
import { navFor, isActive, type NavItem } from "./nav-items";

export function Sidebar({
  unreadMessages = 0,
  persona = "lid",
  mentor = false,
}: {
  unreadMessages?: number;
  persona?: Persona;
  mentor?: boolean;
}) {
  const pathname = usePathname();
  const nav = navFor(persona, mentor);

  return (
    <aside className="bg-surface fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col px-3 pt-20 pb-6 lg:flex">
      <nav className="no-scrollbar flex flex-col gap-6 overflow-y-auto">
        <Group
          items={nav.primary}
          pathname={pathname}
          unreadMessages={unreadMessages}
        />
        <Group
          title="Meer"
          items={nav.secondary}
          pathname={pathname}
          unreadMessages={unreadMessages}
        />
        <Group
          title="Account"
          items={nav.account}
          pathname={pathname}
          unreadMessages={unreadMessages}
        />
      </nav>
    </aside>
  );
}

function Group({
  title,
  items,
  pathname,
  unreadMessages,
}: {
  title?: string;
  items: NavItem[];
  pathname: string;
  unreadMessages: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {title && (
        <p className="text-label-sm text-secondary px-4 pb-1 uppercase">
          {title}
        </p>
      )}
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-label-lg flex h-11 items-center gap-3 rounded-full px-4 transition-colors",
              active
                ? "bg-primary-fixed/60 text-primary-container"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface",
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
            <span className="flex-1">{item.label}</span>
            {item.href === "/berichten" && unreadMessages > 0 && (
              <span className="bg-primary-container text-on-primary text-label-sm flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-bold">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
