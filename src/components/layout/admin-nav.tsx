"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Settings,
  ClipboardList,
  Sparkles,
  Ticket,
  Mail,
  Library,
  Menu,
  X,
  ArrowLeft,
  Euro,
  Activity,
} from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  {
    href: "/admin/gebruikers",
    label: "Leden",
    icon: Users,
    also: ["/admin/crm"],
  },
  { href: "/admin/mail", label: "Mailings", icon: Mail },
  { href: "/admin/blog", label: "Blog (AI)", icon: Sparkles },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/prijzen", label: "Prijzen", icon: Euro },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/programmas", label: "Onderwijs", icon: Library },
  { href: "/admin/cohorten", label: "Cohorten", icon: Settings },
  { href: "/admin/gdpr", label: "GDPR", icon: Shield },
  { href: "/admin/systeem", label: "Systeem", icon: Activity },
  { href: "/admin/audit-log", label: "Audit log", icon: ClipboardList },
];

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {adminNav.map(({ href, label, icon: Icon, also }) => {
        const matches = (h: string) =>
          pathname === h || pathname.startsWith(h + "/");
        const active =
          href === "/admin"
            ? pathname === href
            : matches(href) || (also ?? []).some(matches);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-label-lg flex h-10 items-center gap-3 rounded-full px-4 transition-colors",
              active
                ? "bg-primary-fixed/60 text-primary-container"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface",
            )}
          >
            <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={32} />
      <div className="leading-tight">
        <p className="text-label-sm text-secondary uppercase">
          We Shape the Future
        </p>
        <p className="text-title-md text-on-surface">Beheer</p>
      </div>
    </div>
  );
}

const backLink = (
  <Link
    href="/dashboard"
    className="text-label-md text-secondary hover:bg-surface-container-low hover:text-on-surface flex h-10 items-center gap-2 rounded-full px-4"
  >
    <ArrowLeft size={16} /> Terug naar platform
  </Link>
);

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Desktop */}
      <aside className="bg-surface-container-lowest shadow-card sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 px-3 py-6 lg:flex">
        <div className="px-3">
          <Brand />
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        {backLink}
      </aside>

      {/* Mobiel */}
      <header className="pt-safe bg-surface-container-lowest/90 shadow-bar fixed inset-x-0 top-0 z-50 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Brand />
          <button
            onClick={() => setOpen(true)}
            aria-label="Menu openen"
            className="text-secondary hover:bg-surface-container-low flex h-11 w-11 items-center justify-center rounded-full"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      <div
        className={cn(
          "bg-on-surface/40 fixed inset-0 z-[60] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "bg-surface-container-lowest shadow-floating fixed top-0 left-0 z-[60] flex h-full w-72 flex-col gap-4 rounded-r-3xl px-3 py-5 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-3">
          <Brand />
          <button
            onClick={() => setOpen(false)}
            aria-label="Menu sluiten"
            className="text-secondary hover:bg-surface-container-low flex h-10 w-10 items-center justify-center rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        {backLink}
      </aside>
    </>
  );
}
