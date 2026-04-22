import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MENTORSHIP_ROLES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mentorship",
  description: "Vind een mentor of word zelf mentor voor andere impact-ondernemers.",
};

const ROLE_LABELS: Record<string, string> = {
  mentor: "Mentor",
  mentee: "Mentee",
  both: "Mentor & Mentee",
};

export default async function MentorshipPage() {
  const mentors = await api.users.list({ mentorshipRole: "mentor", limit: 12 }).catch(() => ({
    items: [],
    nextCursor: undefined,
  }));

  const mentees = await api.users.list({ mentorshipRole: "mentee", limit: 12 }).catch(() => ({
    items: [],
    nextCursor: undefined,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <p className="text-label-caps text-outline mb-1">MENTORSHIP</p>
        <h1 className="text-headline-md text-on-surface mb-3">Leer van elkaar</h1>
        <p className="text-body text-on-surface-variant max-w-lg">
          Ervaren impact-ondernemers die hun kennis delen. Of jij nu een mentor zoekt of zelf
          kennis wil doorgeven — verbind je hier.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="border border-hairline p-6 bg-surface-container-low">
          <h2 className="text-lg font-black text-on-surface mb-2">Als mentor</h2>
          <p className="text-body-sm text-on-surface-variant mb-4">
            Deel je expertise, help starters met jouw ervaringen en bouw aan een sterker
            impact-ecosysteem.
          </p>
          <Link
            href="/profiel/bewerken"
            className="text-label-caps text-primary hover:underline"
          >
            Mentor worden →
          </Link>
        </div>
        <div className="border border-hairline p-6 bg-surface-container-low">
          <h2 className="text-lg font-black text-on-surface mb-2">Als mentee</h2>
          <p className="text-body-sm text-on-surface-variant mb-4">
            Leer van ondernemers die al verder zijn. Stel vragen, krijg feedback en groei
            sneller.
          </p>
          <Link
            href="/profiel/bewerken"
            className="text-label-caps text-primary hover:underline"
          >
            Mentee worden →
          </Link>
        </div>
      </div>

      {/* Mentor directory */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-sm text-on-surface">Beschikbare mentors</h2>
          <Badge variant="default">{mentors.items.length}</Badge>
        </div>
        {mentors.items.length === 0 ? (
          <p className="text-body-sm text-outline">Nog geen mentors beschikbaar.</p>
        ) : (
          <div className="space-y-3">
            {mentors.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="flex items-center gap-4 p-4 border border-hairline hover:border-on-surface transition-colors bg-white"
              >
                <Avatar src={user.avatarUrl} naam={user.naam ?? user.name ?? "M"} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface truncate">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-body-sm text-outline">{user.sector}</p>
                  )}
                  {user.missie && (
                    <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                      {user.missie}
                    </p>
                  )}
                </div>
                {user.mentorshipRole && user.mentorshipRole !== "none" && (
                  <span className="text-xs font-medium text-primary border border-primary px-2 py-0.5 shrink-0">
                    {ROLE_LABELS[user.mentorshipRole] ?? user.mentorshipRole}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Mentees looking for mentors */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-sm text-on-surface">Zoeken naar een mentor</h2>
          <Badge variant="default">{mentees.items.length}</Badge>
        </div>
        {mentees.items.length === 0 ? (
          <p className="text-body-sm text-outline">Nog niemand op zoek naar een mentor.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {mentees.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="flex items-center gap-3 p-3 border border-hairline hover:border-on-surface transition-colors bg-white"
              >
                <Avatar src={user.avatarUrl} naam={user.naam ?? user.name ?? "M"} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-xs text-outline">{user.sector}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="hairline-t mt-10 pt-8">
        <p className="text-body-sm text-outline">
          Wil jij mentor of mentee worden?{" "}
          <Link href="/profiel/bewerken" className="text-on-surface font-medium hover:underline">
            Stel je mentorship-rol in via je profiel.
          </Link>
        </p>
      </div>
    </div>
  );
}
