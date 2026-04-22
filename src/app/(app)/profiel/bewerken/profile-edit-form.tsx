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
import { SECTOREN, REGIO_S, FASEN, MENTORSHIP_ROLES } from "@/lib/constants";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Me = NonNullable<inferRouterOutputs<AppRouter>["users"]["me"]>;

const EXPERTISE_OPTIONS = [
  "Businessmodelling", "Fundraising", "Marketing", "Technologie",
  "Juridisch", "Finance", "HR", "Sales", "Design", "Data",
  "Communicatie", "Netwerk", "Duurzaamheid", "Impact meten",
];

export function ProfileEditForm({ user }: { user: Me }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [expertise, setExpertise] = useState<string[]>(user.expertise ?? []);

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
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      updateUser.mutate({
        naam: form.naam,
        bio: form.bio || undefined,
        missie: form.missie || undefined,
        ikZoek: form.ikZoek || undefined,
        sector: (form.sector as typeof SECTOREN[number]) || undefined,
        regio: (form.regio as typeof REGIO_S[number]) || undefined,
        fase: (form.fase as "starter" | "groei" | "scale" | "") || undefined,
        website: form.website || undefined,
        linkedin: form.linkedin || undefined,
        mentorshipRole: form.mentorshipRole as "mentor" | "mentee" | "both" | "none",
        expertise,
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
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
              <Spinner />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-on-surface text-on-primary flex items-center justify-center rounded-full hover:bg-primary-container transition-colors"
            aria-label="Foto wijzigen"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="font-semibold text-on-surface">{form.naam || "Jouw naam"}</p>
          <p className="text-body-sm text-outline mt-0.5">
            Klik op het camera-icoon om je foto te wijzigen
          </p>
        </div>
      </div>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-label-caps text-outline hairline-b pb-3">BASISGEGEVENS</h2>
        <div>
          <label className="text-label-caps text-outline block mb-2">NAAM *</label>
          <Input
            value={form.naam}
            onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
            placeholder="Jouw naam"
            required
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">BIO</label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Vertel kort over jezelf en je onderneming"
            rows={3}
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">MISSIE</label>
          <Textarea
            value={form.missie}
            onChange={(e) => setForm((f) => ({ ...f, missie: e.target.value }))}
            placeholder="Wat is de missie van jouw onderneming?"
            rows={2}
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">IK ZOEK</label>
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
        <h2 className="text-label-caps text-outline hairline-b pb-3">CONTEXT</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label-caps text-outline block mb-2">SECTOR</label>
            <select
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              className="w-full border border-hairline bg-white px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-on-surface"
            >
              <option value="">Kies sector</option>
              {SECTOREN.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-caps text-outline block mb-2">REGIO</label>
            <select
              value={form.regio}
              onChange={(e) => setForm((f) => ({ ...f, regio: e.target.value }))}
              className="w-full border border-hairline bg-white px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-on-surface"
            >
              <option value="">Kies regio</option>
              {REGIO_S.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">FASE</label>
          <div className="flex gap-3">
            {FASEN.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, fase: value }))}
                className={`flex-1 py-2.5 px-3 text-xs font-bold tracking-widest uppercase border transition-colors ${
                  form.fase === value
                    ? "bg-on-surface text-on-primary border-on-surface"
                    : "border-hairline text-outline hover:border-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise tags */}
      <section className="space-y-4">
        <h2 className="text-label-caps text-outline hairline-b pb-3">EXPERTISE</h2>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map((item) => {
            const selected = expertise.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleExpertise(item)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wide border transition-colors ${
                  selected
                    ? "bg-primary text-on-primary border-primary"
                    : "border-hairline text-outline hover:border-on-surface"
                }`}
              >
                {selected && <X size={10} className="inline mr-1" />}
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* Mentorship */}
      <section className="space-y-4">
        <h2 className="text-label-caps text-outline hairline-b pb-3">MENTORSCHAP</h2>
        <div className="flex gap-3 flex-wrap">
          {MENTORSHIP_ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, mentorshipRole: value }))}
              className={`py-2.5 px-4 text-xs font-bold tracking-widest uppercase border transition-colors ${
                form.mentorshipRole === value
                  ? "bg-on-surface text-on-primary border-on-surface"
                  : "border-hairline text-outline hover:border-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="space-y-4">
        <h2 className="text-label-caps text-outline hairline-b pb-3">LINKS</h2>
        <div>
          <label className="text-label-caps text-outline block mb-2">WEBSITE</label>
          <Input
            type="url"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://jouwbedrijf.nl"
          />
        </div>
        <div>
          <label className="text-label-caps text-outline block mb-2">LINKEDIN</label>
          <Input
            type="url"
            value={form.linkedin}
            onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
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
        <p className="text-sm text-red-600">{updateUser.error.message}</p>
      )}
    </form>
  );
}
