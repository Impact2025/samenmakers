"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SECTOREN } from "@/lib/constants";

export function NewQuestionForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", sector: "" });

  const create = trpc.questions.create.useMutation({
    onSuccess: (data) => {
      if (data) router.push(`/vragen/${data.id}`);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      title: form.title,
      content: form.content || undefined,
      sector: form.sector || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-label-md text-secondary mb-2 block">
          VRAAG *
        </label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Hoe pak ik...? Wie weet meer over...?"
          required
          minLength={5}
          maxLength={200}
        />
      </div>
      <div>
        <label className="text-label-md text-secondary mb-2 block">
          Toelichting
        </label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Geef meer context over je vraag"
          rows={4}
        />
      </div>
      <div>
        <label className="text-label-md text-secondary mb-2 block">
          Sector (optioneel)
        </label>
        <select
          value={form.sector}
          onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
          className="text-on-surface bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 w-full rounded-xl border border-transparent px-3 py-2.5 text-sm outline-none focus:ring-[3px]"
        >
          <option value="">Alle sectoren</option>
          {SECTOREN.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {create.error && (
        <p className="text-error text-sm">{create.error.message}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : "Vraag plaatsen"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
      </div>
    </form>
  );
}
