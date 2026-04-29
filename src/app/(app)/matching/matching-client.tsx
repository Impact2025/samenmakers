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

  const { data: deck, isLoading } = trpc.matches.swipeDeck.useQuery({ limit: 10 });
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

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const profiles = deck ?? [];
  const current = profiles[currentIndex];

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Match celebration overlay */}
      {matchResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-on-primary" />
            </div>
            <h2 className="text-headline-sm text-on-surface mb-2">Het is een match!</h2>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Jullie zijn beiden geïnteresseerd in contact.
            </p>

            {matchResult.reasons.length > 0 && (
              <div className="mb-6 space-y-1.5">
                {matchResult.reasons.map((reason) => (
                  <div key={reason} className="flex items-center justify-center gap-2 text-xs text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/berichten" className="flex-1">
                <button className="w-full py-3 bg-primary text-on-primary font-bold text-label-caps flex items-center justify-center gap-2">
                  <MessageSquare size={16} />
                  Bericht sturen
                </button>
              </Link>
              <button
                onClick={() => setMatchResult(null)}
                className="flex-1 py-3 border border-hairline text-on-surface font-bold text-label-caps"
              >
                Doorgaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swipe card */}
      {!current || currentIndex >= profiles.length ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-headline-sm text-on-surface">Geen nieuwe profielen</p>
          <p className="text-body text-outline">
            Kom later terug voor nieuwe makers in jouw netwerk.
          </p>
          <Link href="/ontdekken">
            <button className="px-6 py-3 bg-primary text-on-primary font-bold text-label-caps">
              Ontdek makers
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Card hover={false}>
            <CardBody>
              <div className="flex gap-5 mb-5">
                <Avatar
                  src={current.avatarUrl}
                  naam={current.naam ?? current.name ?? "?"}
                  size="xl"
                  grayscale={false}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-on-surface">
                    {current.naam ?? current.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {current.sector && <Badge variant="default" size="sm">{current.sector}</Badge>}
                    {current.regio && <Badge variant="default" size="sm">{current.regio}</Badge>}
                    {current.fase && (
                      <Badge variant="default" size="sm">
                        {current.fase.charAt(0).toUpperCase() + current.fase.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {current.missie && (
                <div className="mb-4">
                  <p className="text-label-caps text-outline mb-1">MISSIE</p>
                  <p className="text-body-sm text-on-surface italic">
                    &ldquo;{current.missie}&rdquo;
                  </p>
                </div>
              )}

              {/* Structured zoektNaar tags */}
              {(current as { zoektNaar?: string[] }).zoektNaar && (current as { zoektNaar?: string[] }).zoektNaar!.length > 0 && (
                <div className="mb-4">
                  <p className="text-label-caps text-outline mb-2">OP ZOEK NAAR</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(current as { zoektNaar?: string[] }).zoektNaar!.map((z) => {
                      const label = ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ?? z;
                      return <Badge key={z} variant="primary" size="sm">{label}</Badge>;
                    })}
                  </div>
                </div>
              )}

              {current.ikZoek && !(current as { zoektNaar?: string[] }).zoektNaar?.length && (
                <div className="mb-4">
                  <p className="text-label-caps text-outline mb-1">IK ZOEK</p>
                  <p className="text-body-sm text-on-surface-variant">{current.ikZoek}</p>
                </div>
              )}

              {current.expertise && current.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.expertise.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 hairline-t flex justify-end">
                <Link
                  href={`/makers/${current.id}`}
                  className="text-label-caps text-outline hover:text-primary transition-colors flex items-center gap-1"
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
              onClick={() => swipe.mutate({ targetId: current.id, decision: "pass" })}
              disabled={swipe.isPending}
              className="w-16 h-16 border border-hairline flex items-center justify-center text-outline hover:border-red-400 hover:text-red-400 active:scale-95 transition-all disabled:opacity-50"
              aria-label="Sla over"
            >
              <X size={24} />
            </button>
            <button
              onClick={() => swipe.mutate({ targetId: current.id, decision: "like" })}
              disabled={swipe.isPending}
              className="w-20 h-20 bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container active:scale-95 transition-all disabled:opacity-50"
              aria-label="Connect"
            >
              {swipe.isPending ? <Spinner /> : <Heart size={28} />}
            </button>
          </div>

          <p className="text-center text-label-caps text-outline">
            {currentIndex + 1} / {profiles.length}
          </p>

          {rateLimitError && (
            <div className="border border-primary/30 bg-primary/5 px-4 py-3 text-center">
              <p className="text-sm text-on-surface mb-2">{rateLimitError}</p>
              <Link href="/instellingen/abonnement" className="text-label-caps text-primary hover:underline">
                Upgrade naar Pro →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* My matches */}
      {myMatches && myMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-label-caps text-on-surface">MIJN MATCHES ({myMatches.length})</h2>
            <Link href="/berichten" className="text-label-caps text-primary">BERICHTEN →</Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {myMatches.slice(0, 6).map((match) => {
              const other = match.userId === current?.id ? match.target : match.user;
              return (
                <Link key={match.id} href={`/berichten/${match.id}`}>
                  <Avatar src={other.avatarUrl} naam={other.naam ?? other.name ?? "?"} size="lg" grayscale={false} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
