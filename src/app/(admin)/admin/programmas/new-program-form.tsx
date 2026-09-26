"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function NewProgramForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  const create = trpc.programs.create.useMutation({
    onSuccess: (p) => router.push(`/admin/programmas/${p.id}`),
  });

  if (!open) {
    return (
      <div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} /> Nieuw programma
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({ name, ...(tagline ? { tagline } : {}) });
      }}
      className="bg-surface-container-lowest shadow-elevated flex flex-col gap-4 rounded-2xl p-5"
    >
      <h2 className="text-headline-sm text-on-surface">Nieuw programma</h2>
      <Input
        label="Naam *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Leergang Sociaal Ondernemen"
        required
        minLength={2}
      />
      <Input
        label="Ondertitel"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Korte omschrijving (optioneel)"
      />
      {create.error && (
        <p className="text-body-sm text-error">{create.error.message}</p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={create.isPending || name.trim().length < 2}
        >
          {create.isPending ? <Spinner size="sm" /> : "Aanmaken"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuleren
        </Button>
      </div>
    </form>
  );
}
