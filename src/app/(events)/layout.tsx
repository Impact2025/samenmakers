import Link from "next/link";
import { auth } from "@/server/auth/config";
import { AppShell } from "@/components/layout/app-shell";

// Eventpagina's zijn publiek (SEO, deelbaar). Leden zien ze in de app-omgeving,
// bezoekers in een lichte publieke schil met een uitnodiging om lid te worden.
export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) return <AppShell>{children}</AppShell>;

  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <header className="hairline-b bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-on-surface text-xl font-black tracking-tighter"
          >
            SAMENMAKERS
          </Link>
          <nav className="text-label-caps flex items-center gap-4">
            <Link
              href="/events"
              className="text-on-surface-variant hover:text-on-surface"
            >
              Events
            </Link>
            <Link
              href="/inloggen"
              className="text-on-surface-variant hover:text-on-surface"
            >
              Inloggen
            </Link>
            <Link
              href="/aanmelden"
              className="bg-primary-container text-on-primary hidden px-4 py-2 sm:inline-block"
            >
              Word lid
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">{children}</div>
      </main>
      <footer className="hairline-t text-body-sm text-outline px-4 py-6 text-center">
        Samenmakers — het netwerk voor impact-ondernemers ·{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
