"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, X, MessageCircle, Info, Sparkles, MapPin } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Spinner } from "@/components/ui/spinner";
import { ZOEKT_NAAR_OPTIONS } from "@/lib/constants";

type MatchResult = {
  naam: string;
  avatarUrl: string | null | undefined;
  reasons: string[];
};

export function MatchingClient() {
  const utils = trpc.useUtils();

  const { data: deck, isLoading } = trpc.matches.swipeDeck.useQuery({
    limit: 10,
  });
  const { data: myMatches } = trpc.matches.myMatches.useQuery();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const swipe = trpc.matches.swipe.useMutation({
    onSuccess: (data) => {
      setRateLimitError(null);
      if (data.matched && data.target) {
        setMatchResult({
          naam: data.target.naam ?? "een maker",
          avatarUrl: data.target.avatarUrl,
          reasons: data.reasons ?? [],
        });
      }
      setCurrentIndex((i) => i + 1);
      void utils.matches.swipeDeck.invalidate();
    },
    onError: (err) => {
      if (err.data?.httpStatus === 429 || err.message.includes("swipe")) {
        setRateLimitError(err.message);
      }
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const profiles = deck ?? [];
  const current = profiles[currentIndex];

  const zoektNaar =
    (current as { zoektNaar?: string[] } | undefined)?.zoektNaar ?? [];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Match! */}
      {matchResult && (
        <div
          className="bg-on-surface/40 fixed inset-0 z-[70] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-title"
        >
          <div className="bg-surface-container-lowest shadow-floating w-full max-w-sm rounded-3xl p-6 text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <Avatar
                src={matchResult.avatarUrl}
                naam={matchResult.naam}
                size="lg"
                ring
              />
              <span className="bg-primary-container text-on-primary shadow-cta absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full">
                <Sparkles size={18} />
              </span>
            </div>
            <h2 id="match-title" className="text-headline-md text-on-surface">
              Het is een match!
            </h2>
            <p className="text-body-md text-secondary mt-1">
              Jij en {matchResult.naam} willen allebei contact.
            </p>
            {matchResult.reasons.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {matchResult.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="bg-primary-fixed text-label-md text-on-primary-fixed rounded-full px-3 py-1"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/berichten"
                className={buttonClasses("primary", "lg", "w-full")}
              >
                <MessageCircle size={18} /> Bericht sturen
              </Link>
              <Button variant="ghost" onClick={() => setMatchResult(null)}>
                Verder swipen
              </Button>
            </div>
          </div>
        </div>
      )}

      {!current || currentIndex >= profiles.length ? (
        <EmptyState
          icon={<Heart size={22} />}
          title="Geen nieuwe profielen"
          description="Kom later terug voor nieuwe makers in jouw netwerk."
          action={
            <Link href="/ontdekken" className={buttonClasses("primary", "md")}>
              Ontdek makers
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <article className="bg-surface-container-lowest shadow-elevated overflow-hidden rounded-3xl">
            <div className="from-primary-fixed via-surface-container-low to-tertiary-fixed/40 relative flex flex-col items-center bg-gradient-to-br px-5 pt-8 pb-5 text-center">
              <span className="bg-surface-container-lowest/80 text-label-sm text-secondary absolute top-4 right-4 rounded-full px-2.5 py-1 backdrop-blur-md">
                {currentIndex + 1} / {profiles.length}
              </span>
              <Avatar
                src={current.avatarUrl}
                naam={current.naam ?? current.name ?? "?"}
                size="xl"
                className="shadow-elevated rounded-full"
              />
              <h2 className="text-headline-md text-on-surface mt-3">
                {current.naam ?? current.name}
              </h2>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {current.sector && (
                  <span className="bg-surface-container-lowest text-label-md text-primary-container rounded-full px-3 py-1">
                    {current.sector}
                  </span>
                )}
                {current.regio && (
                  <span className="bg-surface-container-lowest text-label-md text-secondary flex items-center gap-1 rounded-full px-3 py-1">
                    <MapPin size={12} /> {current.regio}
                  </span>
                )}
                {current.fase && (
                  <span className="bg-surface-container-lowest text-label-md text-secondary rounded-full px-3 py-1">
                    {current.fase.charAt(0).toUpperCase() +
                      current.fase.slice(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {current.missie && (
                <p className="text-body-lg text-on-surface-variant italic">
                  &ldquo;{current.missie}&rdquo;
                </p>
              )}

              {zoektNaar.length > 0 ? (
                <div>
                  <p className="text-label-sm text-secondary mb-2 uppercase">
                    Op zoek naar
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {zoektNaar.map((z) => (
                      <span
                        key={z}
                        className="bg-primary-container/10 text-label-md text-primary-container rounded-full px-3 py-1"
                      >
                        {ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ??
                          z}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                current.ikZoek && (
                  <div>
                    <p className="text-label-sm text-secondary mb-1 uppercase">
                      Ik zoek
                    </p>
                    <p className="text-body-md text-on-surface-variant">
                      {current.ikZoek}
                    </p>
                  </div>
                )
              )}

              {current.expertise && current.expertise.length > 0 && (
                <div>
                  <p className="text-label-sm text-secondary mb-2 uppercase">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container text-label-md text-on-surface rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/makers/${current.id}`}
                className="text-label-md text-secondary hover:text-primary-container flex items-center justify-center gap-1 transition-colors"
              >
                <Info size={14} /> Volledig profiel bekijken
              </Link>
            </div>
          </article>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() =>
                swipe.mutate({ targetId: current.id, decision: "pass" })
              }
              disabled={swipe.isPending}
              className="bg-surface-container-lowest text-secondary shadow-elevated hover:text-error flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50"
              aria-label="Sla over"
            >
              <X size={26} />
            </button>
            <button
              onClick={() =>
                swipe.mutate({ targetId: current.id, decision: "like" })
              }
              disabled={swipe.isPending}
              className="bg-primary-container text-on-primary shadow-cta flex h-20 w-20 items-center justify-center rounded-full transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
              aria-label="Connectie maken"
            >
              {swipe.isPending ? (
                <Spinner />
              ) : (
                <Heart size={30} fill="currentColor" />
              )}
            </button>
          </div>

          {rateLimitError && (
            <div className="bg-primary-fixed/50 rounded-2xl px-4 py-3 text-center">
              <p className="text-body-md text-on-surface mb-1">
                {rateLimitError}
              </p>
              <Link
                href="/instellingen/abonnement"
                className="text-label-lg text-primary-container hover:underline"
              >
                Upgrade naar Pro →
              </Link>
            </div>
          )}
        </div>
      )}

      {myMatches && myMatches.length > 0 && (
        <section>
          <SectionHeader
            title="Mijn matches"
            count={myMatches.length}
            viewAllHref="/berichten"
            viewAllLabel="Berichten"
          />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
            {myMatches.slice(0, 10).map((match) => {
              const other =
                match.userId === current?.id ? match.target : match.user;
              const naam = other.naam ?? other.name ?? "?";
              return (
                <Link
                  key={match.id}
                  href={`/berichten/${match.id}`}
                  className="flex w-16 shrink-0 flex-col items-center gap-1"
                >
                  <Avatar src={other.avatarUrl} naam={naam} size="md" ring />
                  <span className="text-label-sm text-secondary w-full truncate text-center">
                    {naam.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
