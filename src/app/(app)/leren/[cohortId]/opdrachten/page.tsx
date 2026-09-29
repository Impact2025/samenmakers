import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { features } from "@/lib/features";
import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsPanel } from "./assignments-panel";

interface Props {
  params: Promise<{ cohortId: string }>;
}

export const metadata: Metadata = { title: "Opdrachten" };

async function load(cohortId: string) {
  try {
    const cohort = await api.learning.cohort({ cohortId });
    const [assignments, sessions] = await Promise.all([
      api.assignments.list({ cohortId }),
      cohort.isStaff ? api.sessions.list({ cohortId }) : Promise.resolve([]),
    ]);
    return { cohort, assignments, sessions };
  } catch (e) {
    if (
      e instanceof TRPCError &&
      (e.code === "FORBIDDEN" || e.code === "NOT_FOUND")
    )
      notFound();
    throw e;
  }
}

export default async function OpdrachtenPage({ params }: Props) {
  if (!features.leren) notFound();
  const { cohortId } = await params;
  const { cohort, assignments, sessions } = await load(cohortId);

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
        title="Opdrachten"
        description={
          cohort.isStaff
            ? "Opdrachten per sessie, inleveringen en feedback."
            : "Lever je huiswerk hier in, uiterlijk op de deadline."
        }
        className="mb-0"
      />
      <AssignmentsPanel
        cohortId={cohortId}
        isStaff={cohort.isStaff}
        canLearn={cohort.role === "cursist"}
        assignments={assignments}
        sessions={sessions.map((s) => ({ id: s.id, title: s.title }))}
      />
    </div>
  );
}
