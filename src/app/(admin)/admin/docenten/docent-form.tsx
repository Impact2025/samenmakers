"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";

type Role = "docent" | "manager" | "facilitator";

export interface CohortOption {
  id: string;
  label: string;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "docent", label: "Docent" },
  { value: "facilitator", label: "Facilitator" },
  { value: "manager", label: "Programmamanager" },
];

/** Eén formulier: naam + e-mail + editie. Nieuwe mensen krijgen automatisch een account en een uitnodiging. */
export function DocentForm({ cohorts }: { cohorts: CohortOption[] }) {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? "");
  const [role, setRole] = useState<Role>("docent");
  const [done, setDone] = useState<string | null>(null);

  const add = trpc.programs.memberAdd.useMutation({
    onSuccess: (r) => {
      setDone(
        r.invited
          ? `Uitnodiging verstuurd naar ${email}. Het account is aangemaakt.`
          : `${email} heeft al een account en is nu gekoppeld.`,
      );
      setNaam("");
      setEmail("");
      router.refresh();
    },
  });

  if (cohorts.length === 0) {
    return (
      <p className="text-body-md text-secondary">
        Er zijn nog geen lopende edities. Maak eerst een editie aan onder
        Onderwijs → programma → Nieuwe editie.
      </p>
    );
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(null);
        add.mutate({
          cohortId,
          email,
          ...(naam.trim() ? { naam: naam.trim() } : {}),
          role,
        });
      }}
    >
      <Input
        label="Naam"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        placeholder="Voor- en achternaam"
      />
      <Input
        label="E-mailadres"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="docent@bedrijf.nl"
        required
      />
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Editie</span>
        <select
          className={cn(fieldClasses)}
          value={cohortId}
          onChange={(e) => setCohortId(e.target.value)}
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Rol</span>
        <select
          className={cn(fieldClasses)}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Button type="submit" disabled={add.isPending || !email}>
          {add.isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <UserPlus size={18} /> Docent uitnodigen
            </>
          )}
        </Button>
        {add.error && (
          <p className="text-body-sm text-error">{add.error.message}</p>
        )}
        {done && <p className="text-body-sm text-on-surface">{done}</p>}
      </div>
    </form>
  );
}
