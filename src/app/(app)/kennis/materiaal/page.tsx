import type { Metadata } from "next";
import Link from "next/link";
import { TRPCError } from "@trpc/server";
import { ChevronLeft, FileText, Lock, Search } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { fieldClasses } from "@/components/ui/field-styles";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Kennisbank alumni" };

interface Props {
  searchParams: Promise<{ search?: string }>;
}

// Null = geen toegang (alleen alumni na afronding van de opleiding).
async function load(search: string | undefined) {
  try {
    return await api.materials.library(search ? { search } : {});
  } catch (e) {
    if (e instanceof TRPCError && e.code === "FORBIDDEN") return null;
    throw e;
  }
}

export default async function MateriaalBibliotheekPage({
  searchParams,
}: Props) {
  const { search } = await searchParams;
  const items = await load(search);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/kennis"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Kennisbank
      </Link>
      <PageHeader
        label="Alumni"
        title="Lesmateriaal"
        description="Alle presentaties en literatuur uit de leergangen."
        className="mb-0"
      />

      {items === null ? (
        <EmptyState
          icon={<Lock size={22} />}
          title="Beschikbaar na afronding van je opleiding"
          description="Het lesmateriaal is er voor alumni. Zodra je de leergang hebt afgerond, krijg je hier toegang."
        />
      ) : (
        <>
          <form
            action="/kennis/materiaal"
            method="get"
            role="search"
            className="relative"
          >
            <label>
              <span className="sr-only">Zoeken in het lesmateriaal</span>
              <Search
                size={20}
                className="text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                name="search"
                type="search"
                defaultValue={search ?? ""}
                placeholder="Zoek presentaties en literatuur..."
                className={cn(fieldClasses, "pl-12")}
              />
            </label>
          </form>

          {items.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="Geen materiaal gevonden"
              description="Probeer een andere zoekterm."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((m) => (
                <li
                  key={m.id}
                  className="bg-surface-container-lowest shadow-card rounded-2xl p-4"
                >
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-label-lg text-primary-container inline-flex items-center gap-1.5"
                  >
                    <FileText size={14} /> {m.title}
                  </a>
                  {m.description && (
                    <p className="text-body-md text-secondary mt-1">
                      {m.description}
                    </p>
                  )}
                  <p className="text-body-sm text-secondary mt-1">
                    {[m.programName, m.cohortName, m.sessionTitle]
                      .filter(Boolean)
                      .join(" · ")}{" "}
                    · {formatDate(m.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
