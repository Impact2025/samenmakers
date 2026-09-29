import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { PageHeader } from "@/components/shared/page-header";
import { MaterialsPanel } from "./materials-panel";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Lesmateriaal" };

async function load(cohortId: string) {
  try {
    const [cohort, materials, sessions] = await Promise.all([
      api.learning.cohort({ cohortId }),
      api.materials.list({ cohortId }),
      api.sessions.list({ cohortId }),
    ]);
    return { cohort, materials, sessions };
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export default async function MateriaalPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const { cohort, materials, sessions } = await load(cohortId);

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
        title="Lesmateriaal"
        description="Presentaties en literatuur. Na afronding van de opleiding komt dit in de kennisbank voor alumni."
        className="mb-0"
      />
      <MaterialsPanel
        cohortId={cohortId}
        materials={materials}
        sessions={sessions.map((s) => ({ id: s.id, title: s.title }))}
      />
    </div>
  );
}
