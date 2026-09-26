import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { buttonClasses } from "@/components/ui/button";

/** Publieke topbalk (marketing, publieke events, auth). */
export function TopBar({ links = true }: { links?: boolean }) {
  return (
    <header className="pt-safe bg-surface-container-lowest/90 shadow-bar fixed inset-x-0 top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="We Shape the Future — home">
          <Logo wordmark="always" />
        </Link>
        {links && (
          <nav className="flex items-center gap-2">
            <Link
              href="/events"
              className="text-label-lg text-secondary hover:text-on-surface hidden px-3 sm:inline-flex"
            >
              Evenementen
            </Link>
            <Link
              href="/inloggen"
              className={buttonClasses("ghost", "sm", "text-on-surface")}
            >
              Inloggen
            </Link>
            <Link
              href="/aanmelden"
              className={buttonClasses(
                "primary",
                "sm",
                "hidden sm:inline-flex",
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
