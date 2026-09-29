"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FileText, X } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fieldClasses,
  labelClasses,
  textareaClasses,
} from "@/components/ui/field-styles";
import {
  FileUpload,
  type UploadedFile,
} from "@/components/learning/file-upload";
import { formatDateTime } from "@/lib/date-utils";

type Assignment = inferRouterOutputs<AppRouter>["assignments"]["list"][number];

export function AssignmentsPanel({
  cohortId,
  isStaff,
  canLearn,
  assignments,
  sessions,
}: {
  cohortId: string;
  isStaff: boolean;
  canLearn: boolean;
  assignments: Assignment[];
  sessions: { id: string; title: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {isStaff && <NewAssignment cohortId={cohortId} sessions={sessions} />}
      {assignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={22} />}
          title="Nog geen opdrachten"
          description="Opdrachten verschijnen hier zodra ze zijn klaargezet."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="bg-surface-container-lowest shadow-card rounded-2xl p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-title-md text-on-surface">{a.title}</h2>
                  <p className="text-body-sm text-secondary">
                    {a.sessionTitle ? `${a.sessionTitle} · ` : ""}
                    {a.dueAt
                      ? `uiterlijk ${formatDateTime(a.dueAt)}`
                      : "geen deadline"}
                  </p>
                </div>
                {isStaff ? (
                  <Badge variant="primary">
                    {a.submittedCount} van {a.learnerCount} ingeleverd
                  </Badge>
                ) : (
                  <StatusBadge mine={a.mine} />
                )}
              </div>
              {a.description && (
                <p className="text-body-md text-secondary mt-2 whitespace-pre-line">
                  {a.description}
                </p>
              )}
              {isStaff ? (
                <Submissions cohortId={cohortId} assignmentId={a.id} />
              ) : canLearn ? (
                <Submit cohortId={cohortId} assignment={a} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ mine }: { mine: Assignment["mine"] }) {
  if (!mine) return <Badge variant="default">Nog te doen</Badge>;
  if (mine.status === "beoordeeld")
    return <Badge variant="tertiary">Beoordeeld</Badge>;
  return (
    <Badge variant={mine.isLate ? "error" : "secondary"}>
      {mine.isLate ? "Te laat ingeleverd" : "Ingeleverd"}
    </Badge>
  );
}

function FileList({
  files,
}: {
  files: { id: string; url: string; name: string }[];
}) {
  if (files.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {files.map((f) => (
        <li key={f.id}>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-md text-primary-container inline-flex items-center gap-1.5"
          >
            <FileText size={14} /> {f.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Submit({
  cohortId,
  assignment,
}: {
  cohortId: string;
  assignment: Assignment;
}) {
  const router = useRouter();
  const mine = assignment.mine;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(mine?.text ?? "");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const submit = trpc.assignments.submit.useMutation({
    onSuccess: () => {
      setOpen(false);
      setFiles([]);
      router.refresh();
    },
  });

  return (
    <div className="border-surface-container mt-4 border-t pt-3">
      {mine && (
        <div className="text-body-sm mb-3">
          <p className="text-secondary">
            Ingeleverd op {formatDateTime(mine.submittedAt)}
          </p>
          {mine.text && (
            <p className="text-on-surface mt-1 whitespace-pre-line">
              {mine.text}
            </p>
          )}
          <FileList files={mine.files} />
          {mine.feedback && (
            <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant mt-3 rounded-xl p-3">
              <p className="text-label-md">Feedback van je docent</p>
              <p className="mt-1 whitespace-pre-line">{mine.feedback}</p>
            </div>
          )}
        </div>
      )}

      {!open ? (
        <Button
          variant={mine ? "secondary" : "primary"}
          size="sm"
          onClick={() => setOpen(true)}
        >
          {mine ? "Opnieuw inleveren" : "Inleveren"}
        </Button>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate({
              cohortId,
              assignmentId: assignment.id,
              text: text || undefined,
              files: files.map((f) => ({
                url: f.url,
                name: f.name,
                sizeBytes: f.size,
                mimeType: f.mimeType,
              })),
            });
          }}
        >
          {mine && (
            <p className="text-body-sm text-secondary">
              Opnieuw inleveren vervangt je vorige inlevering en je feedback
              vervalt tot je docent opnieuw kijkt.
            </p>
          )}
          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Toelichting</span>
            <textarea
              rows={4}
              className={textareaClasses}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <ul className="flex flex-col gap-1">
            {files.map((f) => (
              <li
                key={f.url}
                className="text-body-sm text-on-surface flex items-center gap-2"
              >
                <FileText size={14} /> {f.name}
                <button
                  type="button"
                  aria-label={`${f.name} verwijderen`}
                  onClick={() =>
                    setFiles((all) => all.filter((x) => x.url !== f.url))
                  }
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <FileUpload
            cohortId={cohortId}
            label="Foto of bestand toevoegen"
            disabled={files.length >= 10}
            onUploaded={(f) => setFiles((all) => [...all, f])}
          />
          {submit.error && (
            <p role="alert" className="text-body-sm text-error">
              {submit.error.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submit.isPending}>
              {submit.isPending ? "Bezig..." : "Inleveren"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Annuleren
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Submissions({
  cohortId,
  assignmentId,
}: {
  cohortId: string;
  assignmentId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <Button variant="tonal" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Inleveringen verbergen" : "Inleveringen bekijken"}
      </Button>
      {open && (
        <SubmissionList cohortId={cohortId} assignmentId={assignmentId} />
      )}
    </div>
  );
}

function SubmissionList({
  cohortId,
  assignmentId,
}: {
  cohortId: string;
  assignmentId: string;
}) {
  const utils = trpc.useUtils();
  const q = trpc.assignments.submissions.useQuery({ cohortId, assignmentId });
  const review = trpc.assignments.review.useMutation({
    onSuccess: () => {
      void utils.assignments.submissions.invalidate({ cohortId, assignmentId });
      void utils.assignments.list.invalidate({ cohortId });
    },
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (q.isLoading)
    return <p className="text-body-sm text-secondary mt-3">Laden...</p>;
  if (!q.data) return null;

  return (
    <ul className="mt-3 flex flex-col gap-3">
      {q.data.rows.map((r) => (
        <li key={r.userId} className="bg-surface-container-low rounded-xl p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-label-lg text-on-surface">{r.naam}</span>
            {!r.submission ? (
              <Badge variant="default">Nog niet ingeleverd</Badge>
            ) : (
              <span className="flex items-center gap-2">
                {r.submission.isLate && <Badge variant="error">Te laat</Badge>}
                <Badge
                  variant={
                    r.submission.status === "beoordeeld"
                      ? "tertiary"
                      : "secondary"
                  }
                >
                  {r.submission.status === "beoordeeld"
                    ? "Beoordeeld"
                    : "Te beoordelen"}
                </Badge>
              </span>
            )}
          </div>
          {r.submission && (
            <div className="text-body-sm mt-2">
              <p className="text-secondary">
                {formatDateTime(r.submission.submittedAt)}
              </p>
              {r.submission.text && (
                <p className="text-on-surface mt-1 whitespace-pre-line">
                  {r.submission.text}
                </p>
              )}
              <FileList files={r.submission.files} />
              <form
                className="mt-3 flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const feedback =
                    drafts[r.submission!.id] ?? r.submission!.feedback ?? "";
                  if (feedback.trim())
                    review.mutate({
                      cohortId,
                      submissionId: r.submission!.id,
                      feedback,
                    });
                }}
              >
                <label className="flex flex-col gap-1">
                  <span className="text-label-md text-secondary">Feedback</span>
                  <textarea
                    rows={3}
                    className={textareaClasses}
                    value={
                      drafts[r.submission.id] ?? r.submission.feedback ?? ""
                    }
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [r.submission!.id]: e.target.value,
                      }))
                    }
                  />
                </label>
                <div>
                  <Button type="submit" size="sm" disabled={review.isPending}>
                    Feedback opslaan
                  </Button>
                </div>
              </form>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function NewAssignment({
  cohortId,
  sessions,
}: {
  cohortId: string;
  sessions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const empty = { title: "", description: "", sessionId: "", dueAt: "" };
  const [form, setForm] = useState(empty);
  const create = trpc.assignments.create.useMutation({
    onSuccess: () => {
      setForm(empty);
      router.refresh();
    },
  });
  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="bg-surface-container-low grid gap-4 rounded-2xl p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({
          cohortId,
          title: form.title,
          description: form.description || undefined,
          sessionId: form.sessionId || undefined,
          dueAt: form.dueAt ? new Date(form.dueAt) : undefined,
        });
      }}
    >
      <h2 className="text-title-md text-on-surface sm:col-span-2">
        Opdracht toevoegen
      </h2>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClasses}>Titel</span>
        <input
          required
          className={fieldClasses}
          value={form.title}
          onChange={set("title")}
          placeholder="Foto van je ingevulde Business Model Canvas"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Bij sessie</span>
        <select
          className={fieldClasses}
          value={form.sessionId}
          onChange={set("sessionId")}
        >
          <option value="">Geen sessie</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Eigen deadline (optioneel)</span>
        <input
          type="datetime-local"
          className={fieldClasses}
          value={form.dueAt}
          onChange={set("dueAt")}
        />
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClasses}>Omschrijving</span>
        <textarea
          rows={3}
          className={textareaClasses}
          value={form.description}
          onChange={set("description")}
        />
      </label>
      <p className="text-body-sm text-secondary sm:col-span-2">
        Zonder eigen deadline geldt de huiswerkdeadline van de sessie (3 dagen
        vooraf).
      </p>
      {create.error && (
        <p role="alert" className="text-body-sm text-error sm:col-span-2">
          {create.error.message}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Bezig..." : "Opdracht toevoegen"}
        </Button>
      </div>
    </form>
  );
}
