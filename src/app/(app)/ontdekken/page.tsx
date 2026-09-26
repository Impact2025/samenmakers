import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Heart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClasses } from "@/components/ui/button";
import { DiscoverContent } from "./discover-content";

export const metadata: Metadata = { title: "Netwerk" };

export default function OntdekkenPage() {
  return (
    <div>
      <PageHeader
        title="Netwerk & community"
        description="Vind changemakers die jouw missie versterken"
        action={
          <Link href="/matching" className={buttonClasses("tonal", "sm")}>
            <Heart size={16} /> Matching
          </Link>
        }
        className="mb-5"
      />
      <Suspense
        fallback={
          <div className="text-primary-container flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
