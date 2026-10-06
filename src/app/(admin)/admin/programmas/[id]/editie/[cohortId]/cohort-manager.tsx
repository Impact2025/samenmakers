"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { COHORT_ROLE_LABELS, COHORT_STATUS_LABELS } from "@/lib/learning";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Cohort = inferRouterOutputs<AppRouter>["programs"]["cohortById"];
type Role = "cursist" | "docent" | "manager" | "facilitator" | "alumnus";
type MemberStatus = "actief" | "gepauzeerd" | "afgerond" | "uitgeschreven";
type CohortStatus = "concept" | "open" | "lopend" | "afgerond";

const card =
  "flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-card";
const small =
  "h-10 rounded-xl bg-surface-container-low px-2 text-label-md text-on-surface outline-none focus:ring-[3px] focus:ring-primary-container/15";

const toDateInput = (d: Date | string | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

export function CohortManager({ cohort }: { cohort: Cohort }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const rules = cohort.completionRules as { minLessonPercent?: number } | null;
  const [f, setF] = useState({
    name: cohort.name,
    status: cohort.status as CohortStatus,
    startDate: toDateInput(cohort.startDate),
    endDate: toDateInput(cohort.endDate),
    capacity: cohort.capacity != null ? String(cohort.capacity) : "",
    minLessonPercent: String(rules?.minLessonPercent ?? 100),
  });
  const [saved, setSaved] = useState(false);
  const update = trpc.programs.cohortUpdate.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refresh();
    },
  });

  const [code, setCode] = useState(cohort.inviteCode ?? "");
  const [copied, setCopied] = useState(false);
  const regen = trpc.programs.cohortRegenerateCode.useMutation({
    onSuccess: (r) => setCode(r.inviteCode),
  });

  const [add, setAdd] = useState<{ email: string; naam: string; role: Role }>({
    email: "",
    naam: "",
    role: "docent",
  });
  const [invite, setInvite] = useState(true);
  const [bulk, setBulk] = useState("");
  const [bulkRole, setBulkRole] = useState<Role>("cursist");
  const memberImport = trpc.programs.memberImport.useMutation({
    onSuccess: () => {
      refresh();
    },
  });
  const memberAdd = trpc.programs.memberAdd.useMutation({
    onSuccess: () => {
      setAdd((a) => ({ ...a, email: "", naam: "" }));
      refresh();
    },
  });
  const memberUpdate = trpc.programs.memberUpdate.useMutation({
    onSuccess: refresh,
  });
  const memberRemove = trpc.programs.memberRemove.useMutation({
    onSuccess: refresh,
  });

  const staff = cohort.members.filter(
    (m) =>
      m.role === "docent" || m.role === "manager" || m.role === "facilitator",
  );
  const others = cohort.members.filter(
    (m) =>
      m.role !== "docent" && m.role !== "manager" && m.role !== "facilitator",
  );

  const memberRow = (m: Cohort["members"][number]) => {
    const naam = m.user.naam ?? m.user.name ?? m.user.email ?? "Gebruiker";
    return (
      <li
        key={m.id}
        className="bg-surface-container-low flex flex-wrap items-center gap-2 rounded-xl p-2.5"
      >
        <Avatar src={m.user.avatarUrl} naam={naam} size="xs" />
        <div className="min-w-0 flex-1 basis-40">
          <p className="text-label-lg text-on-surface truncate">{naam}</p>
          <p className="text-body-sm text-secondary truncate">{m.user.email}</p>
        </div>
        <select
          aria-label="Rol"
          className={small}
          value={m.role}
          onChange={(e) =>
            memberUpdate.mutate({ id: m.id, role: e.target.value as Role })
          }
        >
          {Object.entries(COHORT_ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          className={small}
          value={m.status}
          onChange={(e) =>
            memberUpdate.mutate({
              id: m.id,
              status: e.target.value as MemberStatus,
            })
          }
        >
          {["actief", "gepauzeerd", "afgerond", "uitgeschreven"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          aria-label="Verwijderen"
          className="text-secondary hover:bg-error-container hover:text-on-error-container flex h-9 w-9 items-center justify-center rounded-full"
          onClick={() => {
            if (window.confirm(`${naam} uit deze editie verwijderen?`))
              memberRemove.mutate({ id: m.id });
          }}
        >
          <Trash2 size={16} />
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-label-sm text-secondary uppercase">
          {cohort.program?.name}
        </p>
        <h1 className="text-headline-lg text-on-surface">{cohort.name}</h1>
      </header>

      {/* Instellingen */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Instellingen</h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({
              id: cohort.id,
              name: f.name,
              status: f.status,
              startDate: f.startDate ? new Date(f.startDate) : null,
              endDate: f.endDate ? new Date(f.endDate) : null,
              capacity: f.capacity ? Number(f.capacity) : null,
              minLessonPercent: Number(f.minLessonPercent),
            });
          }}
        >
          <Input
            label="Naam"
            value={f.name}
            onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Status</span>
              <select
                className={fieldClasses}
                value={f.status}
                onChange={(e) =>
                  setF((x) => ({
                    ...x,
                    status: e.target.value as CohortStatus,
                  }))
                }
              >
                {Object.entries(COHORT_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Max. deelnemers"
              type="number"
              min={1}
              value={f.capacity}
              onChange={(e) =>
                setF((x) => ({ ...x, capacity: e.target.value }))
              }
              placeholder="Onbeperkt"
            />
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Startdatum</span>
              <input
                type="date"
                className={fieldClasses}
                value={f.startDate}
                onChange={(e) =>
                  setF((x) => ({ ...x, startDate: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Einddatum</span>
              <input
                type="date"
                className={fieldClasses}
                value={f.endDate}
                onChange={(e) =>
                  setF((x) => ({ ...x, endDate: e.target.value }))
                }
              />
            </label>
            <Input
              label="Afronden vanaf (% lessen)"
              type="number"
              min={0}
              max={100}
              value={f.minLessonPercent}
              onChange={(e) =>
                setF((x) => ({ ...x, minLessonPercent: e.target.value }))
              }
            />
          </div>
          {update.error && (
            <p className="text-body-sm text-error">{update.error.message}</p>
          )}
          <Button
            type="submit"
            className="self-start"
            disabled={update.isPending}
          >
            {update.isPending ? (
              <Spinner size="sm" />
            ) : saved ? (
              "Opgeslagen ✓"
            ) : (
              "Opslaan"
            )}
          </Button>
        </form>
      </section>

      {/* Uitnodigingscode */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Uitnodigingscode</h2>
        <p className="text-body-sm text-secondary">
          Cursisten vullen deze code in op de pagina Leertraject om deel te
          nemen.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="bg-surface-container-low text-title-md text-on-surface rounded-xl px-4 py-3 font-mono tracking-widest">
            {code || "—"}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(code).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            disabled={!code}
          >
            <Copy size={16} /> {copied ? "Gekopieerd" : "Kopieer"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={regen.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "Nieuwe code genereren? De oude code werkt dan niet meer.",
                )
              )
                regen.mutate({ id: cohort.id });
            }}
          >
            <RefreshCw size={16} /> Nieuwe code
          </Button>
        </div>
      </section>

      {/* Docenten */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">
          Docenten en managers
        </h2>
        {staff.length === 0 ? (
          <p className="text-body-md text-secondary">
            Nog geen docent gekoppeld.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">{staff.map(memberRow)}</ul>
        )}
      </section>

      {/* Cursisten */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">
          Cursisten en alumni ({others.length})
        </h2>
        {others.length === 0 ? (
          <p className="text-body-md text-secondary">
            Nog geen cursisten. Voeg ze toe met e-mail of deel de
            uitnodigingscode.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">{others.map(memberRow)}</ul>
        )}
      </section>

      {/* Toevoegen */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Persoon toevoegen</h2>
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            memberAdd.mutate({
              cohortId: cohort.id,
              email: add.email,
              ...(add.naam.trim() ? { naam: add.naam.trim() } : {}),
              role: add.role,
            });
          }}
        >
          <Input
            label="Naam (bij nieuw account)"
            value={add.naam}
            onChange={(e) => setAdd((a) => ({ ...a, naam: e.target.value }))}
            placeholder="Voor- en achternaam"
          />
          <Input
            label="E-mailadres"
            type="email"
            value={add.email}
            onChange={(e) => setAdd((a) => ({ ...a, email: e.target.value }))}
            placeholder="naam@bedrijf.nl"
            required
          />
          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Rol</span>
            <select
              className={cn(fieldClasses, "w-auto")}
              value={add.role}
              onChange={(e) =>
                setAdd((a) => ({ ...a, role: e.target.value as Role }))
              }
            >
              {Object.entries(COHORT_ROLE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="submit"
            className="h-[50px]"
            disabled={memberAdd.isPending || !add.email}
          >
            {memberAdd.isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                <UserPlus size={18} /> Toevoegen
              </>
            )}
          </Button>
        </form>
        {memberAdd.error && (
          <p className="text-body-sm text-error">{memberAdd.error.message}</p>
        )}
        {memberAdd.data?.invited && (
          <p className="text-body-sm text-on-surface">
            Account aangemaakt en uitnodiging verstuurd.
          </p>
        )}
        <p className="text-body-sm text-secondary">
          Heeft de persoon nog geen account? Dan maken we het aan en sturen we
          een uitnodiging om zelf een wachtwoord te kiezen (7 dagen geldig).
        </p>
      </section>

      {/* Meerdere tegelijk */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">
          Meerdere personen tegelijk
        </h2>
        <p className="text-body-sm text-secondary">
          Plak adressen uit een mail of spreadsheet, gescheiden door komma,
          spatie of regel.
        </p>
        <label className="text-body-md text-on-surface flex items-center gap-2">
          <input
            type="checkbox"
            checked={invite}
            onChange={(e) => setInvite(e.target.checked)}
          />
          Nodig personen zonder account uit per e-mail
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Rol</span>
          <select
            className={cn(fieldClasses, "w-auto")}
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value as Role)}
          >
            {Object.entries(COHORT_ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <textarea
          className={cn(fieldClasses, "min-h-28")}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder="sara@bedrijf.nl, jan@bedrijf.nl, ..."
        />
        <Button
          type="button"
          disabled={memberImport.isPending || !bulk.trim()}
          onClick={() =>
            memberImport.mutate({
              cohortId: cohort.id,
              emails: bulk,
              invite,
              role: bulkRole,
            })
          }
        >
          {memberImport.isPending ? <Spinner size="sm" /> : "Importeren"}
        </Button>
        {memberImport.error && (
          <p className="text-body-sm text-error">
            {memberImport.error.message}
          </p>
        )}
        {memberImport.data && (
          <div className="text-body-sm text-on-surface flex flex-col gap-1">
            <p>
              {memberImport.data.added} toegevoegd
              {memberImport.data.invited > 0 &&
                `, ${memberImport.data.invited} uitgenodigd`}
              , {memberImport.data.alreadyMember} zaten er al in.
            </p>
            {memberImport.data.notFound.length > 0 && (
              <p className="text-error">
                {invite
                  ? "Uitnodigen mislukt voor"
                  : "Geen account gevonden voor"}
                : {memberImport.data.notFound.join(", ")}.{" "}
                {invite
                  ? "Probeer het later opnieuw."
                  : "Zet het vinkje voor uitnodigen aan, of deel de uitnodigingscode."}
              </p>
            )}
            {memberImport.data.truncated && (
              <p className="text-secondary">
                Alleen de eerste 200 adressen zijn verwerkt.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
