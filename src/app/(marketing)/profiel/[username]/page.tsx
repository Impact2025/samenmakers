import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await api.users.byNaam({ naam: decodeURIComponent(username) }).catch(() => null);
  if (!user) return { title: "Profiel niet gevonden" };
  return {
    title: `${user.naam ?? user.name} — Samenmakers`,
    description: user.missie ?? user.bio ?? undefined,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await api.users.byNaam({ naam: decodeURIComponent(username) }).catch(() => null);

  if (!user || user.profileVisibility === "members") notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5 hairline-b">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">
          SAMENMAKERS
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Profile header */}
        <div className="flex items-start gap-6 mb-10">
          <Avatar src={user.avatarUrl} naam={user.naam ?? user.name ?? "M"} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-md text-on-surface mb-1">
              {user.naam ?? user.name}
            </h1>
            {user.sector && (
              <p className="text-body-sm text-outline mb-2">{user.sector}</p>
            )}
            {user.regio && (
              <Badge variant="default">{user.regio}</Badge>
            )}
          </div>
        </div>

        {user.missie && (
          <div className="mb-8">
            <p className="text-label-caps text-outline mb-2">MISSIE</p>
            <p className="text-body text-on-surface">{user.missie}</p>
          </div>
        )}

        {user.bio && (
          <div className="mb-8">
            <p className="text-label-caps text-outline mb-2">OVER</p>
            <p className="text-body text-on-surface-variant">{user.bio}</p>
          </div>
        )}

        {user.ikZoek && (
          <div className="mb-8 border border-hairline p-5 bg-surface-container-low">
            <p className="text-label-caps text-outline mb-2">IK ZOEK</p>
            <p className="text-body text-on-surface">{user.ikZoek}</p>
          </div>
        )}

        {user.expertise && user.expertise.length > 0 && (
          <div className="mb-8">
            <p className="text-label-caps text-outline mb-3">EXPERTISE</p>
            <div className="flex flex-wrap gap-2">
              {user.expertise.map((tag) => (
                <span key={tag} className="px-3 py-1 border border-hairline text-sm text-on-surface-variant">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="hairline-t pt-8">
          <Link
            href="/aanmelden"
            className="inline-block px-8 py-3 bg-primary text-on-primary font-bold text-label-caps hover:bg-primary/90 transition-colors"
          >
            Verbind op Samenmakers
          </Link>
          <p className="text-body-sm text-outline mt-3">
            Maak een gratis account aan om contact op te nemen.
          </p>
        </div>
      </main>
    </div>
  );
}
