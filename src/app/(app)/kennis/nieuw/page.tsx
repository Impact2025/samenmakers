import type { Metadata } from "next";
import { NewPostForm } from "./new-post-form";

export const metadata: Metadata = { title: "Nieuw artikel" };

export default function NieuwArtikelPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">KENNISBANK</p>
        <h1 className="text-headline-md text-on-surface">Artikel schrijven</h1>
        <p className="text-body-sm text-outline mt-1">Beschikbaar voor Pro-leden · Wordt gepubliceerd na review</p>
      </div>
      <NewPostForm />
    </div>
  );
}
