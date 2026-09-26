import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NewQuestionForm } from "./new-question-form";

export const metadata: Metadata = { title: "Nieuwe vraag" };

export default function NieuweVraagPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/vragen"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Community feed
      </Link>
      <PageHeader
        title="Stel een vraag"
        description="De community denkt met je mee."
        className="mb-0"
      />
      <div className="bg-surface-container-lowest shadow-card rounded-2xl p-5">
        <NewQuestionForm />
      </div>
    </div>
  );
}
