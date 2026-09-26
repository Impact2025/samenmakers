import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/shared/page-header";
import { MatchingClient } from "./matching-client";

export const metadata: Metadata = { title: "Matching" };

export default function MatchingPage() {
  return (
    <div>
      <PageHeader
        label="Matching"
        title="Vind je medemissie-ondernemer"
        description="Swipe door makers die bij jouw missie passen"
        className="mb-6"
      />
      <Suspense
        fallback={
          <div className="text-primary-container flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <MatchingClient />
      </Suspense>
    </div>
  );
}
