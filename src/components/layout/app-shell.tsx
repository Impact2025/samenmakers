import { Sidebar } from "@/components/layout/sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { api } from "@/trpc/server";

/** App-chrome voor ingelogde leden. Gedeeld door (app) en de hybride (events)-groep. */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const [me, unreadMessages, unreadNotifications] = await Promise.all([
    api.users.me(),
    api.messages.unreadCount(),
    api.notifications.unreadCount(),
  ]);

  const topBarUser = me
    ? {
        naam: me.naam ?? me.name ?? "Maker",
        avatarUrl: me.avatarUrl,
        isAdmin: me.role === "admin",
      }
    : null;

  return (
    <div className="bg-surface min-h-screen">
      <AppTopBar
        user={topBarUser}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />
      <Sidebar unreadMessages={unreadMessages} />
      <main className="pb-bottom-nav min-h-screen pt-16 lg:pb-12 lg:pl-64">
        <div className="mx-auto max-w-3xl px-5 pt-5 lg:px-8 lg:pt-8 xl:max-w-4xl">
          {children}
        </div>
      </main>
      <BottomNav unreadCount={unreadMessages} />
    </div>
  );
}
