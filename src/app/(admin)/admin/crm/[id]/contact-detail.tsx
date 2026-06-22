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
    onSuccess: () => { setNote(""); invalidate(); },
  });
  const setStage = trpc.crm.setStage.useMutation({ onSuccess: invalidate });
  const addTag = trpc.crm.addTag.useMutation({ onSuccess: () => { setTag(""); invalidate(); } });
  const removeTag = trpc.crm.removeTag.useMutation({ onSuccess: invalidate });

  if (q.isLoading) return <div className="p-8"><Spinner /></div>;
  if (!q.data) return <p className="text-sm text-outline">Contact niet gevonden.</p>;

  const { user, activities, stats } = q.data;
  const naam = user.naam ?? user.name ?? "—";

  return (
    <div className="space-y-6">
      <Link href="/admin/crm" className="text-xs text-outline hover:text-on-surface">← Terug naar CRM</Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left: profile + activity */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-on-surface">{naam}</h1>
              <p className="text-sm text-outline">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.sector && <Badge variant="default" size="sm">{user.sector}</Badge>}
                {user.regio && <Badge variant="default" size="sm">{user.regio}</Badge>}
                {user.subscriptionStatus === "active" && <Badge variant="primary" size="sm">Pro</Badge>}
              </div>
            </div>
            <Link href={`/admin/gebruikers`} className="text-xs text-primary hover:underline">Beheer →</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "MATCHES", value: stats.matches },
              { label: "POSTS", value: stats.posts },
              { label: "EVENTS", value: stats.events },
            ].map((s) => (
              <Card key={s.label} hover={false}>
                <CardBody className="p-4">
                  <p className="text-[10px] font-bold tracking-widest text-outline">{s.label}</p>
                  <p className="text-2xl font-black text-on-surface">{s.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Add note */}
          <Card hover={false}>
            <CardBody className="p-5">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface mb-3">Notitie toevoegen</h2>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Interne notitie over dit contact…" />
              <div className="mt-3">
                <Button type="button" variant="primary" size="sm" disabled={addNote.isPending || note.trim().length === 0} onClick={() => addNote.mutate({ contactId: id, content: note })}>
                  {addNote.isPending ? <Spinner /> : "Notitie opslaan"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Activity timeline */}
          <Card hover={false}>
            <CardBody className="p-5">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface mb-4">Tijdlijn</h2>
              {activities.length === 0 ? (
                <p className="text-sm text-outline">Nog geen activiteit.</p>
              ) : (
                <ul className="space-y-4">
                  {activities.map((a) => (
                    <li key={a.id} className="border-l-2 border-hairline pl-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="default" size="sm">{ACTIVITY_LABEL[a.type] ?? a.type}</Badge>
                        <span className="text-xs text-outline">{formatDateTime(a.createdAt)}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant whitespace-pre-line">{a.content}</p>
                      {a.admin && (
                        <p className="text-xs text-outline mt-0.5">— {a.admin.naam ?? a.admin.name}</p>
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
              <p className="text-[10px] font-bold tracking-widest text-outline mb-3">CRM-FASE</p>
              <div className="space-y-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={setStage.isPending}
                    onClick={() => setStage.mutate({ contactId: id, stage: s })}
                    className={`w-full text-left px-3 py-2 text-sm font-medium border transition-colors ${
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
              <p className="text-[10px] font-bold tracking-widest text-outline mb-3">TAGS</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {user.crmTags.length === 0 && <span className="text-xs text-outline">Geen tags</span>}
                {user.crmTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag.mutate({ contactId: id, tag: t })}
                    className="px-2 py-1 text-xs bg-surface-container border border-hairline hover:border-red-400 hover:text-red-500"
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
                  className="flex-1 bg-transparent border-b border-on-surface pb-1 text-sm outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tag.trim()) addTag.mutate({ contactId: id, tag });
                  }}
                />
                <button
                  type="button"
                  disabled={addTag.isPending || !tag.trim()}
                  onClick={() => addTag.mutate({ contactId: id, tag })}
                  className="text-xs font-semibold text-primary disabled:opacity-40"
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
