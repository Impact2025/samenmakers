"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  cohortId: string;
  lessonId: string;
  initialStatus: "open" | "bezig" | "klaar";
  initialNote: string;
  isReflection: boolean;
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
}

export function LessonActions({
  cohortId,
  lessonId,
  initialStatus,
  initialNote,
  isReflection,
  prev,
  next,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);

  const start = trpc.learning.startLesson.useMutation();
  const setLessonStatus = trpc.learning.setLessonStatus.useMutation({
    onSuccess: (res) => {
      setStatus(res.status);
      router.refresh();
    },
  });
  const saveNote = trpc.learning.saveNote.useMutation({
    onSuccess: (_d, vars) => setSavedNote(vars.note),
  });

  // Opening a lesson moves it from "open" to "bezig" once.
  const started = useRef(false);
  useEffect(() => {
    if (initialStatus === "open" && !started.current) {
      started.current = true;
      start.mutate({ cohortId, lessonId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId, lessonId, initialStatus]);

  // Autosave the note 1s after typing stops.
  useEffect(() => {
    if (note === savedNote) return;
    const t = setTimeout(
      () => saveNote.mutate({ cohortId, lessonId, note }),
      1000,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const done = status === "klaar";

  async function completeAndContinue() {
    await setLessonStatus.mutateAsync({ cohortId, lessonId, done: true });
    if (next) router.push(`/leren/${cohortId}/les/${next.id}`);
  }

  return (
    <div className="border-hairline space-y-8 border-t pt-8">
      <div className="space-y-2">
        <Textarea
          label={
            isReflection
              ? "JOUW ANTWOORD (ALLEEN VOOR JOU)"
              : "MIJN NOTITIES (ALLEEN VOOR JOU)"
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={isReflection ? 6 : 4}
          placeholder={
            isReflection
              ? "Schrijf je reflectie…"
              : "Wat neem je mee uit deze les?"
          }
          maxLength={10_000}
        />
        <p className="text-body-md text-secondary" aria-live="polite">
          {saveNote.isPending
            ? "Opslaan…"
            : note !== savedNote
              ? "Niet opgeslagen"
              : savedNote
                ? "Opgeslagen"
                : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {done ? (
          <>
            <span className="text-label-md text-primary inline-flex items-center gap-2">
              <CircleCheck size={16} /> Les afgerond
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={setLessonStatus.isPending}
              onClick={() =>
                setLessonStatus.mutate({ cohortId, lessonId, done: false })
              }
            >
              Markeer als niet klaar
            </Button>
          </>
        ) : (
          <Button
            onClick={() => void completeAndContinue()}
            disabled={setLessonStatus.isPending}
          >
            {setLessonStatus.isPending ? (
              <Spinner size="sm" />
            ) : next ? (
              "Afronden en verder"
            ) : (
              "Les afronden"
            )}
          </Button>
        )}
        {setLessonStatus.error && (
          <p className="text-body-md text-error">
            {setLessonStatus.error.message}
          </p>
        )}
      </div>

      <nav
        className="border-hairline grid grid-cols-2 gap-4 border-t pt-6"
        aria-label="Lesnavigatie"
      >
        <div>
          {prev && (
            <Link
              href={`/leren/${cohortId}/les/${prev.id}`}
              className="group block"
            >
              <span className="text-label-md text-secondary flex items-center gap-2">
                <ArrowLeft size={12} /> Vorige
              </span>
              <span className="text-body-md text-on-surface mt-1 block group-hover:underline">
                {prev.title}
              </span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next ? (
            <Link
              href={`/leren/${cohortId}/les/${next.id}`}
              className="group block"
            >
              <span className="text-label-md text-secondary flex items-center justify-end gap-2">
                Volgende <ArrowRight size={12} />
              </span>
              <span className="text-body-md text-on-surface mt-1 block group-hover:underline">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href={`/leren/${cohortId}`}
              className="text-label-md text-primary underline underline-offset-4"
            >
              Terug naar leerpad
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
