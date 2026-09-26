import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NewPostForm } from "./new-post-form";

export const metadata: Metadata = { title: "Nieuw artikel" };

export default function NieuwArtikelPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/kennis"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Kennisbank
      </Link>
      <PageHeader
        title="Artikel schrijven"
        description="Beschikbaar voor Pro-leden · Wordt gepubliceerd na review"
        className="mb-0"
      />
      <div className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
        <NewPostForm />
      </div>
    </div>
  );
}
