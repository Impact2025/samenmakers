"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { COHORT_ROLE_LABELS } from "@/lib/learning";

type Role = "cursist" | "docent" | "manager" | "facilitator" | "alumnus";

export interface CohortOption {
  id: string;
  label: string;
}

/** Iedereen uitnodigen: zonder editie word je gewoon lid, met editie krijg je meteen een rol daarin. */
export function InviteForm({ cohorts }: { cohorts: CohortOption[] }) {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [role, setRole] = useState<Role>("cursist");
  const [done, setDone] = useState<string | null>(null);

  const finish = (invited: boolean, to: string) => {
    setDone(
      invited
        ? `Uitnodiging verstuurd naar ${to}. Het account is aangemaakt.`
        : `${to} heeft al een account en is nu aan de editie gekoppeld.`,
    );
    setNaam("");
    setEmail("");
    router.refresh();
  };

  const invite = trpc.programs.userInvite.useMutation({
    onSuccess: () => finish(true, email),
  });
  const addToCohort = trpc.programs.memberAdd.useMutation({
    onSuccess: (r) => finish(r.invited, email),
  });

  const pending = invite.isPending || addToCohort.isPending;
  const error = invite.error ?? addToCohort.error;

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(null);
        const n = naam.trim();
        if (cohortId) {
          addToCohort.mutate({
            cohortId,
            email,
            ...(n ? { naam: n } : {}),
            role,
          });
        } else {
          invite.mutate({ email, ...(n ? { naam: n } : {}) });
        }
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
        placeholder="naam@bedrijf.nl"
        required
      />
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Editie (optioneel)</span>
        <select
          className={fieldClasses}
          value={cohortId}
          onChange={(e) => setCohortId(e.target.value)}
        >
          <option value="">Geen editie — alleen lid van het platform</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {cohortId && (
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Rol in de editie</span>
          <select
            className={fieldClasses}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {Object.entries(COHORT_ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending || !email}>
          {pending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Send size={18} /> Uitnodiging versturen
            </>
          )}
        </Button>
        {error && <p className="text-body-sm text-error">{error.message}</p>}
        {done && <p className="text-body-sm text-on-surface">{done}</p>}
      </div>
    </form>
  );
}
