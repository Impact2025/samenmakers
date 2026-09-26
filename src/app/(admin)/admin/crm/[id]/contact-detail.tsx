"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date-utils";
import { STAGE_LABEL } from "../crm-contacts";

const STAGES = ["lead", "engaged", "customer", "churned"] as const;

const ACTIVITY_LABEL: Record<string, string> = {
  note: "Notitie",
  email: "E-mail",
  stage_change: "Fasewijziging",
  tag: "Tag",
  system: "Systeem",
};

export function ContactDetail({ id }: { id: string }) {
  const utils = trpc.useUtils();
  const q = trpc.crm.contact.useQuery({ id });
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("");

  const invalidate = () => void utils.crm.contact.invalidate({ id });

  const addNote = trpc.crm.addNote.useMutation({
    onSuccess: () => {
      setNote("");
      invalidate();
    },
  });
  const setStage = trpc.crm.setStage.useMutation({ onSuccess: invalidate });
  const addTag = trpc.crm.addTag.useMutation({
    onSuccess: () => {
      setTag("");
      invalidate();
    },
  });
  const removeTag = trpc.crm.removeTag.useMutation({ onSuccess: invalidate });

  if (q.isLoading)
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  if (!q.data)
    return <p className="text-secondary text-sm">Contact niet gevonden.</p>;

  const { user, activities, stats } = q.data;
  const naam = user.naam ?? user.name ?? "—";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/crm"
        className="text-secondary hover:text-on-surface text-xs"
      >
        ← Terug naar CRM
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: profile + activity */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-on-surface text-2xl font-extrabold">
                {naam}
              </h1>
              <p className="text-secondary text-sm">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.sector && (
                  <Badge variant="default" size="sm">
                    {user.sector}
                  </Badge>
                )}
                {user.regio && (
                  <Badge variant="default" size="sm">
                    {user.regio}
                  </Badge>
                )}
                {user.subscriptionStatus === "active" && (
                  <Badge variant="primary" size="sm">
                    Pro
                  </Badge>
                )}
              </div>
            </div>
            <Link
              href={`/admin/gebruikers`}
              className="text-primary text-xs hover:underline"
            >
              Beheer →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Matches", value: stats.matches },
              { label: "Posts", value: stats.posts },
              { label: "Events", value: stats.events },
            ].map((s) => (
              <Card key={s.label} hover={false}>
                <CardBody className="p-4">
                  <p className="text-secondary text-[10px] font-bold tracking-widest">
                    {s.label}
                  </p>
                  <p className="text-on-surface text-2xl font-extrabold">
                    {s.value}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Add note */}
          <Card hover={false}>
            <CardBody className="p-5">
              <h2 className="text-on-surface mb-3 text-[11px] font-bold tracking-widest uppercase">
                Notitie toevoegen
              </h2>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Interne notitie over dit contact…"
              />
              <div className="mt-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={addNote.isPending || note.trim().length === 0}
                  onClick={() =>
                    addNote.mutate({ contactId: id, content: note })
                  }
                >
                  {addNote.isPending ? <Spinner /> : "Notitie opslaan"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Activity timeline */}
          <Card hover={false}>
            <CardBody className="p-5">
              <h2 className="text-on-surface mb-4 text-[11px] font-bold tracking-widest uppercase">
                Tijdlijn
              </h2>
              {activities.length === 0 ? (
                <p className="text-secondary text-sm">Nog geen activiteit.</p>
              ) : (
                <ul className="space-y-4">
                  {activities.map((a) => (
                    <li key={a.id} className="border-hairline border-l-2 pl-4">
                      <div className="mb-0.5 flex items-center gap-2">
                        <Badge variant="default" size="sm">
                          {ACTIVITY_LABEL[a.type] ?? a.type}
                        </Badge>
                        <span className="text-secondary text-xs">
                          {formatDateTime(a.createdAt)}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm whitespace-pre-line">
                        {a.content}
                      </p>
                      {a.admin && (
                        <p className="text-secondary mt-0.5 text-xs">
                          — {a.admin.naam ?? a.admin.name}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: stage + tags */}
        <div className="space-y-4">
          <Card hover={false}>
            <CardBody className="p-5">
              <p className="text-secondary mb-3 text-[10px] font-bold tracking-widest">
                Crm-fase
              </p>
              <div className="space-y-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={setStage.isPending}
                    onClick={() => setStage.mutate({ contactId: id, stage: s })}
                    className={`w-full border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      user.crmStage === s
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-hairline text-on-surface-variant hover:border-on-surface"
                    }`}
                  >
                    {STAGE_LABEL[s]}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card hover={false}>
            <CardBody className="p-5">
              <p className="text-secondary mb-3 text-[10px] font-bold tracking-widest">
                Tags
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {user.crmTags.length === 0 && (
                  <span className="text-secondary text-xs">Geen tags</span>
                )}
                {user.crmTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag.mutate({ contactId: id, tag: t })}
                    className="bg-surface-container hover:text-error border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-2 py-1 text-xs transition-colors hover:border-red-400"
                    title="Klik om te verwijderen"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Nieuwe tag"
                  className="bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 flex-1 rounded-xl border border-transparent px-4 py-3 pb-1 text-sm outline-none focus:ring-[3px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tag.trim())
                      addTag.mutate({ contactId: id, tag });
                  }}
                />
                <button
                  type="button"
                  disabled={addTag.isPending || !tag.trim()}
                  onClick={() => addTag.mutate({ contactId: id, tag })}
                  className="text-primary text-xs font-semibold disabled:opacity-40"
                >
                  + Toevoegen
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
