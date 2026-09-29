import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { PageHeader } from "@/components/shared/page-header";
import { FeedPanel } from "@/components/community/feed-panel";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Klas" };

async function load(cohortId: string) {
  try {
    const [cohort, posts] = await Promise.all([
      api.learning.cohort({ cohortId }),
      api.feed.list({ cohortId }),
    ]);
    return { cohort, posts };
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export default async function KlasPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const { cohort, posts } = await load(cohortId);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/leren/${cohortId}`}
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Leerpad
      </Link>
      <PageHeader
        label={cohort.program.name}
        title={`Klas ${cohort.cohort.name}`}
        description="Alleen zichtbaar voor je klas en docenten. Stel een hulpvraag of bied je hulp aan."
        className="mb-0"
      />
      <FeedPanel cohortId={cohortId} posts={posts} />
    </div>
  );
}
