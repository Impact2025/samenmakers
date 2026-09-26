import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  return <AppShell>{children}</AppShell>;
}
