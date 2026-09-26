import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Vind een mentor of word zelf mentor voor andere impact-ondernemers.",
};

const ROLE_LABELS: Record<string, string> = {
  mentor: "Mentor",
  mentee: "Mentee",
  both: "Mentor & Mentee",
};

export default async function MentorshipPage() {
  const mentors = await api.users
    .list({ mentorshipRole: "mentor", limit: 12 })
    .catch(() => ({
      items: [],
      nextCursor: undefined,
    }));

  const mentees = await api.users
    .list({ mentorshipRole: "mentee", limit: 12 })
    .catch(() => ({
      items: [],
      nextCursor: undefined,
    }));

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <p className="text-label-md text-secondary mb-1">Mentorship</p>
        <h1 className="text-headline-lg text-on-surface mb-3">
          Leer van elkaar
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-lg">
          Ervaren impact-ondernemers die hun kennis delen. Of jij nu een mentor
          zoekt of zelf kennis wil doorgeven — verbind je hier.
        </p>
      </div>

      {/* Info cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="bg-surface-container-low rounded-2xl p-6">
          <h2 className="text-on-surface mb-2 text-lg font-extrabold">
            Als mentor
          </h2>
          <p className="text-body-md text-on-surface-variant mb-4">
            Deel je expertise, help starters met jouw ervaringen en bouw aan een
            sterker impact-ecosysteem.
          </p>
          <Link
            href="/profiel/bewerken"
            className="text-label-md text-primary hover:underline"
          >
            Mentor worden →
          </Link>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-6">
          <h2 className="text-on-surface mb-2 text-lg font-extrabold">
            Als mentee
          </h2>
          <p className="text-body-md text-on-surface-variant mb-4">
            Leer van ondernemers die al verder zijn. Stel vragen, krijg feedback
            en groei sneller.
          </p>
          <Link
            href="/profiel/bewerken"
            className="text-label-md text-primary hover:underline"
          >
            Mentee worden →
          </Link>
        </div>
      </div>

      {/* Mentor directory */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-md text-on-surface">
            Beschikbare mentors
          </h2>
          <Badge variant="default">{mentors.items.length}</Badge>
        </div>
        {mentors.items.length === 0 ? (
          <p className="text-body-md text-secondary">
            Nog geen mentors beschikbaar.
          </p>
        ) : (
          <div className="space-y-3">
            {mentors.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="hover:shadow-elevated bg-surface-container-lowest shadow-card flex items-center gap-4 rounded-2xl p-4 transition-colors"
              >
                <Avatar
                  src={user.avatarUrl}
                  naam={user.naam ?? user.name ?? "M"}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface truncate font-bold">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-body-md text-secondary">{user.sector}</p>
                  )}
                  {user.missie && (
                    <p className="text-body-md text-on-surface-variant mt-0.5 line-clamp-1">
                      {user.missie}
                    </p>
                  )}
                </div>
                {user.mentorshipRole && user.mentorshipRole !== "none" && (
                  <span className="text-primary border-surface-container bg-surface-container-lowest inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors">
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-md text-on-surface">
            Zoeken naar een mentor
          </h2>
          <Badge variant="default">{mentees.items.length}</Badge>
        </div>
        {mentees.items.length === 0 ? (
          <p className="text-body-md text-secondary">
            Nog niemand op zoek naar een mentor.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mentees.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="hover:shadow-elevated bg-surface-container-lowest shadow-card flex items-center gap-3 rounded-2xl p-3 transition-colors"
              >
                <Avatar
                  src={user.avatarUrl}
                  naam={user.naam ?? user.name ?? "M"}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-on-surface truncate text-sm font-bold">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-secondary text-xs">{user.sector}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="hairline-t mt-10 pt-8">
        <p className="text-body-md text-secondary">
          Wil jij mentor of mentee worden?{" "}
          <Link
            href="/profiel/bewerken"
            className="text-on-surface font-medium hover:underline"
          >
            Stel je mentorship-rol in via je profiel.
          </Link>
        </p>
      </div>
    </div>
  );
}
