import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { ProgramEditor } from "./program-editor";

export const metadata: Metadata = { title: "Beheer — programma" };

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await api.programs.byId({ id }).catch((e: unknown) => {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  });

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/programmas"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Programma&apos;s
      </Link>
      <ProgramEditor program={program} />
    </div>
  );
}
