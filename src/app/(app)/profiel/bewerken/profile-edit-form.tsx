"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  SECTOREN,
  REGIO_S,
  FASEN,
  MENTORSHIP_ROLES,
  ZOEKT_NAAR_OPTIONS,
} from "@/lib/constants";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Me = NonNullable<inferRouterOutputs<AppRouter>["users"]["me"]>;

const EXPERTISE_OPTIONS = [
  "Businessmodelling",
  "Fundraising",
  "Marketing",
  "Technologie",
  "Juridisch",
  "Finance",
  "HR",
  "Sales",
  "Design",
  "Data",
  "Communicatie",
  "Netwerk",
  "Duurzaamheid",
  "Impact meten",
];

export function ProfileEditForm({ user }: { user: Me }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [expertise, setExpertise] = useState<string[]>(user.expertise ?? []);
  const [zoektNaar, setZoektNaar] = useState<string[]>(
    (user as { zoektNaar?: string[] }).zoektNaar ?? [],
  );

  const [form, setForm] = useState({
    naam: user.naam ?? "",
    bio: user.bio ?? "",
    missie: user.missie ?? "",
    ikZoek: user.ikZoek ?? "",
    sector: user.sector ?? "",
    regio: user.regio ?? "",
    fase: user.fase ?? "",
    website: user.website ?? "",
    linkedin: user.linkedin ?? "",
    mentorshipRole: user.mentorshipRole ?? "none",
  });

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      router.push("/profiel");
      router.refresh();
    },
  });

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) setAvatarUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  function toggleExpertise(item: string) {
    setExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
  }

  function toggleZoektNaar(value: string) {
    setZoektNaar((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      updateUser.mutate({
        naam: form.naam,
        bio: form.bio || undefined,
        missie: form.missie || undefined,
        ikZoek: form.ikZoek || undefined,
        sector: (form.sector as (typeof SECTOREN)[number]) || undefined,
        regio: (form.regio as (typeof REGIO_S)[number]) || undefined,
        fase: (form.fase as "starter" | "groei" | "scale" | "") || undefined,
        website: form.website || undefined,
        linkedin: form.linkedin || undefined,
        mentorshipRole: form.mentorshipRole as
          | "mentor"
          | "mentee"
          | "both"
          | "none",
        expertise,
        zoektNaar,
      });
    });
  }

  const isLoading = isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar upload */}
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <Avatar
            src={avatarUrl || null}
            naam={(form.naam || user.name) ?? "?"}
            size="xl"
            grayscale={false}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
              <Spinner />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-on-surface text-on-primary hover:bg-primary-container absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            aria-label="Foto wijzigen"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e)}
          />
        </div>
        <div>
          <p className="text-on-surface font-semibold">
            {form.naam || "Jouw naam"}
          </p>
          <p className="text-body-md text-secondary mt-0.5">
            Klik op het camera-icoon om je foto te wijzigen
          </p>
        </div>
      </div>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-label-md text-secondary hairline-b pb-3">
          Basisgegevens
        </h2>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Naam *
          </label>
          <Input
            value={form.naam}
            onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
            placeholder="Jouw naam"
            required
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Bio
          </label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Vertel kort over jezelf en je onderneming"
            rows={3}
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Missie
          </label>
          <Textarea
            value={form.missie}
            onChange={(e) => setForm((f) => ({ ...f, missie: e.target.value }))}
            placeholder="Wat is de missie van jouw onderneming?"
            rows={2}
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Ik zoek
          </label>
          <Textarea
            value={form.ikZoek}
            onChange={(e) => setForm((f) => ({ ...f, ikZoek: e.target.value }))}
            placeholder="Wat zoek jij in een samenwerking?"
            rows={2}
          />
        </div>
      </section>

      {/* Context */}
      <section className="space-y-4">
        <h2 className="text-label-md text-secondary hairline-b pb-3">
          Context
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-label-lg text-on-surface mb-1.5 block">
              Sector
            </label>
            <select
              value={form.sector}
              onChange={(e) =>
                setForm((f) => ({ ...f, sector: e.target.value }))
              }
              className="text-on-surface bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 w-full rounded-xl border border-transparent px-3 py-2.5 text-sm outline-none focus:ring-[3px]"
            >
              <option value="">Kies sector</option>
              {SECTOREN.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-lg text-on-surface mb-1.5 block">
              Regio
            </label>
            <select
              value={form.regio}
              onChange={(e) =>
                setForm((f) => ({ ...f, regio: e.target.value }))
              }
              className="text-on-surface bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 w-full rounded-xl border border-transparent px-3 py-2.5 text-sm outline-none focus:ring-[3px]"
            >
              <option value="">Kies regio</option>
              {REGIO_S.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Fase
          </label>
          <div className="flex gap-3">
            {FASEN.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, fase: value }))}
                className={`text-label-md flex-1 rounded-full border px-3 py-2.5 transition-colors ${
                  form.fase === value
                    ? "bg-on-surface text-surface-container-lowest border-transparent"
                    : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Zoekt naar */}
      <section className="space-y-4">
        <div>
          <h2 className="text-label-md text-secondary hairline-b pb-3">
            Wat zoek je?
          </h2>
          <p className="text-body-md text-secondary mt-2">
            Selecteer wat je zoekt in een samenwerking. Dit helpt ons je betere
            matches te tonen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ZOEKT_NAAR_OPTIONS.map(({ value, label }) => {
            const selected = zoektNaar.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleZoektNaar(value)}
                className={`text-label-md rounded-full border px-3 py-1.5 transition-colors ${
                  selected
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
                }`}
              >
                {selected && <X size={10} className="mr-1 inline" />}
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Expertise tags */}
      <section className="space-y-4">
        <h2 className="text-label-md text-secondary hairline-b pb-3">
          Expertise
        </h2>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map((item) => {
            const selected = expertise.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleExpertise(item)}
                className={`text-label-md rounded-full border px-3 py-1.5 transition-colors ${
                  selected
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
                }`}
              >
                {selected && <X size={10} className="mr-1 inline" />}
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* Mentorship */}
      <section className="space-y-4">
        <h2 className="text-label-md text-secondary hairline-b pb-3">
          Mentorschap
        </h2>
        <div className="flex flex-wrap gap-3">
          {MENTORSHIP_ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, mentorshipRole: value }))}
              className={`text-label-md rounded-full border px-4 py-2.5 transition-colors ${
                form.mentorshipRole === value
                  ? "bg-on-surface text-surface-container-lowest border-transparent"
                  : "bg-surface-container-low text-secondary hover:text-on-surface border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="space-y-4">
        <h2 className="text-label-md text-secondary hairline-b pb-3">Links</h2>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Website
          </label>
          <Input
            type="url"
            value={form.website}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
            placeholder="https://jouwbedrijf.nl"
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface mb-1.5 block">
            Linkedin
          </label>
          <Input
            type="url"
            value={form.linkedin}
            onChange={(e) =>
              setForm((f) => ({ ...f, linkedin: e.target.value }))
            }
            placeholder="https://linkedin.com/in/jounaam"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? <Spinner /> : "Opslaan"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuleren
        </Button>
      </div>

      {updateUser.error && (
        <p className="text-error text-sm">{updateUser.error.message}</p>
      )}
    </form>
  );
}
