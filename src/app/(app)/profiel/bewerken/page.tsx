import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { ProfileEditForm } from "./profile-edit-form";

export const metadata: Metadata = { title: "Profiel bewerken" };

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  if (!me) redirect("/dashboard");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-label-md text-secondary mb-1">Instellingen</p>
        <h1 className="text-headline-lg text-on-surface">Profiel bewerken</h1>
      </div>
      <ProfileEditForm user={me} />
    </div>
  );
}
