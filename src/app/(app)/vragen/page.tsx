import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  MessageCircle,
  MessagesSquare,
  Plus,
} from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { ChipLink, ChipRow } from "@/components/ui/chip";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { formatRelative } from "@/lib/date-utils";

export const metadata: Metadata = { title: "Community feed" };

type Filter = "alles" | "open" | "opgelost";

export default async function VragenPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter: Filter = raw === "open" || raw === "opgelost" ? raw : "alles";
  const { items: all } = await api.questions.list({ limit: 30 });
  const items = all.filter((q) =>
    filter === "open"
      ? !q.isResolved
      : filter === "opgelost"
        ? q.isResolved
        : true,
  );

  return (
    <div className="relative flex flex-col gap-5">
      <section className="flex flex-col gap-1">
        <span className="bg-primary-fixed text-label-sm text-on-primary-fixed inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 uppercase">
          <span className="bg-primary-container h-1.5 w-1.5 animate-pulse rounded-full" />
          Actief netwerk
        </span>
        <h1 className="text-headline-lg text-on-surface mt-1">
          Community feed
        </h1>
        <p className="text-body-md text-secondary">
          Voor en door sociale ondernemers en veranderaars
        </p>
      </section>

      <ChipRow>
        <ChipLink href="/vragen" active={filter === "alles"} tone="primary">
          Alles
        </ChipLink>
        <ChipLink
          href="/vragen?filter=open"
          active={filter === "open"}
          tone="primary"
        >
          Open vragen
        </ChipLink>
        <ChipLink
          href="/vragen?filter=opgelost"
          active={filter === "opgelost"}
          tone="primary"
        >
          Opgelost
        </ChipLink>
        <ChipLink href="/kennis">
          <BookOpen size={14} /> Kennis delen
        </ChipLink>
      </ChipRow>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-secondary-container text-on-secondary-container flex h-8 w-8 items-center justify-center rounded-full">
            <MessagesSquare size={18} />
          </span>
          <div>
            <h2 className="text-headline-sm text-on-surface leading-tight">
              Discussies &amp; vragen
            </h2>
            <p className="text-body-sm text-secondary">
              Recent gedeeld in de community
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare size={22} />}
            title={
              filter === "alles" ? "Nog geen vragen gesteld" : "Niets gevonden"
            }
            description="Wees de eerste die een vraag stelt aan de community."
            action={
              <Link
                href="/vragen/nieuw"
                className={buttonClasses("primary", "sm")}
              >
                Stel een vraag
              </Link>
            }
          />
        ) : (
          items.map((q) => {
            const naam = q.author.naam ?? q.author.name ?? "?";
            return (
              <Link
                key={q.id}
                href={`/vragen/${q.id}`}
                className="bg-surface-container-low shadow-card hover:bg-surface-container flex flex-col gap-2 rounded-2xl p-5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={q.author.avatarUrl}
                    naam={naam}
                    size="xs"
                    className="!h-10 !w-10"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-title-md text-on-surface">
                        {naam}
                      </span>
                      {q.author.sector && (
                        <span className="bg-secondary-container text-label-sm text-on-secondary-container rounded-full px-2 py-0.5">
                          {q.author.sector}
                        </span>
                      )}
                    </div>
                    <span className="text-body-sm text-secondary">
                      {formatRelative(new Date(q.createdAt))}
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex flex-col gap-1.5">
                  {q.sector && (
                    <span className="bg-primary-fixed text-label-sm text-on-primary-fixed w-fit rounded-full px-2.5 py-0.5 uppercase">
                      {q.sector}
                    </span>
                  )}
                  <h3 className="text-headline-sm text-on-surface">
                    {q.title}
                  </h3>
                  {q.content && (
                    <p className="text-body-md text-on-surface-variant line-clamp-3">
                      {q.content}
                    </p>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span className="text-label-md text-secondary flex items-center gap-1.5">
                    <MessageCircle size={18} />
                    {q.answers.length}{" "}
                    {q.answers.length === 1 ? "reactie" : "reacties"}
                  </span>
                  {q.isResolved && (
                    <span className="bg-tertiary/10 text-label-sm text-tertiary flex items-center gap-1 rounded-full px-2.5 py-1">
                      <CheckCircle2 size={14} /> Opgelost
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </section>

      {/* Zwevende actie boven de onderbalk */}
      <div className="pointer-events-none sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex justify-center lg:bottom-6">
        <Link
          href="/vragen/nieuw"
          className="bg-primary-container text-label-lg text-on-primary shadow-floating pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 transition-all hover:brightness-105 active:scale-95"
        >
          <Plus size={20} /> Deel een vraag of inzicht
        </Link>
      </div>
    </div>
  );
}
