"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function NewEventForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    isOnline: false,
    meetingUrl: "",
    startAt: "",
    endAt: "",
    maxAttendees: "",
  });

  const create = trpc.events.create.useMutation({
    onSuccess: (data) => {
      if (data) router.push(`/events/${data.id}`);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      title: form.title,
      description: form.description || undefined,
      location: form.location || undefined,
      isOnline: form.isOnline,
      meetingUrl: form.meetingUrl || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-label-caps text-outline block mb-2">TITEL *</label>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Naam van het event" required />
      </div>
      <div>
        <label className="text-label-caps text-outline block mb-2">OMSCHRIJVING</label>
        <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Wat kun je verwachten?" rows={4} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm((f) => ({ ...f, isOnline: e.target.checked }))} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-on-surface">Online event</span>
      </label>
      {form.isOnline ? (
        <div>
          <label className="text-label-caps text-outline block mb-2">MEETING URL</label>
          <Input type="url" value={form.meetingUrl} onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))} placeholder="https://meet.google.com/..." />
        </div>
      ) : (
        <div>
          <label className="text-label-caps text-outline block mb-2">LOCATIE</label>
          <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Adres of plaatsnaam" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label-caps text-outline block mb-2">START *</label>
          <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} required />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">EINDE</label>
          <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="text-label-caps text-outline block mb-2">MAX. DEELNEMERS</label>
        <Input type="number" min="1" value={form.maxAttendees} onChange={(e) => setForm((f) => ({ ...f, maxAttendees: e.target.value }))} placeholder="Onbeperkt" />
      </div>
      {create.error && <p className="text-sm text-red-600">{create.error.message}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : "Event aanmaken"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Annuleren</Button>
      </div>
    </form>
  );
}
