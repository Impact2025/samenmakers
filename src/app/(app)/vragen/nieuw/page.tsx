import type { Metadata } from "next";
import { NewQuestionForm } from "./new-question-form";

export const metadata: Metadata = { title: "Nieuwe vraag" };

export default function NieuweVraagPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">Q&A</p>
        <h1 className="text-headline-md text-on-surface">Stel een vraag</h1>
      </div>
      <NewQuestionForm />
    </div>
  );
}
