"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Search,
  MessageSquare,
  Calendar,
  BookOpen,
  HelpCircle,
  Heart,
  GraduationCap,
  Settings,
  Library,
} from "lucide-react";
import { features } from "@/lib/features";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutGrid },
  ...(features.leren
    ? [{ href: "/leren", label: "LEREN", icon: Library }]
    : []),
  { href: "/ontdekken", label: "ONTDEKKEN", icon: Search },
  { href: "/matching", label: "MATCHING", icon: Heart },
  { href: "/berichten", label: "BERICHTEN", icon: MessageSquare },
  { href: "/events", label: "EVENTS", icon: Calendar },
  { href: "/kennis", label: "KENNISBANK", icon: BookOpen },
  { href: "/vragen", label: "Q&A", icon: HelpCircle },
  { href: "/mentorship", label: "MENTORSHIP", icon: GraduationCap },
  { href: "/instellingen", label: "INSTELLINGEN", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hairline-r fixed top-0 left-0 z-40 hidden h-screen w-72 flex-col bg-white pt-20 lg:flex">
      <div className="px-8 py-6">
        <p className="text-label-caps text-outline">MENU</p>
      </div>
      <nav className="flex flex-1 flex-col">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-8 py-4 transition-all duration-150 hover:pl-10",
                isActive
                  ? "bg-surface-container-low text-primary border-primary border-l-2"
                  : "text-outline hover:bg-surface-container-low hover:text-on-surface",
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-label-caps">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
