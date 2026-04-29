import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Globe, CheckCircle, Users, ExternalLink } from "lucide-react";
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

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardBody>
          {/* Header */}
          <div className="flex gap-4 sm:gap-6">
            <Avatar
              src={user.avatarUrl}
              naam={user.naam ?? user.name ?? "?"}
              size="xl"
              grayscale={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-on-surface">
                  {user.naam ?? user.name}
                </h1>
                {user.isVerified && (
                  <CheckCircle size={16} className="text-primary shrink-0" aria-label="Geverifieerd" />
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:opacity-80 transition-opacity shrink-0 text-xs font-bold tracking-wide flex items-center gap-1"
                    aria-label="LinkedIn profiel"
                  >
                    <ExternalLink size={12} />
                    in
                  </a>
                )}
                {user.subscriptionStatus === "active" && (
                  <Badge variant="primary" size="sm">PRO</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.sector && <Badge variant="default" size="sm">{user.sector}</Badge>}
                {user.regio && <Badge variant="default" size="sm">{user.regio}</Badge>}
                {user.fase && (
                  <Badge variant="default" size="sm">
                    {user.fase.charAt(0).toUpperCase() + user.fase.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Mutual connections */}
              {mutualCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-outline">
                  <Users size={12} />
                  <span>{mutualCount} maker{mutualCount === 1 ? "" : "s"} ken{mutualCount === 1 ? "t" : "nen"} jullie beiden</span>
                </div>
              )}

              {user.missie && (
                <p className="text-body-sm text-on-surface mt-3 italic">
                  &ldquo;{user.missie}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 hairline-t">
            <MakerActions userId={user.id} />
          </div>

          {/* Private note */}
          <div className="mt-6 pt-6 hairline-t">
            <ConnectionNote targetUserId={user.id} />
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 hairline-t">
              <p className="text-label-caps text-outline mb-2">BIO</p>
              <p className="text-body text-on-surface-variant">{user.bio}</p>
            </div>
          )}

          {/* What they're looking for */}
          {zoektNaar.length > 0 && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">OP ZOEK NAAR</p>
              <div className="flex flex-wrap gap-1.5">
                {zoektNaar.map((z) => {
                  const label = ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ?? z;
                  return <Badge key={z} variant="primary" size="sm">{label}</Badge>;
                })}
              </div>
            </div>
          )}

          {user.ikZoek && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">{zoektNaar.length > 0 ? "TOELICHTING" : "IK ZOEK"}</p>
              <p className="text-body text-on-surface-variant">{user.ikZoek}</p>
            </div>
          )}

          {/* Expertise with endorsements */}
          {user.expertise && user.expertise.length > 0 && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">EXPERTISE</p>
              <ExpertiseEndorsements
                targetUserId={user.id}
                expertise={user.expertise}
              />
            </div>
          )}

          {user.mentorshipRole && user.mentorshipRole !== "none" && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">MENTORSCHAP</p>
              <Badge variant="default">
                {user.mentorshipRole === "mentor"
                  ? "Beschikbaar als mentor"
                  : user.mentorshipRole === "mentee"
                    ? "Op zoek naar mentor"
                    : "Mentor & mentee"}
              </Badge>
            </div>
          )}

          {(user.website || user.linkedin) && (
            <div className="mt-4 flex gap-4">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-label-caps text-outline hover:text-primary transition-colors"
                >
                  <Globe size={13} />
                  Website
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-label-caps text-[#0A66C2] hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={13} />
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
