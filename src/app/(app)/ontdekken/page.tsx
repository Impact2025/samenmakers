import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DiscoverContent } from "./discover-content";

export const metadata: Metadata = { title: "Ontdekken" };

export default function OntdekkenPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">NETWERK</p>
        <h1 className="text-headline-md text-on-surface">Ontdek makers</h1>
      </div>
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
