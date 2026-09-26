import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="bg-surface flex min-h-screen">
      <AdminNav />
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <div className="mx-auto max-w-6xl px-5 py-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
