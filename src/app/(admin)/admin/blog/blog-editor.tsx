"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardBody } from "@/components/ui/card";
import { analyzeSeo, type SeoCheckStatus } from "@/lib/seo/analyze";

type Category = "blog" | "kennisbank" | "tool" | "funding";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "blog", label: "Blog" },
  { value: "kennisbank", label: "Kennisbank" },
  { value: "tool", label: "Tool" },
  { value: "funding", label: "Funding" },
];

export interface BlogEditorInitial {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  category?: Category;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImageUrl?: string;
  isPublished?: boolean;
  aiGenerated?: boolean;
}

const statusDot: Record<SeoCheckStatus, string> = {
  good: "bg-primary",
  ok: "bg-amber-500",
  bad: "bg-red-500",
};

export function BlogEditor({ initial }: { initial?: BlogEditorInitial }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    category: initial?.category ?? ("blog" as Category),
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    focusKeyword: initial?.focusKeyword ?? "",
    keywords: (initial?.keywords ?? []).join(", "),
    canonicalUrl: initial?.canonicalUrl ?? "",
    ogImageUrl: initial?.ogImageUrl ?? "",
    aiGenerated: initial?.aiGenerated ?? false,
  });

  const [topic, setTopic] = useState("");
  const [suggestions, setSuggestions] = useState<{
    internal: { anchor: string; slug: string }[];
    external: { anchor: string; url: string }[];
  } | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const seo = useMemo(
    () =>
      analyzeSeo({
        title: form.title,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        excerpt: form.excerpt,
        content: form.content,
        focusKeyword: form.focusKeyword,
        slug: form.slug,
      }),
    [form],
  );

  const generate = trpc.blog.generate.useMutation({
    onSuccess: (draft) => {
      let content = draft.content;
      if (draft.faq.length) {
        content +=
          "\n\n## Veelgestelde vragen\n\n" +
          draft.faq.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n");
      }
      setForm((f) => ({
        ...f,
        title: draft.title,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        excerpt: draft.excerpt,
        keywords: draft.keywords.join(", "),
        content,
        aiGenerated: true,
      }));
      setSuggestions({ internal: draft.internalLinks, external: draft.externalLinks });
    },
  });

  const create = trpc.blog.create.useMutation({
    onSuccess: (post) => {
      void utils.blog.list.invalidate();
      if (post) router.push(`/admin/blog/${post.id}`);
    },
  });
  const update = trpc.blog.update.useMutation({
    onSuccess: () => {
      void utils.blog.list.invalidate();
      router.refresh();
    },
  });
  const setPublished = trpc.blog.setPublished.useMutation({
    onSuccess: () => {
      void utils.blog.list.invalidate();
      router.refresh();
    },
  });

  function payload() {
    return {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || undefined,
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      category: form.category,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      focusKeyword: form.focusKeyword || undefined,
      keywords: form.keywords
        ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      canonicalUrl: form.canonicalUrl || undefined,
      ogImageUrl: form.ogImageUrl || undefined,
      aiGenerated: form.aiGenerated,
    };
  }

  function save() {
    if (isEdit) update.mutate({ id: initial!.id!, ...payload() });
    else create.mutate(payload());
  }

  const saving = create.isPending || update.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Main column */}
      <div className="space-y-6">
        {/* AI generator */}
        <Card hover={false}>
          <CardBody className="p-5 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface">
                AI-generator
              </h2>
            </div>
            <Input
              placeholder="Onderwerp (bijv. 'Subsidies voor sociale ondernemingen 2025')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Input
              placeholder="Focus-keyword (bijv. 'subsidie sociale onderneming')"
              value={form.focusKeyword}
              onChange={(e) => set("focusKeyword", e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("category", c.value)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                    form.category === c.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-hairline text-on-surface-variant"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={generate.isPending || topic.length < 3 || form.focusKeyword.length < 2}
              onClick={() =>
                generate.mutate({
                  topic,
                  focusKeyword: form.focusKeyword,
                  category: form.category,
                })
              }
            >
              {generate.isPending ? <Spinner /> : "Genereer artikel met AI"}
            </Button>
            {generate.error && (
              <p className="text-xs text-red-600">{generate.error.message}</p>
            )}
          </CardBody>
        </Card>

        <div>
          <label className="text-label-caps text-outline block mb-2">TITEL *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={160} />
        </div>

        <div>
          <label className="text-label-caps text-outline block mb-2">SLUG (URL)</label>
          <Input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-gegenereerd indien leeg"
          />
        </div>

        <div>
          <label className="text-label-caps text-outline block mb-2">SAMENVATTING</label>
          <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} maxLength={300} />
        </div>

        <div>
          <label className="text-label-caps text-outline block mb-2">INHOUD (Markdown) *</label>
          <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={20} />
          <p className="text-xs text-outline mt-1">
            {seo.wordCount} woorden · {seo.readingTime} min leestijd
          </p>
        </div>

        {/* SEO meta */}
        <Card hover={false}>
          <CardBody className="p-5 space-y-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface">SEO-meta</h2>
            <div>
              <label className="text-label-caps text-outline block mb-2">META-TITLE ({form.metaTitle.length})</label>
              <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} maxLength={70} />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">META-DESCRIPTION ({form.metaDescription.length})</label>
              <Textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} rows={2} maxLength={200} />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">KEYWORDS (komma-gescheiden)</label>
              <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">OMSLAG / OG-IMAGE URL</label>
              <Input value={form.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">CANONICAL URL (optioneel)</label>
              <Input value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder="https://..." />
            </div>
          </CardBody>
        </Card>

        {/* Save bar */}
        <div className="flex flex-wrap items-center gap-3 hairline-t pt-6">
          <Button type="button" variant="primary" onClick={save} disabled={saving || form.title.length < 3 || form.content.length < 20}>
            {saving ? <Spinner /> : isEdit ? "Wijzigingen opslaan" : "Concept opslaan"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="secondary"
              disabled={setPublished.isPending}
              onClick={() => setPublished.mutate({ id: initial!.id!, isPublished: !initial?.isPublished })}
            >
              {initial?.isPublished ? "Depubliceren" : "Publiceren"}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/blog")}>
            Terug
          </Button>
          {(create.error ?? update.error) && (
            <p className="text-sm text-red-600 w-full">{(create.error ?? update.error)?.message}</p>
          )}
        </div>
      </div>

      {/* Sidebar: SEO score */}
      <div className="space-y-4">
        <Card hover={false}>
          <CardBody className="p-5">
            <p className="text-[10px] font-bold tracking-widest text-outline mb-2">SEO-SCORE</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className={`text-5xl font-black ${seo.score >= 80 ? "text-primary" : seo.score >= 50 ? "text-amber-600" : "text-red-500"}`}>
                {seo.score}
              </span>
              <span className="text-outline">/100</span>
            </div>
            <div className="space-y-2">
              {seo.checks.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${statusDot[c.status]}`} />
                  <span className="text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{c.label}:</span> {c.message}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {suggestions && (
          <Card hover={false}>
            <CardBody className="p-5">
              <p className="text-[10px] font-bold tracking-widest text-outline mb-3">LINK-SUGGESTIES (AI)</p>
              {suggestions.internal.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-on-surface mb-1">Intern</p>
                  <ul className="mb-3 space-y-1">
                    {suggestions.internal.map((l, i) => (
                      <li key={i} className="text-xs text-outline">
                        {l.anchor} → <code>/kennis/{l.slug}</code>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {suggestions.external.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-on-surface mb-1">Extern</p>
                  <ul className="space-y-1">
                    {suggestions.external.map((l, i) => (
                      <li key={i} className="text-xs text-outline break-all">{l.anchor} → {l.url}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
