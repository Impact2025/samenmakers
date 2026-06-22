import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import Link from "next/link";
import { LayoutGrid, Users, FileText, Calendar, BarChart3, Shield, Settings, ClipboardList, Sparkles, Ticket, Contact, Mail } from "lucide-react";

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
  { href: "/admin/cohorten", label: "Cohorten", icon: Settings },
  { href: "/admin/gdpr", label: "GDPR", icon: Shield },
  { href: "/admin/audit-log", label: "Audit log", icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Admin sidebar */}
      <aside className="w-64 bg-on-surface text-on-primary flex flex-col shrink-0 min-h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-[10px] font-bold tracking-widest text-white/50 mb-1">SAMENMAKERS</p>
          <p className="text-sm font-black">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 py-4">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <Link href="/dashboard" className="text-xs text-white/50 hover:text-white transition-colors">
            ← Terug naar platform
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
