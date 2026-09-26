import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import {
  BadgeCheck,
  Globe,
  Handshake,
  MapPin,
  Users,
  ExternalLink,
} from "lucide-react";
import { MakerActions } from "./maker-actions";
import { ConnectionNote } from "./connection-note";
import { ExpertiseEndorsements } from "./expertise-endorsements";
import { ZOEKT_NAAR_OPTIONS } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await api.users.byId({ id });
  if (!user) return { title: "Niet gevonden" };
  return {
    title: `${user.naam ?? user.name} — Maker`,
    description: user.missie ?? user.bio ?? undefined,
  };
}

export default async function MakerProfilePage({ params }: Props) {
  const { id } = await params;

  const [user, mutualCount] = await Promise.all([
    api.users.byId({ id }),
    api.users.mutualCount({ targetId: id }).catch(() => 0),
    api.connections.recordView({ profileId: id }).catch(() => undefined),
  ]);

  if (!user) notFound();

  const zoektNaar = (user as { zoektNaar?: string[] }).zoektNaar ?? [];
  const naam = user.naam ?? user.name ?? "?";
  const section =
    "flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-card";
  const label = "text-label-sm uppercase text-secondary";

  return (
    <div className="flex flex-col gap-5">
      {/* Profielkaart */}
      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Avatar src={user.avatarUrl} naam={naam} size="lg" />
          <div className="flex items-center gap-1.5">
            <h1 className="text-headline-md text-on-surface">{naam}</h1>
            {user.isVerified && (
              <BadgeCheck
                size={20}
                className="text-primary-container shrink-0"
                aria-label="Geverifieerd"
              />
            )}
          </div>
          {(user.sector || user.regio) && (
            <p className="text-label-lg text-secondary flex items-center gap-1">
              {user.sector}
              {user.sector && user.regio && " · "}
              {user.regio && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={14} /> {user.regio}
                </span>
              )}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-1.5">
            {user.subscriptionStatus === "active" && (
              <span className="bg-primary-fixed text-label-sm text-on-primary-fixed-variant rounded-full px-3 py-1 uppercase">
                Pro-lid
              </span>
            )}
            {user.fase && (
              <span className="bg-tertiary-fixed text-label-sm text-on-tertiary-fixed-variant rounded-full px-3 py-1 uppercase">
                {user.fase.charAt(0).toUpperCase() + user.fase.slice(1)}
              </span>
            )}
          </div>
          {user.missie && (
            <p className="text-body-md text-on-surface-variant mt-1 max-w-md">
              &ldquo;{user.missie}&rdquo;
            </p>
          )}
          {mutualCount > 0 && (
            <p className="text-body-sm text-secondary flex items-center gap-1.5">
              <Users size={14} />
              {mutualCount} maker{mutualCount === 1 ? "" : "s"} ken
              {mutualCount === 1 ? "t" : "nen"} jullie beiden
            </p>
          )}
        </div>
        <MakerActions userId={user.id} />
      </section>

      {(user.bio || user.website || user.linkedin) && (
        <section className={section}>
          <h2 className="text-headline-sm text-on-surface">
            Over {naam.split(" ")[0]}
          </h2>
          {user.bio && (
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">
              {user.bio}
            </p>
          )}
          {(user.website || user.linkedin) && (
            <div className="flex flex-wrap gap-2">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "sm")}
                >
                  <Globe size={16} /> Website
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "sm")}
                >
                  <ExternalLink size={16} /> LinkedIn
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {(zoektNaar.length > 0 || user.ikZoek) && (
        <section className={section}>
          <h2 className="text-headline-sm text-on-surface">Op zoek naar</h2>
          {zoektNaar.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {zoektNaar.map((z) => (
                <span
                  key={z}
                  className="bg-primary-container/10 text-label-md text-primary-container rounded-full px-3 py-1"
                >
                  {ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ?? z}
                </span>
              ))}
            </div>
          )}
          {user.ikZoek && (
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className={label}>
                {zoektNaar.length > 0 ? "Toelichting" : "Ik zoek"}
              </p>
              <p className="text-body-md text-on-surface-variant mt-1">
                {user.ikZoek}
              </p>
            </div>
          )}
        </section>
      )}

      {user.expertise && user.expertise.length > 0 && (
        <section className={section}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-headline-sm text-on-surface">Expertise</h2>
            <span className="text-body-sm text-secondary">
              Tik om te onderschrijven
            </span>
          </div>
          <ExpertiseEndorsements
            targetUserId={user.id}
            expertise={user.expertise}
          />
        </section>
      )}

      {user.mentorshipRole && user.mentorshipRole !== "none" && (
        <section className="bg-surface-container-low flex items-center gap-3 rounded-2xl p-4">
          <span className="bg-primary-fixed/60 text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Handshake size={20} />
          </span>
          <div>
            <p className={label}>Mentorschap</p>
            <p className="text-title-md text-on-surface">
              {user.mentorshipRole === "mentor"
                ? "Beschikbaar als mentor"
                : user.mentorshipRole === "mentee"
                  ? "Op zoek naar een mentor"
                  : "Mentor én mentee"}
            </p>
          </div>
        </section>
      )}

      <section className={section}>
        <ConnectionNote targetUserId={user.id} />
      </section>
    </div>
  );
}
