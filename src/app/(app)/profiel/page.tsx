import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  Globe,
  ExternalLink,
  Gift,
  MapPin,
  Pencil,
  Settings,
  Share2,
} from "lucide-react";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/learning/progress-bar";
import { TeachingBadges } from "@/components/learning/teaching-badges";
import { CopyReferralButton } from "./copy-referral-button";

export const metadata: Metadata = { title: "Mijn profiel" };

export default async function MyProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/inloggen");

  const me = await api.users.me();
  if (!me) redirect("/dashboard");

  const completeness = me.profileCompleteness ?? 0;
  const naam = me.naam ?? me.name ?? "Maker";
  const section =
    "flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-card";
  const eyebrow = "text-label-sm uppercase text-secondary";

  return (
    <div className="flex flex-col gap-5">
      {completeness < 100 && (
        <Link
          href="/profiel/bewerken"
          className="bg-surface-container-low shadow-card hover:shadow-elevated flex flex-col gap-2 rounded-2xl p-4 transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-title-md text-on-surface">
              Profiel {completeness}% compleet
            </span>
            <span className="text-label-md text-primary">Afronden →</span>
          </div>
          <ProgressBar percent={completeness} label="Profiel compleetheid" />
          <p className="text-body-sm text-secondary">
            Vul je profiel aan voor betere zichtbaarheid en meer matches.
          </p>
        </Link>
      )}

      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Avatar src={me.avatarUrl} naam={naam} size="lg" />
          <div className="flex items-center gap-1.5">
            <h1 className="text-headline-md text-on-surface">{naam}</h1>
            {me.isVerified && (
              <BadgeCheck
                size={20}
                className="text-primary-container"
                aria-label="Geverifieerd"
              />
            )}
          </div>
          {(me.sector || me.regio) && (
            <p className="text-label-lg text-secondary flex items-center gap-1">
              {me.sector}
              {me.sector && me.regio && " · "}
              {me.regio && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={14} /> {me.regio}
                </span>
              )}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-1.5">
            {me.subscriptionStatus === "active" && (
              <span className="bg-primary-fixed text-label-sm text-on-primary-fixed-variant rounded-full px-3 py-1 uppercase">
                Pro-lid
              </span>
            )}
            {me.fase && (
              <span className="bg-tertiary-fixed text-label-sm text-on-tertiary-fixed-variant rounded-full px-3 py-1 uppercase">
                {me.fase.charAt(0).toUpperCase() + me.fase.slice(1)}
              </span>
            )}
          </div>
          <TeachingBadges userId={me.id} />
          {me.missie && (
            <p className="text-body-md text-on-surface-variant mt-1 max-w-md">
              &ldquo;{me.missie}&rdquo;
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profiel/bewerken"
            className={buttonClasses("primary", "lg", "flex-1")}
          >
            <Pencil size={18} /> Profiel bewerken
          </Link>
          <Link
            href={`/makers/${me.id}`}
            aria-label="Bekijk je openbare profiel"
            className={buttonClasses("tonal", "icon", "h-12 w-12")}
          >
            <Share2 size={20} />
          </Link>
        </div>
      </section>

      {(me.bio || me.ikZoek || me.website || me.linkedin) && (
        <section className={section}>
          <h2 className="text-headline-sm text-on-surface">Over mij</h2>
          {me.bio && (
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">
              {me.bio}
            </p>
          )}
          {me.ikZoek && (
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className={eyebrow}>Ik zoek</p>
              <p className="text-body-md text-on-surface-variant mt-1">
                {me.ikZoek}
              </p>
            </div>
          )}
          {(me.website || me.linkedin) && (
            <div className="flex flex-wrap gap-2">
              {me.website && (
                <a
                  href={me.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "sm")}
                >
                  <Globe size={16} /> Website
                </a>
              )}
              {me.linkedin && (
                <a
                  href={me.linkedin}
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

      {me.expertise && me.expertise.length > 0 && (
        <section className={section}>
          <h2 className="text-headline-sm text-on-surface">Expertise</h2>
          <div className="flex flex-wrap gap-1.5">
            {me.expertise.map((tag) => (
              <span
                key={tag}
                className="bg-surface-container text-label-md text-on-surface rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/profiel/wie-bekeek-mij"
        className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-center gap-3 rounded-2xl p-4 transition-shadow"
      >
        <span className="bg-primary-container/10 text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Eye size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-title-md text-on-surface">
            Wie bekeek mijn profiel
          </p>
          {me.subscriptionStatus !== "active" && (
            <p className="text-body-sm text-secondary">Pro-functie</p>
          )}
        </div>
        <span className="text-label-md text-primary-container">Bekijken</span>
      </Link>

      {me.referralCode && (
        <section className={section}>
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-primary-container" />
            <h2 className="text-title-md text-on-surface">
              Nodig een maker uit
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <code className="bg-surface-container-low text-title-md text-on-surface flex-1 rounded-xl px-4 py-2.5 font-mono">
              {me.referralCode}
            </code>
            <CopyReferralButton code={me.referralCode} />
          </div>
        </section>
      )}

      <Link
        href="/instellingen"
        className={buttonClasses("secondary", "lg", "w-full")}
      >
        <Settings size={18} /> Instellingen
      </Link>
    </div>
  );
}
