import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, CheckCircle } from "lucide-react";
import { MakerActions } from "./maker-actions";
import { ConnectionNote } from "./connection-note";

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

  const [user] = await Promise.all([
    api.users.byId({ id }),
    api.connections.recordView({ profileId: id }).catch(() => undefined),
  ]);

  if (!user) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile card */}
      <Card>
        <CardBody>
          <div className="flex gap-6">
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
                  <CheckCircle size={16} className="text-primary shrink-0" />
                )}
                {user.subscriptionStatus === "active" && (
                  <Badge variant="primary" size="sm">PRO</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.sector && <Badge variant="default" size="sm">{user.sector}</Badge>}
                {user.regio && <Badge variant="default" size="sm">{user.regio}</Badge>}
                {user.fase && (
                  <Badge variant="default" size="sm">
                    {user.fase.charAt(0).toUpperCase() + user.fase.slice(1)}
                  </Badge>
                )}
              </div>
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

          {user.ikZoek && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">IK ZOEK</p>
              <p className="text-body text-on-surface-variant">{user.ikZoek}</p>
            </div>
          )}

          {user.expertise && user.expertise.length > 0 && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">EXPERTISE</p>
              <div className="flex flex-wrap gap-2">
                {user.expertise.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
              </div>
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
                  className="flex items-center gap-1 text-label-caps text-outline hover:text-primary transition-colors"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-label-caps text-outline hover:text-primary transition-colors"
                >
                  <ExternalLink size={14} />
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
