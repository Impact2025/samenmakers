"use client";

import { useState } from "react";
import { REGIO_S, SECTOREN } from "@/lib/constants";
import {
  DEFAULT_EVENT_TZ,
  fromLocalInputValue,
  toLocalInputValue,
} from "@/lib/event-format";
import { Spinner } from "@/components/ui/spinner";

export interface EventFormValues {
  title: string;
  description?: string;
  format: "in_person" | "online" | "hybrid";
  location?: string;
  meetingUrl?: string;
  coverImageUrl?: string;
  startAt: string;
  endAt?: string;
  timezone: string;
  maxAttendees: number | null;
  regio?: string;
  thema?: string;
  visibility: "public" | "members" | "unlisted";
  waitlistOfferHours: number;
}

export interface EventFormInitial {
  title: string;
  description: string | null;
  format: "in_person" | "online" | "hybrid";
  location: string | null;
  meetingUrl: string | null;
  coverImageUrl: string | null;
  startAt: Date;
  endAt: Date | null;
  timezone: string;
  maxAttendees: number | null;
  regio: string | null;
  thema: string | null;
  visibility: "public" | "members" | "unlisted";
  waitlistOfferHours: number;
}

const field =
  "w-full border border-hairline bg-white px-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-on-surface";
const label = "text-label-md text-secondary block mb-2";

/**
 * Eén formulier voor aanmaken en wijzigen. Tijden worden ingevoerd in de tijdzone
 * van het event (standaard Europe/Amsterdam), los van de browser van de organisator.
 */
