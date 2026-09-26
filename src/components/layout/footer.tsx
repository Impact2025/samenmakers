import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const navigation = [
  { href: "/over", label: "Over ons" },
  { href: "/events", label: "Evenementen" },
  { href: "/faq", label: "Veelgestelde vragen" },
  { href: "/privacy", label: "Privacy" },
  { href: "/voorwaarden", label: "Voorwaarden" },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-low mt-16 px-5 pt-12 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo wordmark="always" />
          <p className="text-body-md text-secondary">
            Voor sociale vernieuwers met daadkracht.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          {navigation.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-label-lg text-secondary hover:text-primary-container transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="text-body-sm text-secondary mx-auto mt-10 max-w-6xl">
        © {new Date().getFullYear()} We Shape the Future
      </p>
    </footer>
  );
}
