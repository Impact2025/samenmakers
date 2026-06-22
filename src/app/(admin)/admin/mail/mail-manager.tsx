"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SECTOREN, REGIO_S, FASEN } from "@/lib/constants";
import { formatDateTime } from "@/lib/date-utils";

type Segment = {
  sector?: string | undefined;
  regio?: string | undefined;
  fase?: "starter" | "groei" | "scale" | undefined;
  subscriptionStatus?: "none" | "active" | "past_due" | "canceled" | undefined;
  stage?: "lead" | "engaged" | "customer" | "churned" | undefined;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Concept",
  sending: "Verzenden…",
  sent: "Verzonden",
  failed: "Mislukt",
};

export function MailManager() {
  const utils = trpc.useUtils();
  const list = trpc.campaigns.list.useQuery();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [segment, setSegment] = useState<Segment>({});

  const preview = trpc.campaigns.preview.useQuery(segment);

  const setSeg = (patch: Partial<Segment>) => setSegment((s) => ({ ...s, ...patch }));

  const generate = trpc.campaigns.generate.useMutation({
    onSuccess: (d) => { setSubject(d.subject); setBody(d.body); },
  });
  const create = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      void utils.campaigns.list.invalidate();
      setSubject(""); setBody(""); setTopic("");
    },
  });
  const send = trpc.campaigns.send.useMutation({
    onSuccess: () => void utils.campaigns.list.invalidate(),
  });
  const remove = trpc.campaigns.remove.useMutation({
    onSuccess: () => void utils.campaigns.list.invalidate(),
  });

  return (
    <div className="space-y-8">
      {/* Composer */}
      <Card hover={false}>
        <CardBody className="p-6 space-y-5">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface">Nieuwe mailing</h2>

          {/* AI */}
          <div className="flex gap-2 items-end bg-primary/5 p-4">
            <div className="flex-1">
              <label className="text-label-caps text-outline mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-primary" /> AI — schrijf nieuwsbrief over
              </label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="bijv. 'nieuwe matching-functie en zomerevent'" />
            </div>
            <Button type="button" variant="secondary" size="sm" disabled={generate.isPending || topic.length < 3} onClick={() => generate.mutate({ topic })}>
              {generate.isPending ? <Spinner /> : "Genereer"}
            </Button>
          </div>
          {generate.error && <p className="text-xs text-red-600">{generate.error.message}</p>}

          <div>
            <label className="text-label-caps text-outline block mb-2">ONDERWERP *</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </div>
          <div>
            <label className="text-label-caps text-outline block mb-2">BERICHT (Markdown) *</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="Schrijf je bericht… Markdown wordt ondersteund." />
          </div>

          {/* Segment */}
          <div>
            <label className="text-label-caps text-outline block mb-2">SEGMENT</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={segment.subscriptionStatus ?? ""} onChange={(e) => setSeg({ subscriptionStatus: (e.target.value || undefined) as Segment["subscriptionStatus"] })} className="bg-transparent border-b border-hairline pb-2 text-sm outline-none">
                <option value="">Alle abonnementen</option>
                <option value="active">Pro actief</option>
                <option value="none">Gratis</option>
                <option value="canceled">Opgezegd</option>
              </select>
              <select value={segment.stage ?? ""} onChange={(e) => setSeg({ stage: (e.target.value || undefined) as Segment["stage"] })} className="bg-transparent border-b border-hairline pb-2 text-sm outline-none">
                <option value="">Alle fases</option>
                <option value="lead">Lead</option>
                <option value="engaged">Betrokken</option>
                <option value="customer">Klant</option>
                <option value="churned">Verloren</option>
              </select>
              <select value={segment.sector ?? ""} onChange={(e) => setSeg({ sector: e.target.value || undefined })} className="bg-transparent border-b border-hairline pb-2 text-sm outline-none">
                <option value="">Alle sectoren</option>
                {SECTOREN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={segment.regio ?? ""} onChange={(e) => setSeg({ regio: e.target.value || undefined })} className="bg-transparent border-b border-hairline pb-2 text-sm outline-none">
                <option value="">Alle regio's</option>
                {REGIO_S.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={segment.fase ?? ""} onChange={(e) => setSeg({ fase: (e.target.value || undefined) as Segment["fase"] })} className="bg-transparent border-b border-hairline pb-2 text-sm outline-none">
                <option value="">Alle stadia</option>
                {FASEN.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <p className="text-sm text-on-surface-variant mt-3">
              Bereik:{" "}
              <strong className="text-on-surface">
                {preview.isFetching ? "…" : preview.data?.count ?? 0} ontvangers
              </strong>
              {preview.data?.capped && <span className="text-amber-600"> (max bereikt)</span>}
              <span className="text-outline"> — actieve gebruikers met e-mail</span>
            </p>
          </div>

          <div className="flex items-center gap-3 hairline-t pt-5">
            <Button type="button" variant="primary" size="sm" disabled={create.isPending || subject.length < 2 || body.length < 10} onClick={() => create.mutate({ subject, body, segment })}>
              {create.isPending ? <Spinner /> : "Opslaan als concept"}
            </Button>
            {create.error && <p className="text-sm text-red-600">{create.error.message}</p>}
          </div>
        </CardBody>
      </Card>

      {/* Campaign list */}
      <Card hover={false}>
        <CardBody className="p-0">
          {list.isLoading ? (
            <div className="p-8"><Spinner /></div>
          ) : !list.data?.length ? (
            <p className="p-8 text-sm text-outline">Nog geen mailings.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">ONDERWERP</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">BEREIK</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">STATUS</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">AANGEMAAKT</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((c) => {
                  const busy =
                    (send.isPending && send.variables?.id === c.id) ||
                    (remove.isPending && remove.variables?.id === c.id);
                  return (
                    <tr key={c.id} className="border-b border-hairline/50 last:border-0">
                      <td className="p-4 font-semibold text-on-surface">{c.subject}</td>
                      <td className="p-4 text-on-surface-variant">
                        {c.status === "sent" || c.status === "failed"
                          ? `${c.sentCount}/${c.recipientCount} verzonden`
                          : `${c.recipientCount} ontvangers`}
                        {c.failedCount > 0 && <span className="text-red-500"> · {c.failedCount} mislukt</span>}
                      </td>
                      <td className="p-4">
                        <Badge variant={c.status === "sent" ? "primary" : "default"} size="sm">
                          {STATUS_LABEL[c.status] ?? c.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-outline">{formatDateTime(c.createdAt)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          {c.status === "draft" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Mailing "${c.subject}" nu verzenden naar ${c.recipientCount} ontvangers?`)) send.mutate({ id: c.id });
                              }}
                              className="font-semibold text-primary hover:underline disabled:opacity-40"
                            >
                              {busy && send.isPending ? "Verzenden…" : "Verzend"}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => { if (confirm("Verwijderen?")) remove.mutate({ id: c.id }); }}
                            className="font-semibold text-red-500 hover:underline disabled:opacity-40"
                          >
                            Verwijder
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {send.error && <p className="p-4 text-sm text-red-600">{send.error.message}</p>}
        </CardBody>
      </Card>
    </div>
  );
}
