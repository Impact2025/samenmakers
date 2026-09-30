"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import {
  FileUpload,
  type UploadedFile,
} from "@/components/learning/file-upload";
import { formatDate } from "@/lib/date-utils";

type Material = inferRouterOutputs<AppRouter>["materials"]["list"][number];

export function MaterialsPanel({
  cohortId,
  materials,
  sessions,
}: {
  cohortId: string;
  materials: Material[];
  sessions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const add = trpc.materials.add.useMutation({
    onSuccess: () => {
      setTitle("");
      setSessionId("");
      setFile(null);
      router.refresh();
    },
  });
  const remove = trpc.materials.remove.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="bg-surface-container-low grid gap-4 rounded-2xl p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!file) return;
          add.mutate({
            cohortId,
            title,
            sessionId: sessionId || undefined,
            url: file.url,
            fileName: file.name,
            mimeType: file.mimeType,
            sizeBytes: file.size,
          });
        }}
      >
        <h2 className="text-title-md text-on-surface sm:col-span-2">
          Materiaal toevoegen
        </h2>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Titel</span>
          <input
            required
            className={fieldClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Slides Impactmodel"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Bij sessie</span>
          <select
            className={fieldClasses}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          >
            <option value="">Geen sessie</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <FileUpload
            cohortId={cohortId}
            label={file ? "Ander bestand kiezen" : "Bestand kiezen"}
            onUploaded={setFile}
          />
          {file && (
            <p className="text-body-sm text-on-surface flex items-center gap-2">
              <FileText size={14} /> {file.name}
            </p>
          )}
        </div>
        {add.error && (
          <p role="alert" className="text-body-sm text-error sm:col-span-2">
            {add.error.message}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={add.isPending || !file}>
            {add.isPending ? "Bezig..." : "Toevoegen"}
          </Button>
        </div>
      </form>

      {materials.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title="Nog geen materiaal"
          description="Upload presentaties en literatuur na de sessie."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {materials.map((m) => (
            <li
              key={m.id}
              className="bg-surface-container-lowest shadow-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div className="min-w-0">
                <a
                  href={`/api/bestanden/materiaal/${m.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-label-lg text-primary-container inline-flex items-center gap-1.5"
                >
                  <FileText size={14} /> {m.title}
                </a>
                <p className="text-body-sm text-secondary">
                  {m.sessionTitle ? `${m.sessionTitle} · ` : ""}
                  {m.fileName} · {formatDate(m.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`"${m.title}" verwijderen?`))
                    remove.mutate({ cohortId, materialId: m.id });
                }}
              >
                <Trash2 size={14} /> Verwijderen
              </Button>
            </li>
          ))}
        </ul>
      )}
      {remove.error && (
        <p role="alert" className="text-body-sm text-error">
          {remove.error.message}
        </p>
      )}
    </div>
  );
}
