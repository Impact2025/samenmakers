"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function CreateCohortForm() {
  const [form, setForm] = useState({ name: "", description: "", isPublic: false });
  const [created, setCreated] = useState<{ name: string; inviteCode: string | null } | null>(null);

  const createCohort = trpc.admin.createCohort.useMutation({
    onSuccess: (data) => {
      if (data) setCreated({ name: data.name, inviteCode: data.inviteCode });
      setForm({ name: "", description: "", isPublic: false });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createCohort.mutate({
      name: form.name,
      description: form.description || undefined,
      isPublic: form.isPublic,
    });
  }

  return (
    <div>
      {created && (
        <div className="bg-primary/10 border border-primary/20 p-4 mb-6">
          <p className="text-sm font-semibold text-primary mb-1">Cohort aangemaakt: {created.name}</p>
          <p className="text-xs text-on-surface-variant">
            Invite code:{" "}
            <code className="font-mono font-bold text-on-surface">{created.inviteCode}</code>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-label-caps text-outline block mb-2">NAAM *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Bijv. Impact Accelerator Q1 2026"
            required
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">OMSCHRIJVING</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Beschrijf het doel van dit cohort"
            rows={3}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-on-surface">Publiek cohort (zichtbaar voor alle leden)</span>
        </label>
        <Button type="submit" variant="primary" disabled={createCohort.isPending}>
          {createCohort.isPending ? <Spinner /> : "Cohort aanmaken"}
        </Button>
      </form>
    </div>
  );
}
