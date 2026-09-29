import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { PageHeader } from "@/components/shared/page-header";
import { SessionsPanel } from "./sessions-panel";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Sessies" };

async function load(cohortId: string) {
  try {
    const [cohort, sessions] = await Promise.all([
      api.learning.cohort({ cohortId }),
      api.sessions.list({ cohortId }),
    ]);
    return { cohort, sessions };
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export default async function SessiesPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const { cohort, sessions } = await load(cohortId);
  const role = cohort.role;
  const canPlan =
    cohort.isAdmin || role === "facilitator" || role === "manager";

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
        title="Sessies"
        description="Programmadagen met briefing, huiswerkdeadline en aanwezigheid."
        className="mb-0"
      />
      <SessionsPanel
        cohortId={cohortId}
        canPlan={canPlan}
        canSeeAttendance={canPlan || role === "docent"}
        sessions={sessions}
      />
    </div>
  );
}
