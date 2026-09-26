"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function CreateCohortForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [created, setCreated] = useState<{
    name: string;
    inviteCode: string | null;
  } | null>(null);

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
        <div className="bg-primary/10 border-primary/20 mb-6 border p-4">
          <p className="text-primary mb-1 text-sm font-semibold">
            Cohort aangemaakt: {created.name}
          </p>
          <p className="text-on-surface-variant text-xs">
            Invite code:{" "}
            <code className="text-on-surface font-mono font-bold">
              {created.inviteCode}
            </code>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Naam *
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Bijv. Impact Accelerator Q1 2026"
            required
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Omschrijving
          </label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Beschrijf het doel van dit cohort"
            rows={3}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) =>
              setForm((f) => ({ ...f, isPublic: e.target.checked }))
            }
            className="accent-primary h-4 w-4"
          />
          <span className="text-on-surface text-sm">
            Publiek cohort (zichtbaar voor alle leden)
          </span>
        </label>
        <Button
          type="submit"
          variant="primary"
          disabled={createCohort.isPending}
        >
          {createCohort.isPending ? <Spinner /> : "Cohort aanmaken"}
        </Button>
      </form>
    </div>
  );
}