export function EventForm({
  initial,
  submitting,
  error,
  actions,
  onSubmit,
}: {
  initial?: EventFormInitial | undefined;
  submitting: boolean;
  error?: string | null | undefined;
  /** Knoppen; `name="intent"` + value komt terug in onSubmit. */
  actions: React.ReactNode;
  onSubmit: (values: EventFormValues, intent: string) => void;
}) {
  const tz = initial?.timezone ?? DEFAULT_EVENT_TZ;
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    format: initial?.format ?? ("in_person" as EventFormValues["format"]),
    location: initial?.location ?? "",
    meetingUrl: initial?.meetingUrl ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    startAt: initial ? toLocalInputValue(initial.startAt, tz) : "",
    endAt: initial?.endAt ? toLocalInputValue(initial.endAt, tz) : "",
    maxAttendees: initial?.maxAttendees ? String(initial.maxAttendees) : "",
    regio: initial?.regio ?? "",
    thema: initial?.thema ?? "",
    visibility:
      initial?.visibility ?? ("public" as EventFormValues["visibility"]),
    waitlistOfferHours: String(initial?.waitlistOfferHours ?? 24),
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/event", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload mislukt");
      set("coverImageUrl", data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent = submitter?.value ?? "save";
    const online = form.format === "online";
    onSubmit(
      {
        title: form.title.trim(),
        format: form.format,
        startAt: fromLocalInputValue(form.startAt, tz).toISOString(),
        timezone: tz,
        maxAttendees: form.maxAttendees
          ? parseInt(form.maxAttendees, 10)
          : null,
        visibility: form.visibility,
        waitlistOfferHours: parseInt(form.waitlistOfferHours, 10) || 24,
        ...(form.description.trim()
          ? { description: form.description.trim() }
          : {}),
        ...(!online && form.location.trim()
          ? { location: form.location.trim() }
          : {}),
        ...(form.format !== "in_person" && form.meetingUrl.trim()
          ? { meetingUrl: form.meetingUrl.trim() }
          : {}),
        ...(form.coverImageUrl ? { coverImageUrl: form.coverImageUrl } : {}),
        ...(form.endAt
          ? { endAt: fromLocalInputValue(form.endAt, tz).toISOString() }
          : {}),
        ...(form.regio ? { regio: form.regio } : {}),
        ...(form.thema ? { thema: form.thema } : {}),
      },
      intent,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-5">
        <legend className="text-label-md text-on-surface mb-2">
          1 · Basis
        </legend>
        <div>
          <label htmlFor="ev-title" className={label}>
            Titel *
          </label>
          <input
            id="ev-title"
            className={field}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Naam van het event"
            required
            minLength={3}
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="ev-desc" className={label}>
            Omschrijving
          </label>
          <textarea
            id="ev-desc"
            className={field}
            rows={6}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Wat kunnen deelnemers verwachten? Voor wie is het?"
            maxLength={5000}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ev-thema" className={label}>
              Thema
            </label>
            <select
              id="ev-thema"
              className={field}
              value={form.thema}
              onChange={(e) => set("thema", e.target.value)}
            >
              <option value="">Geen</option>
              {SECTOREN.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Omslagfoto</span>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Omslagfoto uploaden"
                onChange={(e) =>
                  e.target.files?.[0] && void upload(e.target.files[0])
                }
                className="text-sm"
              />
              {uploading && <Spinner />}
            </div>
            {form.coverImageUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImageUrl}
                  alt=""
                  className="border-hairline h-12 w-24 border object-cover"
                />
                <button
                  type="button"
                  className="text-label-md text-secondary hover:text-on-surface"
                  onClick={() => set("coverImageUrl", "")}
                >
                  Verwijderen
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-body-md text-error mt-1">{uploadError}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-label-md text-on-surface mb-2">
          2 · Tijd en plek
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ev-start" className={label}>
              Start *
            </label>
            <input
              id="ev-start"
              type="datetime-local"
              className={field}
              value={form.startAt}
              onChange={(e) => set("startAt", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="ev-end" className={label}>
              Einde
            </label>
            <input
              id="ev-end"
              type="datetime-local"
              className={field}
              value={form.endAt}
              min={form.startAt || undefined}
              onChange={(e) => set("endAt", e.target.value)}
            />
          </div>
        </div>
        <p className="text-body-md text-secondary -mt-2">
          Tijden in {tz.replace("_", " ")}.
        </p>

        <div
          role="radiogroup"
          aria-label="Vorm"
          className="flex flex-wrap gap-2"
        >
          {(
            [
              ["in_person", "Op locatie"],
              ["online", "Online"],
              ["hybrid", "Hybride"],
            ] as const
          ).map(([value, text]) => (
            <label
              key={value}
              className={`text-label-md cursor-pointer rounded-full border px-4 py-2 ${form.format === value ? "bg-on-surface text-surface-container-lowest border-transparent" : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"}`}
            >
              <input
                type="radio"
                name="format"
                value={value}
                checked={form.format === value}
                onChange={() => set("format", value)}
                className="sr-only"
              />
              {text}
            </label>
          ))}
        </div>

        {form.format !== "online" && (
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label htmlFor="ev-loc" className={label}>
                Adres *
              </label>
              <input
                id="ev-loc"
                className={field}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Straat en huisnummer, plaats"
                required
              />
              <p className="text-body-md text-secondary mt-1">
                Een volledig adres zet het event op de kaart en in &ldquo;In
                mijn buurt&rdquo;.
              </p>
            </div>
            <div>
              <label htmlFor="ev-regio" className={label}>
                Regio
              </label>
              <select
                id="ev-regio"
                className={field}
                value={form.regio}
                onChange={(e) => set("regio", e.target.value)}
              >
                <option value="">Kies…</option>
                {REGIO_S.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {form.format !== "in_person" && (
          <div>
            <label htmlFor="ev-url" className={label}>
              Deelnamelink
            </label>
            <input
              id="ev-url"
              type="url"
              className={field}
              value={form.meetingUrl}
              onChange={(e) => set("meetingUrl", e.target.value)}
              placeholder="https://meet.google.com/…"
            />
            <p className="text-body-md text-secondary mt-1">
              Alleen zichtbaar voor aangemelde deelnemers.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-label-md text-on-surface mb-2">
          3 · Aanmelden
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ev-max" className={label}>
              Max. deelnemers
            </label>
            <input
              id="ev-max"
              type="number"
              min={1}
              className={field}
              value={form.maxAttendees}
              onChange={(e) => set("maxAttendees", e.target.value)}
              placeholder="Onbeperkt"
            />
          </div>
          <div>
            <label htmlFor="ev-offer" className={label}>
              Bedenktijd wachtlijst
            </label>
            <select
              id="ev-offer"
              className={field}
              value={form.waitlistOfferHours}
              onChange={(e) => set("waitlistOfferHours", e.target.value)}
            >
              {[4, 12, 24, 48].map((h) => (
                <option key={h} value={h}>
                  {h} uur
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="ev-vis" className={label}>
            Zichtbaarheid
          </label>
          <select
            id="ev-vis"
            className={field}
            value={form.visibility}
            onChange={(e) =>
              set("visibility", e.target.value as EventFormValues["visibility"])
            }
          >
            <option value="public">
              Publiek — vindbaar via Google en te delen
            </option>
            <option value="members">Alleen leden</option>
            <option value="unlisted">Verborgen — alleen via de link</option>
          </select>
        </div>
      </fieldset>

      {error && (
        <p className="text-error text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {submitting ? <Spinner /> : actions}
      </div>
    </form>
  );
}
