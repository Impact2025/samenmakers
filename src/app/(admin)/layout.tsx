import { auth } from "@/server/auth/config";
import { AdminLogin } from "@/components/layout/admin-login";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return <AdminLogin />;
  if (session.user.role !== "admin") {
    return (
      <AdminLogin
        ingelogdAls={session.user.email ?? session.user.name ?? "Dit account"}
      />
    );
  }

  return (
    <div className="bg-surface flex min-h-screen">
      <AdminNav />
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <div className="mx-auto max-w-6xl px-5 py-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
