"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, X, MessageSquare, Info, Sparkles } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
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

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {/* Match celebration overlay */}
      {matchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-sm bg-white p-8 text-center">
            <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Sparkles size={28} className="text-on-primary" />
            </div>
            <h2 className="text-headline-md text-on-surface mb-2">
              Het is een match!
            </h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Jullie zijn beiden geïnteresseerd in contact.
            </p>

            {matchResult.reasons.length > 0 && (
              <div className="mb-6 space-y-1.5">
                {matchResult.reasons.map((reason) => (
                  <div
                    key={reason}
                    className="text-on-surface flex items-center justify-center gap-2 text-xs"
                  >
                    <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                    {reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/berichten" className="flex-1">
                <button className="bg-primary text-on-primary text-label-md flex w-full items-center justify-center gap-2 py-3 font-bold">
                  <MessageSquare size={16} />
                  Bericht sturen
                </button>
              </Link>
              <button
                onClick={() => setMatchResult(null)}
                className="border-hairline text-on-surface text-label-md flex-1 border py-3 font-bold"
              >
                Doorgaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swipe card */}
      {!current || currentIndex >= profiles.length ? (
        <div className="space-y-4 py-16 text-center">
          <p className="text-headline-md text-on-surface">
            Geen nieuwe profielen
          </p>
          <p className="text-body-md text-secondary">
            Kom later terug voor nieuwe makers in jouw netwerk.
          </p>
          <Link href="/ontdekken">
            <button className="bg-primary text-on-primary text-label-md shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-colors">
              Ontdek makers
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Card hover={false}>
            <CardBody>
              <div className="mb-5 flex gap-5">
                <Avatar
                  src={current.avatarUrl}
                  naam={current.naam ?? current.name ?? "?"}
                  size="xl"
                  grayscale={false}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-on-surface text-xl font-extrabold">
                    {current.naam ?? current.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {current.sector && (
                      <Badge variant="default" size="sm">
                        {current.sector}
                      </Badge>
                    )}
                    {current.regio && (
                      <Badge variant="default" size="sm">
                        {current.regio}
                      </Badge>
                    )}
                    {current.fase && (
                      <Badge variant="default" size="sm">
                        {current.fase.charAt(0).toUpperCase() +
                          current.fase.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {current.missie && (
                <div className="mb-4">
                  <p className="text-label-md text-secondary mb-1">Missie</p>
                  <p className="text-body-md text-on-surface italic">
                    &ldquo;{current.missie}&rdquo;
                  </p>
                </div>
              )}

              {/* Structured zoektNaar tags */}
              {(current as { zoektNaar?: string[] }).zoektNaar &&
                (current as { zoektNaar?: string[] }).zoektNaar!.length > 0 && (
                  <div className="mb-4">
                    <p className="text-label-md text-secondary mb-2">
                      Op zoek naar
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(current as { zoektNaar?: string[] }).zoektNaar!.map(
                        (z) => {
                          const label =
                            ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)
                              ?.label ?? z;
                          return (
                            <Badge key={z} variant="primary" size="sm">
                              {label}
                            </Badge>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              {current.ikZoek &&
                !(current as { zoektNaar?: string[] }).zoektNaar?.length && (
                  <div className="mb-4">
                    <p className="text-label-md text-secondary mb-1">Ik zoek</p>
                    <p className="text-body-md text-on-surface-variant">
                      {current.ikZoek}
                    </p>
                  </div>
                )}

              {current.expertise && current.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.expertise.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="hairline-t mt-4 flex justify-end pt-4">
                <Link
                  href={`/makers/${current.id}`}
                  className="text-label-md text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <Info size={12} />
                  Volledig profiel
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() =>
                swipe.mutate({ targetId: current.id, decision: "pass" })
              }
              disabled={swipe.isPending}
              className="border-hairline text-secondary flex h-16 w-16 items-center justify-center border transition-all hover:border-red-400 hover:text-red-400 active:scale-95 disabled:opacity-50"
              aria-label="Sla over"
            >
              <X size={24} />
            </button>
            <button
              onClick={() =>
                swipe.mutate({ targetId: current.id, decision: "like" })
              }
              disabled={swipe.isPending}
              className="bg-primary text-on-primary hover:bg-primary-container flex h-20 w-20 items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label="Connect"
            >
              {swipe.isPending ? <Spinner /> : <Heart size={28} />}
            </button>
          </div>

          <p className="text-label-md text-secondary text-center">
            {currentIndex + 1} / {profiles.length}
          </p>

          {rateLimitError && (
            <div className="border-primary/30 bg-primary/5 border px-4 py-3 text-center">
              <p className="text-on-surface mb-2 text-sm">{rateLimitError}</p>
              <Link
                href="/instellingen/abonnement"
                className="text-label-md text-primary hover:underline"
              >
                Upgrade naar Pro →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* My matches */}
      {myMatches && myMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-label-md text-on-surface">
              MIJN MATCHES ({myMatches.length})
            </h2>
            <Link href="/berichten" className="text-label-md text-primary">
              BERICHTEN →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {myMatches.slice(0, 6).map((match) => {
              const other =
                match.userId === current?.id ? match.target : match.user;
              return (
                <Link key={match.id} href={`/berichten/${match.id}`}>
                  <Avatar
                    src={other.avatarUrl}
                    naam={other.naam ?? other.name ?? "?"}
                    size="lg"
                    grayscale={false}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
