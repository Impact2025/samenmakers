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
      const res = await fetch("/api/upload/avatar", { method: "POST", body: data });
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
        <label className="text-label-caps text-outline block mb-2">CATEGORIE *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                form.category === cat.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-hairline text-on-surface-variant hover:border-on-surface"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-label-caps text-outline block mb-2">TITEL *</label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Een pakkende, beschrijvende titel"
          maxLength={160}
          required
        />
        <p className="text-xs text-outline mt-1">{form.title.length}/160</p>
      </div>

      <div>
        <label className="text-label-caps text-outline block mb-2">SAMENVATTING</label>
        <Textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Korte intro die onder de titel verschijnt (max. 300 tekens)"
          maxLength={300}
          rows={2}
        />
        <p className="text-xs text-outline mt-1">{form.excerpt.length}/300</p>
      </div>

      <div>
        <label className="text-label-caps text-outline block mb-2">INHOUD *</label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Schrijf je artikel... Markdown wordt ondersteund."
          rows={14}
          required
        />
        <p className={`text-xs mt-1 ${charCount < 50 ? "text-red-500" : "text-outline"}`}>
          {charCount} tekens{charCount < 50 ? ` — minimaal 50 vereist` : ""}
        </p>
      </div>

      <div>
        <label className="text-label-caps text-outline block mb-2">OMSLAGAFBEELDING</label>
        {form.coverImageUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.coverImageUrl} alt="Cover" className="w-full h-40 object-cover border border-hairline" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, coverImageUrl: "" }))}
              className="absolute top-2 right-2 px-2 py-1 bg-white border border-hairline text-xs font-medium hover:bg-surface-container"
            >
              Verwijderen
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-hairline cursor-pointer hover:border-on-surface transition-colors bg-surface-container-low">
            {uploading ? (
              <Spinner />
            ) : (
              <>
                <span className="text-sm text-outline">Klik om een afbeelding te uploaden</span>
                <span className="text-xs text-outline mt-1">PNG, JPG · max 4 MB</span>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <div className="hairline-t pt-6">
        <p className="text-body-sm text-outline mb-4">
          Je artikel wordt na indiening beoordeeld door het Samenmakers-team voordat het gepubliceerd wordt.
        </p>
        {create.error && <p className="text-sm text-red-600 mb-4">{create.error.message}</p>}
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={create.isPending || uploading || charCount < 50}>
            {create.isPending ? <Spinner /> : "Artikel indienen"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuleren
          </Button>
        </div>
      </div>
    </form>
  );
}
