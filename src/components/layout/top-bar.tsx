import Link from "next/link";

export function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white hairline-b flex justify-between items-center px-6 h-20">
      <Link
        href="/"
        className="text-xl font-black tracking-tighter text-on-surface"
      >
        SAMENMAKERS
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/inloggen" className="text-label-caps text-primary-container">
          INLOGGEN
        </Link>
        <Link
          href="/aanmelden"
          className="text-label-caps border border-on-surface text-on-surface px-4 py-2 hover:bg-on-surface hover:text-on-primary transition-colors"
        >
          AANMELDEN
        </Link>
      </div>
    </header>
  );
}
