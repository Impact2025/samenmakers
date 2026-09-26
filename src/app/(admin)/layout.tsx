import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import Link from "next/link";
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
  Contact,
  Mail,
  Library,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/crm", label: "CRM", icon: Contact },
  { href: "/admin/mail", label: "Mailings", icon: Mail },
  { href: "/admin/gebruikers", label: "Gebruikers", icon: Users },
  { href: "/admin/blog", label: "Blog (AI)", icon: Sparkles },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/programmas", label: "Onderwijs", icon: Library },
  { href: "/admin/cohorten", label: "Cohorten", icon: Settings },
  { href: "/admin/gdpr", label: "GDPR", icon: Shield },
  { href: "/admin/audit-log", label: "Audit log", icon: ClipboardList },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="bg-surface flex min-h-screen">
      {/* Admin sidebar */}
      <aside className="bg-on-surface text-on-primary flex min-h-screen w-64 shrink-0 flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-white/50">
            SAMENMAKERS
          </p>
          <p className="text-sm font-black">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 py-4">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <Link
            href="/dashboard"
            className="text-xs text-white/50 transition-colors hover:text-white"
          >
            ← Terug naar platform
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}
