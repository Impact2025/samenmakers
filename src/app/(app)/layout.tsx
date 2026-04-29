import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { Sidebar } from "@/components/layout/sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { api } from "@/trpc/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const [me, unreadMessages, unreadNotifications] = await Promise.all([
    api.users.me(),
    api.messages.unreadCount(),
    api.notifications.unreadCount(),
  ]);

  const topBarUser = me
    ? { naam: me.naam ?? me.name ?? "Maker", avatarUrl: me.avatarUrl }
    : null;

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar user={topBarUser} unreadNotifications={unreadNotifications} />
      <Sidebar />
      <main className="lg:pl-72 pt-20 pb-bottom-nav lg:pb-0 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav unreadCount={unreadMessages} />
    </div>
  );
}
