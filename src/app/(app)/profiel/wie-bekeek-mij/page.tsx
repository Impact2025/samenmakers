import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Wie bekeek mijn profiel" };

export default async function WieBekeekMijPage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  if (!me) redirect("/dashboard");

  const isPro = me.subscriptionStatus === "active";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-label-caps text-outline mb-1">PROFIEL</p>
        <h1 className="text-headline-md text-on-surface">Wie bekeek mijn profiel</h1>
      </div>

      {!isPro ? (
        <Card className="border-primary/20 bg-surface-container-low">
          <CardBody className="p-8 text-center">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock size={20} className="text-primary" />
            </div>
            <h2 className="text-headline-xs text-on-surface mb-2">Pro-functie</h2>
            <p className="text-body text-on-surface-variant mb-6">
              Upgrade naar Pro om te zien wie jouw profiel de afgelopen 30 dagen heeft bezocht.
            </p>
            <Link href="/instellingen/abonnement">
              <Button variant="primary">Upgrade naar Pro</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <ProfileViewsList />
      )}
    </div>
  );
}

async function ProfileViewsList() {
  const views = await api.connections.myProfileViews();

  if (views.length === 0) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <Eye size={32} className="text-outline mx-auto mb-3" />
          <p className="text-body text-on-surface-variant">
            Nog niemand heeft je profiel bekeken. Vul je profiel verder aan voor meer zichtbaarheid.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-body-sm text-outline">{views.length} bezoek{views.length !== 1 ? "en" : ""} in de afgelopen periode</p>
      {views.map((view) => {
        const viewer = view.viewer;
        const naam = viewer?.naam ?? viewer?.name ?? "Onbekend";
        const timeAgo = formatRelative(view.createdAt);
        return (
          <Card key={view.id}>
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={viewer?.avatarUrl}
                  naam={naam}
                  size="md"
                  grayscale={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/makers/${viewer?.id}`}
                      className="font-bold text-on-surface hover:text-primary transition-colors"
                    >
                      {naam}
                    </Link>
                    {viewer?.subscriptionStatus === "active" && (
                      <Badge variant="primary" size="sm">PRO</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewer?.sector && (
                      <span className="text-body-sm text-outline">{viewer.sector}</span>
                    )}
                    {viewer?.regio && (
                      <span className="text-body-sm text-outline">· {viewer.regio}</span>
                    )}
                  </div>
                </div>
                <span className="text-body-sm text-outline shrink-0">{timeAgo}</span>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function formatRelative(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Zojuist";
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "Gisteren";
  if (days < 7) return `${days} dagen geleden`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
