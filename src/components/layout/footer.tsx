import Link from "next/link";
import { Hairline } from "@/components/ui/hairline";

const navigation = [
  { href: "/privacy", label: "Privacy" },
  { href: "/voorwaarden", label: "Voorwaarden" },
  { href: "/over", label: "Over ons" },
];

export function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 px-6">
      <Hairline className="mb-10" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-black tracking-tighter text-on-surface">
            SAMENMAKERS
          </span>
          <p className="text-label-caps text-outline">
            © {new Date().getFullYear()} SAMENMAKERS. REDUCTIVE FUNCTIONALISM.
          </p>
        </div>
        <nav className="flex gap-8">
          {navigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-label-caps text-outline hover:text-on-surface transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
