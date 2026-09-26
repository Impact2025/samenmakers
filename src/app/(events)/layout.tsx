import { auth } from "@/server/auth/config";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";

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
      <TopBar />
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-3xl px-5 pt-5 pb-12 lg:px-8 lg:pt-8 xl:max-w-4xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
