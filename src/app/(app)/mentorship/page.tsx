import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Handshake, Sprout } from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Vind een mentor of word zelf mentor voor andere impact-ondernemers.",
};

const ROLE_LABELS: Record<string, string> = {
  mentor: "Mentor",
  mentee: "Mentee",
  both: "Mentor & mentee",
};

export default async function MentorshipPage() {
  const empty = { items: [], nextCursor: undefined };
  const [mentors, mentees] = await Promise.all([
    api.users.list({ mentorshipRole: "mentor", limit: 12 }).catch(() => empty),
    api.users.list({ mentorshipRole: "mentee", limit: 12 }).catch(() => empty),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Mentorship"
        title="Leer van elkaar"
        description="Ervaren impact-ondernemers delen hun kennis. Zoek je een mentor of wil je zelf kennis doorgeven? Verbind je hier."
        className="mb-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            icon: GraduationCap,
            title: "Als mentor",
            text: "Deel je expertise, help starters met jouw ervaringen en bouw aan een sterker impact-ecosysteem.",
            cta: "Mentor worden",
          },
          {
            icon: Sprout,
            title: "Als mentee",
            text: "Leer van ondernemers die al verder zijn. Stel vragen, krijg feedback en groei sneller.",
            cta: "Mentee worden",
          },
        ].map(({ icon: Icon, title, text, cta }) => (
          <div
            key={title}
            className="bg-surface-container-low flex flex-col gap-2 rounded-2xl p-5"
          >
            <span className="bg-primary-container/10 text-primary-container flex h-10 w-10 items-center justify-center rounded-xl">
              <Icon size={20} />
            </span>
            <h2 className="text-headline-sm text-on-surface">{title}</h2>
            <p className="text-body-md text-on-surface-variant">{text}</p>
            <Link
              href="/profiel/bewerken"
              className="text-label-lg text-primary-container mt-1 inline-flex items-center gap-1"
            >
              {cta} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <section>
        <SectionHeader
          title="Beschikbare mentors"
          count={mentors.items.length}
        />
        {mentors.items.length === 0 ? (
          <EmptyState
            icon={<Handshake size={22} />}
            title="Nog geen mentors beschikbaar"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {mentors.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-center gap-3 rounded-2xl p-4 transition-shadow"
              >
                <Avatar
                  src={user.avatarUrl}
                  naam={user.naam ?? user.name ?? "M"}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-title-md text-on-surface truncate">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-body-sm text-primary-container font-medium">
                      {user.sector}
                    </p>
                  )}
                  {user.missie && (
                    <p className="text-body-sm text-secondary line-clamp-1">
                      {user.missie}
                    </p>
                  )}
                </div>
                {user.mentorshipRole && user.mentorshipRole !== "none" && (
                  <span className="bg-tertiary-fixed text-label-sm text-on-tertiary-fixed-variant shrink-0 rounded-full px-2.5 py-1">
                    {ROLE_LABELS[user.mentorshipRole] ?? user.mentorshipRole}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Zoeken naar een mentor"
          count={mentees.items.length}
        />
        {mentees.items.length === 0 ? (
          <EmptyState
            icon={<Sprout size={22} />}
            title="Nog niemand op zoek naar een mentor"
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {mentees.items.map((user) => (
              <Link
                key={user.id}
                href={`/makers/${user.id}`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-center gap-3 rounded-2xl p-3 transition-shadow"
              >
                <Avatar
                  src={user.avatarUrl}
                  naam={user.naam ?? user.name ?? "M"}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-title-md text-on-surface truncate">
                    {user.naam ?? user.name ?? "Maker"}
                  </p>
                  {user.sector && (
                    <p className="text-body-sm text-secondary">{user.sector}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="bg-primary-fixed/40 text-body-md text-on-surface-variant rounded-2xl p-4">
        Wil jij mentor of mentee worden?{" "}
        <Link
          href="/profiel/bewerken"
          className="text-primary-container font-semibold hover:underline"
        >
          Stel je mentorship-rol in via je profiel.
        </Link>
      </div>
    </div>
  );
}
