import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

interface Props {
  params: Promise<{ username: string }>;
}

// /ontdekken/[username] — redirect to the full maker profile
export default async function OntdekkenUsernamePage({ params }: Props) {
  const { username } = await params;
  const user = await api.users.byNaam({ naam: decodeURIComponent(username) }).catch(() => null);

  if (user) {
    redirect(`/makers/${user.id}`);
  }

  redirect("/ontdekken");
}
