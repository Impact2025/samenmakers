"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const CATEGORIES = [
  { value: "kennisbank", label: "Kennisbank" },
  { value: "blog", label: "Blog" },
  { value: "tool", label: "Tool / Resource" },
  { value: "funding", label: "Funding" },
] as const;

export function NewPostForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    category: "kennisbank" as "blog" | "kennisbank" | "tool" | "funding",
  });
  const [uploading, setUploading] = useState(false);

  const create = trpc.posts.create.useMutation({
    onSuccess: () => {
      router.push("/kennis?submitted=1");
    },
  });

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { url?: string };
      if (json.url) setForm((f) => ({ ...f, coverImageUrl: json.url! }));
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      title: form.title,
      excerpt: form.excerpt || undefined,
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      category: form.category,
    });
  }

  const charCount = form.content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-label-lg text-on-surface mb-1.5 block">
          Categorie *
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                form.category === cat.value
                  ? "bg-primary-container text-on-primary border-transparent shadow-sm"
                  : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-label-lg text-on-surface mb-1.5 block">
          Titel *
        </label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Een pakkende, beschrijvende titel"
          maxLength={160}
          required
        />
        <p className="text-secondary mt-1 text-xs">{form.title.length}/160</p>
      </div>

      <div>
        <label className="text-label-lg text-on-surface mb-1.5 block">
          Samenvatting
        </label>
        <Textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Korte intro die onder de titel verschijnt (max. 300 tekens)"
          maxLength={300}
          rows={2}
        />
        <p className="text-secondary mt-1 text-xs">{form.excerpt.length}/300</p>
      </div>

      <div>
        <label className="text-label-lg text-on-surface mb-1.5 block">
          Inhoud *
        </label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Schrijf je artikel... Markdown wordt ondersteund."
          rows={14}
          required
        />
        <p
          className={`mt-1 text-xs ${charCount < 50 ? "text-error" : "text-secondary"}`}
        >
          {charCount} tekens{charCount < 50 ? ` — minimaal 50 vereist` : ""}
        </p>
      </div>

      <div>
        <label className="text-label-lg text-on-surface mb-1.5 block">
          Omslagafbeelding
        </label>
        {form.coverImageUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImageUrl}
              alt="Cover"
              className="h-40 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, coverImageUrl: "" }))}
              className="hover:bg-surface-container border-surface-container bg-surface-container-lowest text-label-md absolute top-2 right-2 inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 transition-colors"
            >
              Verwijderen
            </button>
          </div>
        ) : (
          <label className="hover:shadow-elevated bg-surface-container-low border-outline-variant flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors">
            {uploading ? (
              <Spinner />
            ) : (
              <>
                <span className="text-secondary text-sm">
                  Klik om een afbeelding te uploaden
                </span>
                <span className="text-secondary mt-1 text-xs">
                  PNG, JPG · max 4 MB
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleCoverUpload(e)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div className="border-hairline flex flex-col gap-3 border-t pt-5">
        <p className="text-body-md text-secondary mb-4">
          Je artikel wordt na indiening beoordeeld door het We Shape the
          Future-team voordat het gepubliceerd wordt.
        </p>
        {create.error && (
          <p className="text-error mb-4 text-sm">{create.error.message}</p>
        )}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={create.isPending || uploading || charCount < 50}
          >
            {create.isPending ? <Spinner /> : "Artikel indienen"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Annuleren
          </Button>
        </div>
      </div>
    </form>
  );
}
