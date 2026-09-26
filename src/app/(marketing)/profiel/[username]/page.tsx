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
  const user = await api.users
    .byNaam({ naam: decodeURIComponent(username) })
    .catch(() => null);
  if (!user) return { title: "Profiel niet gevonden" };
  return {
    title: `${user.naam ?? user.name} — We Shape the Future`,
    description: user.missie ?? user.bio ?? undefined,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await api.users
    .byNaam({ naam: decodeURIComponent(username) })
    .catch(() => null);

  if (!user || user.profileVisibility === "members") notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="hairline-b px-6 py-5">
        <Link
          href="/"
          className="text-on-surface text-xl font-extrabold tracking-tighter"
        >
          We Shape the Future
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {/* Profile header */}
        <div className="mb-10 flex items-start gap-6">
          <Avatar
            src={user.avatarUrl}
            naam={user.naam ?? user.name ?? "M"}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-headline-lg text-on-surface mb-1">
              {user.naam ?? user.name}
            </h1>
            {user.sector && (
              <p className="text-body-md text-secondary mb-2">{user.sector}</p>
            )}
            {user.regio && <Badge variant="default">{user.regio}</Badge>}
          </div>
        </div>

        {user.missie && (
          <div className="mb-8">
            <p className="text-label-md text-secondary mb-2">Missie</p>
            <p className="text-body-md text-on-surface">{user.missie}</p>
          </div>
        )}

        {user.bio && (
          <div className="mb-8">
            <p className="text-label-md text-secondary mb-2">Over</p>
            <p className="text-body-md text-on-surface-variant">{user.bio}</p>
          </div>
        )}

        {user.ikZoek && (
          <div className="bg-surface-container-low mb-8 rounded-2xl p-5">
            <p className="text-label-md text-secondary mb-2">Ik zoek</p>
            <p className="text-body-md text-on-surface">{user.ikZoek}</p>
          </div>
        )}

        {user.expertise && user.expertise.length > 0 && (
          <div className="mb-8">
            <p className="text-label-md text-secondary mb-3">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {user.expertise.map((tag) => (
                <span
                  key={tag}
                  className="text-on-surface-variant border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="hairline-t pt-8">
          <Link
            href="/aanmelden"
            className="bg-primary text-on-primary text-label-md hover:bg-primary/90 shadow-cta inline-block inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-bold transition-colors"
          >
            Verbind op We Shape the Future
          </Link>
          <p className="text-body-md text-secondary mt-3">
            Maak een gratis account aan om contact op te nemen.
          </p>
        </div>
      </main>
    </div>
  );
}
