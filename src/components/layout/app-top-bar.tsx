"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  Search,
  MessageCircle,
  X,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import {
  primaryNav,
  secondaryNav,
  accountNav,
  isActive,
  pageTitle,
  type NavItem,
} from "./nav-items";

interface AppTopBarProps {
  user: {
    naam: string;
    avatarUrl?: string | null | undefined;
    isAdmin?: boolean;
  } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
}

const iconBtn =
  "relative w-11 h-11 flex items-center justify-center rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors";

export function AppTopBar({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
}: AppTopBarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitle(pathname);

  // Menu sluiten bij navigatie
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="pt-safe bg-surface-container-lowest/90 shadow-bar fixed inset-x-0 top-0 z-50 backdrop-blur-xl">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-6">
          <Link
            href="/dashboard"
            aria-label="We Shape the Future — home"
            className="justify-self-start"
          >
            <Logo />
          </Link>

          <h1 className="text-title-md text-on-surface max-w-[140px] truncate text-center lg:hidden">
            {title}
          </h1>
          <span className="hidden lg:block" />

          <div className="flex items-center gap-1 justify-self-end">
            <Link href="/ontdekken" aria-label="Zoeken" className={iconBtn}>
              <Search size={22} />
            </Link>
            <Link
              href="/berichten"
              aria-label="Berichten"
              className={cn(iconBtn, "hidden sm:flex")}
            >
              <MessageCircle size={22} />
              {unreadMessages > 0 && (
                <span className="bg-primary-container text-on-primary absolute top-1.5 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/notificaties"
              aria-label="Meldingen"
              className={iconBtn}
            >
              <Bell size={22} />
              {unreadNotifications > 0 && (
                <span className="bg-primary-container ring-surface-container-lowest absolute top-2.5 right-2.5 h-2 w-2 rounded-full ring-2" />
              )}
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Menu openen"
                aria-expanded={open}
                className="ml-1 rounded-full focus-visible:outline-2"
              >
                <Avatar src={user.avatarUrl} naam={user.naam} size="xs" ring />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Menupaneel */}
      <div
        className={cn(
          "bg-on-surface/40 fixed inset-0 z-[60] transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "bg-surface shadow-floating fixed top-0 right-0 z-[60] flex h-full w-[85vw] max-w-sm flex-col rounded-l-3xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="pt-safe">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="text-title-md text-on-surface">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className={iconBtn}
              aria-label="Menu sluiten"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
          {user && (
            <Link
              href="/profiel"
              className="bg-surface-container-lowest shadow-card flex items-center gap-3 rounded-2xl p-4"
            >
              <Avatar src={user.avatarUrl} naam={user.naam} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-title-md text-on-surface truncate">
                  {user.naam}
                </p>
                <p className="text-body-sm text-secondary">Bekijk je profiel</p>
              </div>
              <ChevronRight size={18} className="text-secondary" />
            </Link>
          )}

          <MenuGroup
            items={[...primaryNav, ...secondaryNav]}
            pathname={pathname}
          />
          <MenuGroup items={accountNav} pathname={pathname} />

          {user?.isAdmin && (
            <Link
              href="/admin"
              className="bg-inverse-surface text-inverse-on-surface text-label-lg flex h-12 items-center gap-3 rounded-2xl px-4"
            >
              <ShieldCheck size={20} />
              Beheeromgeving
            </Link>
          )}

          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="bg-surface-container-lowest text-error shadow-card text-label-lg hover:bg-error-container hover:text-on-error-container flex h-12 items-center justify-center gap-2 rounded-full transition-colors"
          >
            <LogOut size={18} />
            Uitloggen
          </button>
        </div>
      </aside>
    </>
  );
}

function MenuGroup({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <nav className="bg-surface-container-lowest shadow-card flex flex-col rounded-2xl p-1.5">
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-label-lg flex h-11 items-center gap-3 rounded-xl px-3 transition-colors",
              active
                ? "bg-primary-fixed/60 text-primary-container"
                : "text-on-surface hover:bg-surface-container-low",
            )}
          >
            <Icon size={20} className={active ? "" : "text-secondary"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
