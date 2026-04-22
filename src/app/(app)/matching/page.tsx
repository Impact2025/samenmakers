import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MatchingClient } from "./matching-client";

export const metadata: Metadata = { title: "Matching" };

export default function MatchingPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">MATCHING</p>
        <h1 className="text-headline-md text-on-surface">Vind je medemissie-ondernemer</h1>
      </div>
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <MatchingClient />
      </Suspense>
    </div>
  );
}
