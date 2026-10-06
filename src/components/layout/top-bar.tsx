import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { buttonClasses } from "@/components/ui/button";

/** Publieke topbalk (marketing, publieke events, auth). */
export function TopBar({ links = true }: { links?: boolean }) {
  return (
    <header className="pt-safe bg-primary-container shadow-bar fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="We Shape the Future — home">
          <Logo wordmark="always" size={40} tone="light" />
        </Link>
        {links && (
          <nav className="flex items-center gap-2">
            <Link
              href="/events"
              className="text-label-lg text-on-primary/90 hover:text-on-primary hidden px-3 sm:inline-flex"
            >
              Evenementen
            </Link>
            <Link
              href="/inloggen"
              className={buttonClasses(
                "ghost",
                "sm",
                "text-on-primary hover:text-on-primary hover:bg-white/15",
              )}
            >
              Inloggen
            </Link>
            <Link
              href="/aanmelden"
              className={buttonClasses(
                "secondary",
                "sm",
                "text-primary-container shadow-cta hidden border-0 sm:inline-flex",
              )}
            >
              Word lid
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
