"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { LessonIcon } from "@/components/learning/lesson-icon";
import { COHORT_STATUS_LABELS, LESSON_TYPE_LABELS } from "@/lib/learning";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Program = inferRouterOutputs<AppRouter>["programs"]["byId"];

const card =
  "flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-card";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30";

export function ProgramEditor({ program }: { program: Program }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  // ---- instellingen ----
  const [form, setForm] = useState({
    name: program.name,
    tagline: program.tagline ?? "",
    description: program.description ?? "",
    color: program.color,
    status: program.status,
    admissionMode: program.admissionMode,
  });
  const [saved, setSaved] = useState(false);
  const update = trpc.programs.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refresh();
    },
  });

  // ---- curriculum ----
  const [newModule, setNewModule] = useState("");
  const moduleCreate = trpc.programs.moduleCreate.useMutation({
    onSuccess: () => {
      setNewModule("");
      refresh();
    },
  });
  const moduleDelete = trpc.programs.moduleDelete.useMutation({
    onSuccess: refresh,
  });
  const moduleMove = trpc.programs.moduleMove.useMutation({
    onSuccess: refresh,
  });
  const lessonCreate = trpc.programs.lessonCreate.useMutation({
    onSuccess: refresh,
  });
  const lessonDelete = trpc.programs.lessonDelete.useMutation({
    onSuccess: refresh,
  });
  const lessonMove = trpc.programs.lessonMove.useMutation({
    onSuccess: refresh,
  });
  const [lessonDraft, setLessonDraft] = useState<
    Record<string, { title: string; type: string }>
  >({});

  // ---- edities ----
  const [cohort, setCohort] = useState({ name: "", startDate: "" });
  const cohortCreate = trpc.programs.cohortCreate.useMutation({
    onSuccess: (c) =>
      router.push(`/admin/programmas/${program.id}/editie/${c.id}`),
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span
          className="h-10 w-2 rounded-full"
          style={{ backgroundColor: form.color }}
        />
        <div>
          <h1 className="text-headline-lg text-on-surface">{program.name}</h1>
          <p className="text-body-sm text-secondary">
            /{program.slug} · {program.modules.length} modules ·{" "}
            {program.modules.reduce((n, m) => n + m.lessons.length, 0)} lessen
          </p>
        </div>
      </header>

      {/* Instellingen */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Instellingen</h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({
              id: program.id,
              name: form.name,
              tagline: form.tagline,
              description: form.description,
              color: form.color,
              status: form.status,
              admissionMode: form.admissionMode,
            });
          }}
        >
          <Input
            label="Naam"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Ondertitel"
            value={form.tagline}
            onChange={(e) =>
              setForm((f) => ({ ...f, tagline: e.target.value }))
            }
          />
          <Textarea
            label="Beschrijving"
            value={form.description}
            rows={4}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Kleur</span>
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
                className="bg-surface-container-low h-[50px] w-full cursor-pointer rounded-xl p-1"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Status</span>
              <select
                className={fieldClasses}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as typeof f.status,
                  }))
                }
              >
                <option value="concept">Concept</option>
                <option value="gepubliceerd">Gepubliceerd</option>
                <option value="gearchiveerd">Gearchiveerd</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Toelating</span>
              <select
                className={fieldClasses}
                value={form.admissionMode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    admissionMode: e.target.value as typeof f.admissionMode,
                  }))
                }
              >
                <option value="open">Open</option>
                <option value="uitnodiging">Op uitnodiging</option>
                <option value="aanmelding">Op aanmelding</option>
              </select>
            </label>
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
              "Opgeslagen"
            ) : (
              "Opslaan"
            )}
          </Button>
        </form>
      </section>

      {/* Curriculum */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Curriculum</h2>
        {program.modules.length === 0 && (
          <p className="text-body-md text-secondary">
            Nog geen modules. Voeg hieronder de eerste toe.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {program.modules.map((mod, mi) => {
            const draft = lessonDraft[mod.id] ?? { title: "", type: "tekst" };
            return (
              <div
                key={mod.id}
                className="bg-surface-container-low rounded-2xl p-3"
              >
                <div className="flex items-center gap-2 px-1">
                  <span className="text-label-sm text-primary-container uppercase">
                    Module {mi + 1}
                  </span>
                  <h3 className="text-title-md text-on-surface min-w-0 flex-1 truncate">
                    {mod.title}
                  </h3>
                  <button
                    className={iconBtn}
                    aria-label="Omhoog"
                    disabled={mi === 0 || moduleMove.isPending}
                    onClick={() =>
                      moduleMove.mutate({ id: mod.id, direction: "up" })
                    }
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className={iconBtn}
                    aria-label="Omlaag"
                    disabled={
                      mi === program.modules.length - 1 || moduleMove.isPending
                    }
                    onClick={() =>
                      moduleMove.mutate({ id: mod.id, direction: "down" })
                    }
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className={cn(iconBtn, "hover:text-error")}
                    aria-label="Module verwijderen"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Module "${mod.title}" en alle lessen verwijderen?`,
                        )
                      )
                        moduleDelete.mutate({ id: mod.id });
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <ul className="mt-2 flex flex-col gap-1">
                  {mod.lessons.map((l, li) => (
                    <li
                      key={l.id}
                      className="bg-surface-container-lowest flex items-center gap-1 rounded-xl pr-1"
                    >
                      <Link
                        href={`/admin/programmas/${program.id}/les/${l.id}`}
                        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5"
                      >
                        <span className="text-secondary">
                          <LessonIcon type={l.type} size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-label-lg text-on-surface block truncate">
                            {l.title}
                          </span>
                          <span className="text-body-sm text-secondary">
                            {LESSON_TYPE_LABELS[l.type]}
                            {l.durationMinutes
                              ? ` · ${l.durationMinutes} min`
                              : ""}
                            {!l.isRequired ? " · optioneel" : ""}
                          </span>
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-secondary shrink-0"
                        />
                      </Link>
                      <button
                        className={iconBtn}
                        aria-label="Omhoog"
                        disabled={li === 0 || lessonMove.isPending}
                        onClick={() =>
                          lessonMove.mutate({ id: l.id, direction: "up" })
                        }
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className={iconBtn}
                        aria-label="Omlaag"
                        disabled={
                          li === mod.lessons.length - 1 || lessonMove.isPending
                        }
                        onClick={() =>
                          lessonMove.mutate({ id: l.id, direction: "down" })
                        }
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        className={cn(iconBtn, "hover:text-error")}
                        aria-label="Les verwijderen"
                        onClick={() => {
                          if (window.confirm(`Les "${l.title}" verwijderen?`))
                            lessonDelete.mutate({ id: l.id });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>

                <form
                  className="mt-2 flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.title.trim()) return;
                    lessonCreate.mutate(
                      {
                        moduleId: mod.id,
                        title: draft.title.trim(),
                        type: draft.type as "tekst",
                      },
                      {
                        onSuccess: () =>
                          setLessonDraft((d) => ({
                            ...d,
                            [mod.id]: { title: "", type: draft.type },
                          })),
                      },
                    );
                  }}
                >
                  <input
                    aria-label="Titel nieuwe les"
                    placeholder="Nieuwe les…"
                    value={draft.title}
                    onChange={(e) =>
                      setLessonDraft((d) => ({
                        ...d,
                        [mod.id]: { ...draft, title: e.target.value },
                      }))
                    }
                    className={cn(
                      fieldClasses,
                      "bg-surface-container-lowest h-11 min-w-0 flex-1",
                    )}
                  />
                  <select
                    aria-label="Type"
                    value={draft.type}
                    onChange={(e) =>
                      setLessonDraft((d) => ({
                        ...d,
                        [mod.id]: { ...draft, type: e.target.value },
                      }))
                    }
                    className={cn(
                      fieldClasses,
                      "bg-surface-container-lowest h-11 w-auto",
                    )}
                  >
                    {Object.entries(LESSON_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="submit"
                    size="md"
                    variant="tonal"
                    disabled={!draft.title.trim() || lessonCreate.isPending}
                  >
                    <Plus size={16} /> Les
                  </Button>
                </form>
              </div>
            );
          })}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newModule.trim())
              moduleCreate.mutate({
                programId: program.id,
                title: newModule.trim(),
              });
          }}
        >
          <input
            aria-label="Titel nieuwe module"
            placeholder="Nieuwe module…"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            className={cn(fieldClasses, "flex-1")}
          />
          <Button
            type="submit"
            disabled={!newModule.trim() || moduleCreate.isPending}
          >
            <Plus size={18} /> Module
          </Button>
        </form>
      </section>

      {/* Edities */}
      <section className={card}>
        <h2 className="text-headline-sm text-on-surface">Edities</h2>
        {program.cohorts.length === 0 ? (
          <p className="text-body-md text-secondary">
            Nog geen edities. Maak er hieronder een aan om cursisten en docenten
            toe te voegen.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {program.cohorts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/programmas/${program.id}/editie/${c.id}`}
                  className="bg-surface-container-low hover:bg-surface-container flex items-center gap-3 rounded-xl p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-title-md text-on-surface truncate">
                      {c.name}
                    </p>
                    <p className="text-body-sm text-secondary">
                      {COHORT_STATUS_LABELS[c.status]} · {c.learnerCount}{" "}
                      cursisten · {c.staffCount} docenten/managers
                      {c.startDate ? ` · start ${formatDate(c.startDate)}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-secondary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            cohortCreate.mutate({
              programId: program.id,
              name: cohort.name.trim(),
              ...(cohort.startDate
                ? { startDate: new Date(cohort.startDate) }
                : {}),
            });
          }}
        >
          <Input
            label="Nieuwe editie"
            value={cohort.name}
            onChange={(e) => setCohort((c) => ({ ...c, name: e.target.value }))}
            placeholder="Cohort najaar 2026"
          />
          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Startdatum</span>
            <input
              type="date"
              className={fieldClasses}
              value={cohort.startDate}
              onChange={(e) =>
                setCohort((c) => ({ ...c, startDate: e.target.value }))
              }
            />
          </label>
          <Button
            type="submit"
            className="h-[50px]"
            disabled={cohort.name.trim().length < 2 || cohortCreate.isPending}
          >
            {cohortCreate.isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Plus size={18} /> Editie
              </>
            )}
          </Button>
        </form>
        {cohortCreate.error && (
          <p className="text-body-sm text-error">
            {cohortCreate.error.message}
          </p>
        )}
      </section>
    </div>
  );
}
