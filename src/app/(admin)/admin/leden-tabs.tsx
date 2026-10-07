import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/gebruikers", label: "Accounts", key: "accounts" },
  { href: "/admin/crm", label: "Contact & notities", key: "crm" },
] as const;

/** Wisselaar tussen de twee kanten van "Leden": accountbeheer en relatiebeheer. */
export function LedenTabs({ actief }: { actief: "accounts" | "crm" }) {
  return (
    <nav className="bg-surface-container-low inline-flex gap-1 rounded-full p-1">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.key === actief ? "page" : undefined}
          className={cn(
            "text-label-lg rounded-full px-4 py-1.5 transition-colors",
            t.key === actief
              ? "bg-primary-container text-on-primary shadow-sm"
              : "text-secondary hover:text-on-surface",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
