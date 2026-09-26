"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { LESSON_TYPE_LABELS } from "@/lib/learning";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Lesson = inferRouterOutputs<AppRouter>["programs"]["lessonById"];
type LessonType = "tekst" | "video" | "bestand" | "reflectie" | "live";

/** datetime-local verwacht "yyyy-MM-ddTHH:mm" in lokale tijd. */
function toLocalInput(iso: string | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LessonEditor({
  lesson,
  programId,
}: {
  lesson: Lesson;
  programId: string;
}) {
  const router = useRouter();
  const c = lesson.content;
  const [f, setF] = useState({
    title: lesson.title,
    type: lesson.type as LessonType,
    durationMinutes:
      lesson.durationMinutes != null ? String(lesson.durationMinutes) : "",
    isRequired: lesson.isRequired,
    body: c.body ?? "",
    videoUrl: c.videoUrl ?? "",
    fileUrl: c.fileUrl ?? "",
    fileName: c.fileName ?? "",
    prompt: c.prompt ?? "",
    meetingUrl: c.meetingUrl ?? "",
    startsAt: toLocalInput(c.startsAt),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((x) => ({ ...x, [k]: v }));

  const [saved, setSaved] = useState(false);
  const update = trpc.programs.lessonUpdate.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    },
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({
      id: lesson.id,
      title: f.title,
      type: f.type,
      isRequired: f.isRequired,
      durationMinutes:
        f.durationMinutes === "" ? null : Number(f.durationMinutes),
      content: {
        body: f.body,
        videoUrl: f.videoUrl,
        fileUrl: f.fileUrl,
        fileName: f.fileName,
        prompt: f.prompt,
        meetingUrl: f.meetingUrl,
        startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : "",
      },
    });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <h1 className="text-headline-lg text-on-surface">Les bewerken</h1>

      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <Input
          label="Titel"
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Type</span>
            <select
              className={fieldClasses}
              value={f.type}
              onChange={(e) => set("type", e.target.value as LessonType)}
            >
              {Object.entries(LESSON_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Duur (minuten)"
            type="number"
            min={0}
            value={f.durationMinutes}
            onChange={(e) => set("durationMinutes", e.target.value)}
          />
          <label className="flex items-end gap-2 pb-3">
            <input
              type="checkbox"
              checked={f.isRequired}
              onChange={(e) => set("isRequired", e.target.checked)}
              className="accent-primary-container h-5 w-5"
            />
            <span className="text-label-lg text-on-surface">Verplicht</span>
          </label>
        </div>
      </section>

      <section className="bg-surface-container-lowest shadow-card flex flex-col gap-4 rounded-2xl p-5">
        <h2 className="text-headline-sm text-on-surface">Inhoud</h2>

        {f.type === "video" && (
          <Input
            label="Video-URL (YouTube of Vimeo)"
            value={f.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        )}

        {f.type === "live" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClasses}>Starttijd</span>
              <input
                type="datetime-local"
                className={fieldClasses}
                value={f.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
              />
            </label>
            <Input
              label="Link (Teams/Zoom/Meet)"
              value={f.meetingUrl}
              onChange={(e) => set("meetingUrl", e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}

        {f.type === "bestand" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Bestands-URL"
              value={f.fileUrl}
              onChange={(e) => set("fileUrl", e.target.value)}
              placeholder="https://…"
            />
            <Input
              label="Bestandsnaam"
              value={f.fileName}
              onChange={(e) => set("fileName", e.target.value)}
              placeholder="Werkblad.pdf"
            />
          </div>
        )}

        {f.type === "reflectie" && (
          <Textarea
            label="Reflectievraag"
            rows={3}
            value={f.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            placeholder="Wat neem je mee uit deze module?"
          />
        )}

        <Textarea
          label={
            f.type === "tekst"
              ? "Tekst (Markdown)"
              : "Toelichting (Markdown, optioneel)"
          }
          rows={f.type === "tekst" ? 16 : 6}
          value={f.body}
          onChange={(e) => set("body", e.target.value)}
          hint="Ondersteunt koppen (##), lijsten, **vet**, *cursief* en links."
        />
      </section>

      {update.error && (
        <p className="text-body-sm text-error">{update.error.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={update.isPending}>
          {update.isPending ? (
            <Spinner size="sm" />
          ) : saved ? (
            "Opgeslagen ✓"
          ) : (
            "Opslaan"
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={() => router.push(`/admin/programmas/${programId}`)}
        >
          Terug naar programma
        </Button>
      </div>
    </form>
  );
}
