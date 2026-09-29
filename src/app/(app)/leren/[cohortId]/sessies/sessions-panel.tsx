"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Trash2, Users, Video } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fieldClasses,
  labelClasses,
  textareaClasses,
} from "@/components/ui/field-styles";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { PHASE_LABEL } from "@/lib/session-cycle";
import { cn } from "@/lib/utils";

type Session = inferRouterOutputs<AppRouter>["sessions"]["list"][number];
type Status = "aanwezig" | "afwezig" | "geoorloofd";

const STATUS_LABEL: Record<Status, string> = {
  aanwezig: "Aanwezig",
  afwezig: "Afwezig",
  geoorloofd: "Geoorloofd",
};

export function SessionsPanel({
  cohortId,
  canPlan,
  canSeeAttendance,
  sessions,
}: {
  cohortId: string;
  canPlan: boolean;
  canSeeAttendance: boolean;
  sessions: Session[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const remove = trpc.sessions.remove.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-6">
      {canPlan && <NewSession cohortId={cohortId} />}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="Nog geen sessies"
          description="Zodra de facilitator programmadagen inplant, zie je ze hier."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="bg-surface-container-lowest shadow-card rounded-2xl p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-title-md text-on-surface">{s.title}</h2>
                  <p className="text-body-sm text-secondary">
                    {formatDateTime(s.startsAt)}
                    {s.location ? ` · ${s.location}` : ""}
                  </p>
                </div>
                <Badge variant={s.phase === "afgerond" ? "default" : "primary"}>
                  {PHASE_LABEL[s.phase]}
                </Badge>
              </div>

              {s.description && (
                <p className="text-body-md text-secondary mt-2">
                  {s.description}
                </p>
              )}

              <dl className="text-body-sm mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-secondary">Docent</dt>
                  <dd className="text-on-surface">
                    {s.teacher?.naam ?? "Nog niet gekoppeld"}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-secondary">Huiswerk uiterlijk</dt>
                  <dd className="text-on-surface">
                    {formatDate(s.homeworkDueAt)}
                  </dd>
                </div>
                {canPlan && (
                  <>
                    <div className="flex gap-2">
                      <dt className="text-secondary">Briefing</dt>
                      <dd className="text-on-surface">
                        {s.briefingSentAt
                          ? `verstuurd ${formatDate(s.briefingSentAt)}`
                          : "nog niet verstuurd"}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-secondary">Huiswerkmail</dt>
                      <dd className="text-on-surface">
                        {s.homeworkMailSentAt
                          ? `verstuurd ${formatDate(s.homeworkMailSentAt)}`
                          : "nog niet verstuurd"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.meetingUrl && (
                  <a
                    href={s.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-label-md text-primary-container inline-flex items-center gap-1.5"
                  >
                    <Video size={14} /> Deelnemen online
                  </a>
                )}
                {canSeeAttendance && (
                  <Button
                    variant="tonal"
                    size="sm"
                    onClick={() => setOpenId(openId === s.id ? null : s.id)}
                  >
                    <Users size={14} /> Aanwezigheid
                  </Button>
                )}
                {canPlan && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Sessie "${s.title}" verwijderen?`))
                        remove.mutate({ cohortId, sessionId: s.id });
                    }}
                  >
                    <Trash2 size={14} /> Verwijderen
                  </Button>
                )}
              </div>

              {openId === s.id && (
                <Attendance
                  cohortId={cohortId}
                  sessionId={s.id}
                  canMark={canPlan}
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Attendance({
  cohortId,
  sessionId,
  canMark,
}: {
  cohortId: string;
  sessionId: string;
  canMark: boolean;
}) {
  const utils = trpc.useUtils();
  const list = trpc.sessions.attendance.useQuery({ cohortId, sessionId });
  const mark = trpc.sessions.markAttendance.useMutation({
    onSuccess: () =>
      utils.sessions.attendance.invalidate({ cohortId, sessionId }),
  });

  if (list.isLoading)
    return <p className="text-body-sm text-secondary mt-4">Laden...</p>;
  if (!list.data?.length)
    return (
      <p className="text-body-sm text-secondary mt-4">
        Er zijn nog geen cursisten in deze editie.
      </p>
    );

  const present = list.data.filter((l) => l.status === "aanwezig").length;
  return (
    <div className="border-surface-container mt-4 border-t pt-3">
      <p className="text-label-md text-secondary mb-2">
        {present} van {list.data.length} aanwezig
      </p>
      <ul className="flex flex-col gap-1">
        {list.data.map((l) => (
          <li
            key={l.userId}
            className="flex flex-wrap items-center justify-between gap-2 py-1"
          >
            <span className="flex items-center gap-2">
              <Avatar src={l.avatarUrl} naam={l.naam} size="xs" />
              <span className="text-label-lg text-on-surface">{l.naam}</span>
            </span>
            {canMark ? (
              <span
                className="flex gap-1"
                role="group"
                aria-label={`Aanwezigheid ${l.naam}`}
              >
                {(Object.keys(STATUS_LABEL) as Status[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={mark.isPending}
                    aria-pressed={l.status === st}
                    onClick={() =>
                      mark.mutate({
                        cohortId,
                        sessionId,
                        userId: l.userId,
                        status: st,
                      })
                    }
                    className={cn(
                      "text-label-sm rounded-full px-3 py-1.5 transition-colors",
                      l.status === st
                        ? st === "aanwezig"
                          ? "bg-tertiary text-on-tertiary"
                          : "bg-primary-container text-on-primary"
                        : "bg-surface-container text-secondary hover:bg-surface-container-high",
                    )}
                  >
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </span>
            ) : (
              <span className="text-label-md text-secondary">
                {l.status ? STATUS_LABEL[l.status] : "Nog niet geregistreerd"}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewSession({ cohortId }: { cohortId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    startsAt: "",
    teacherEmail: "",
    location: "",
    meetingUrl: "",
    description: "",
  });
  const create = trpc.sessions.create.useMutation({
    onSuccess: () => {
      setForm({
        title: "",
        startsAt: "",
        teacherEmail: "",
        location: "",
        meetingUrl: "",
        description: "",
      });
      router.refresh();
    },
  });
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="bg-surface-container-low grid gap-4 rounded-2xl p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({
          cohortId,
          title: form.title,
          startsAt: new Date(form.startsAt),
          teacherEmail: form.teacherEmail,
          location: form.location || undefined,
          meetingUrl: form.meetingUrl,
          description: form.description || undefined,
        });
      }}
    >
      <h2 className="text-title-md text-on-surface sm:col-span-2">
        Sessie inplannen
      </h2>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Titel</span>
        <input
          required
          className={fieldClasses}
          value={form.title}
          onChange={set("title")}
          placeholder="Programmadag 3: Impactmodel"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Start</span>
        <input
          required
          type="datetime-local"
          className={fieldClasses}
          value={form.startsAt}
          onChange={set("startsAt")}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>E-mailadres docent (optioneel)</span>
        <input
          type="email"
          className={fieldClasses}
          value={form.teacherEmail}
          onChange={set("teacherEmail")}
          placeholder="docent@voorbeeld.nl"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Locatie</span>
        <input
          className={fieldClasses}
          value={form.location}
          onChange={set("location")}
        />
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClasses}>Videolink (optioneel)</span>
        <input
          type="url"
          className={fieldClasses}
          value={form.meetingUrl}
          onChange={set("meetingUrl")}
          placeholder="https://"
        />
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClasses}>Omschrijving (optioneel)</span>
        <textarea
          rows={3}
          className={textareaClasses}
          value={form.description}
          onChange={set("description")}
        />
      </label>
      <p className="text-body-sm text-secondary sm:col-span-2">
        De docent krijgt automatisch toegang vanaf 2 weken voor tot 2 weken na
        de sessie. Het huiswerk moet 3 dagen voor de sessie binnen zijn.
      </p>
      {create.error && (
        <p role="alert" className="text-body-sm text-error sm:col-span-2">
          {create.error.message}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Bezig..." : "Sessie toevoegen"}
        </Button>
      </div>
    </form>
  );
}
