import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, GraduationCap, Layers, Users } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NewProgramForm } from "./new-program-form";

export const metadata: Metadata = { title: "Beheer — onderwijs" };

const STATUS: Record<string, { label: string; cls: string }> = {
  concept: { label: "Concept", cls: "bg-surface-container text-secondary" },
  gepubliceerd: { label: "Gepubliceerd", cls: "bg-tertiary/10 text-tertiary" },
  gearchiveerd: {
    label: "Gearchiveerd",
    cls: "bg-error-container text-on-error-container",
  },
};

export default async function ProgrammasPage() {
  const programs = await api.programs.list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Onderwijs"
        title="Programma's"
        description="Een programma bevat modules en lessen. Per programma start je edities (cohorten) met cursisten en docenten."
        className="mb-0"
      />

      <NewProgramForm />

      {programs.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={22} />}
          title="Nog geen programma's"
          description="Maak hierboven je eerste programma aan."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {programs.map((p) => {
            const st = STATUS[p.status] ?? STATUS.concept!;
            return (
              <Link
                key={p.id}
                href={`/admin/programmas/${p.id}`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex flex-col gap-3 rounded-2xl p-4 transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="text-on-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: p.color }}
                    >
                      <GraduationCap size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-title-md text-on-surface truncate">
                        {p.name}
                      </p>
                      {p.tagline && (
                        <p className="text-body-sm text-secondary truncate">
                          {p.tagline}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-label-sm shrink-0 rounded-full px-2.5 py-1 ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className="text-label-md text-secondary flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Layers size={14} /> {p.moduleCount} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {p.cohortCount} edities (
                    {p.activeCohortCount} actief)
                  </span>
                  <ChevronRight size={16} className="ml-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
