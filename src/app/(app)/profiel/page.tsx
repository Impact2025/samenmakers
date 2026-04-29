import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Pencil, Globe, ExternalLink, CheckCircle, Eye } from "lucide-react";
import { CopyReferralButton } from "./copy-referral-button";

export const metadata: Metadata = { title: "Mijn profiel" };

export default async function MyProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  if (!me) redirect("/dashboard");

  const completeness = me.profileCompleteness ?? 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-caps text-outline mb-1">JOUW PROFIEL</p>
          <h1 className="text-headline-md text-on-surface truncate">{me.naam ?? me.name}</h1>
        </div>
        <Link href="/profiel/bewerken" className="shrink-0 mt-1">
          <Button size="sm" variant="secondary">
            <Pencil size={13} className="mr-1.5" />
            Bewerken
          </Button>
        </Link>
      </div>

      {/* Profile card */}
      <Card>
        <CardBody>
          <div className="flex gap-6">
            <Avatar
              src={me.avatarUrl}
              naam={me.naam ?? me.name ?? "?"}
              size="xl"
              grayscale={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-on-surface">
                  {me.naam ?? me.name}
                </h2>
                {me.isVerified && (
                  <CheckCircle size={16} className="text-primary shrink-0" />
                )}
                {me.subscriptionStatus === "active" && (
                  <Badge variant="primary" size="sm">PRO</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {me.sector && <Badge variant="default" size="sm">{me.sector}</Badge>}
                {me.regio && <Badge variant="default" size="sm">{me.regio}</Badge>}
                {me.fase && (
                  <Badge variant="default" size="sm">
                    {me.fase.charAt(0).toUpperCase() + me.fase.slice(1)}
                  </Badge>
                )}
              </div>
              {me.missie && (
                <p className="text-body-sm text-on-surface mt-3 italic">
                  &ldquo;{me.missie}&rdquo;
                </p>
              )}
            </div>
          </div>

          {me.bio && (
            <div className="mt-6 pt-6 hairline-t">
              <p className="text-label-caps text-outline mb-2">BIO</p>
              <p className="text-body text-on-surface-variant">{me.bio}</p>
            </div>
          )}

          {me.ikZoek && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">IK ZOEK</p>
              <p className="text-body text-on-surface-variant">{me.ikZoek}</p>
            </div>
          )}

          {me.expertise && me.expertise.length > 0 && (
            <div className="mt-4">
              <p className="text-label-caps text-outline mb-2">EXPERTISE</p>
              <div className="flex flex-wrap gap-2">
                {me.expertise.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {(me.website || me.linkedin) && (
            <div className="mt-4 flex gap-4">
              {me.website && (
                <a
                  href={me.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-label-caps text-outline hover:text-primary transition-colors"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
              {me.linkedin && (
                <a
                  href={me.linkedin}
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

      {/* Completeness */}
      {completeness < 100 && (
        <Card className="border-primary/20 bg-surface-container-low">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-label-caps text-on-surface">PROFIEL COMPLEETHEID</p>
              <span className="text-lg font-black text-primary">{completeness}%</span>
            </div>
            <div className="w-full bg-hairline h-1.5 mb-3">
              <div
                className="h-1.5 bg-primary transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-body-sm text-outline">
              Vul je profiel verder aan voor betere zichtbaarheid en meer matches.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Who viewed */}
      <Card>
        <CardBody className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-outline" />
              <div>
                <p className="text-label-caps text-on-surface">WIE BEKEEK MIJN PROFIEL</p>
                {me.subscriptionStatus !== "active" && (
                  <p className="text-body-sm text-outline mt-0.5">Pro-functie</p>
                )}
              </div>
            </div>
            <Link href="/profiel/wie-bekeek-mij">
              <Button variant="secondary" size="sm">Bekijken</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Referral */}
      {me.referralCode && (
        <Card>
          <CardBody className="p-5">
            <p className="text-label-caps text-outline mb-2">JOUW REFERRAL CODE</p>
            <div className="flex items-center gap-3">
              <code className="font-mono text-lg font-black text-on-surface bg-surface-container px-4 py-2 flex-1">
                {me.referralCode}
              </code>
              <CopyReferralButton code={me.referralCode} />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
