import type { Metadata } from "next";
import { NewPostForm } from "./new-post-form";

export const metadata: Metadata = { title: "Nieuw artikel" };

export default function NieuwArtikelPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-label-md text-secondary mb-1">KENNISBANK</p>
        <h1 className="text-headline-lg text-on-surface">Artikel schrijven</h1>
        <p className="text-body-md text-secondary mt-1">
          Beschikbaar voor Pro-leden · Wordt gepubliceerd na review
        </p>
      </div>
      <NewPostForm />
    </div>
  );
}
