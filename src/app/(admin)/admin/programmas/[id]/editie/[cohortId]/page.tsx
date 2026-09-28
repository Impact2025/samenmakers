import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { api } from "@/trpc/server";
import { buttonClasses } from "@/components/ui/button";
import { CohortManager } from "./cohort-manager";

export const metadata: Metadata = { title: "Beheer — editie" };

export default async function CohortPage({
  params,
}: {
  params: Promise<{ id: string; cohortId: string }>;
}) {
  const { id, cohortId } = await params;
  const cohort = await api.programs
    .cohortById({ id: cohortId })
    .catch((e: unknown) => {
      if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
      throw e;
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/programmas/${id}`}
          className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
        >
          <ChevronLeft size={16} /> {cohort.program?.name ?? "Programma"}
        </Link>
        <Link
          href={`/leren/${cohort.id}`}
          className={buttonClasses("secondary", "sm")}
        >
          <ExternalLink size={16} /> Bekijk als cursist
        </Link>
      </div>
      <CohortManager cohort={cohort} />
    </div>
  );
}
