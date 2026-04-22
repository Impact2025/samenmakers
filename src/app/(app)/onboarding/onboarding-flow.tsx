"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SECTOREN, REGIO_S, FASEN, MENTORSHIP_ROLES } from "@/lib/constants";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Me = inferRouterOutputs<AppRouter>["users"]["me"];

const STEPS = ["basis", "context", "missie", "mentorship"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow({ user }: { user: Me }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basis");
  const [form, setForm] = useState({
    naam: user?.naam ?? user?.name ?? "",
    bio: user?.bio ?? "",
    missie: user?.missie ?? "",
    ikZoek: user?.ikZoek ?? "",
    sector: user?.sector ?? "",
    regio: user?.regio ?? "",
    fase: user?.fase ?? "",
    mentorshipRole: user?.mentorshipRole ?? "none",
  });

  const update = trpc.users.update.useMutation({
    onSuccess: () => {
      const idx = STEPS.indexOf(step);
      if (idx < STEPS.length - 1) {
        setStep(STEPS[idx + 1]!);
      } else {
        router.push("/dashboard");
      }
    },
  });

  const stepIndex = STEPS.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function handleNext() {
    if (step === "basis") {
      update.mutate({ naam: form.naam, bio: form.bio || undefined });
    } else if (step === "context") {
      update.mutate({
        sector: (form.sector as typeof SECTOREN[number]) || undefined,
        regio: (form.regio as typeof REGIO_S[number]) || undefined,
        fase: (form.fase as "starter" | "groei" | "scale") || undefined,
      });
    } else if (step === "missie") {
      update.mutate({
        missie: form.missie || undefined,
        ikZoek: form.ikZoek || undefined,
      });
    } else {
      update.mutate({
        mentorshipRole: form.mentorshipRole as "mentor" | "mentee" | "both" | "none",
      });
    }
  }

  return (
    <div className="border border-hairline bg-white">
      {/* Progress */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-center justify-between text-label-caps text-outline mb-3">
          <span>STAP {stepIndex + 1} VAN {STEPS.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-surface-container h-1 mb-8">
          <div className="h-1 bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-8 pb-8 space-y-5">
        {step === "basis" && (
          <>
            <h2 className="text-headline-sm text-on-surface">Wie ben jij?</h2>
            <div>
              <label className="text-label-caps text-outline block mb-2">NAAM *</label>
              <Input
                value={form.naam}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder="Jouw naam"
              />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">BIO</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Vertel in een paar zinnen over jezelf en je onderneming"
                rows={3}
              />
            </div>
          </>
        )}

        {step === "context" && (
          <>
            <h2 className="text-headline-sm text-on-surface">In welke context werk jij?</h2>
            <div>
              <label className="text-label-caps text-outline block mb-2">SECTOR</label>
              <select
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                className="w-full border border-hairline bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-on-surface"
              >
                <option value="">Kies jouw sector</option>
                {SECTOREN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">REGIO</label>
              <select
                value={form.regio}
                onChange={(e) => setForm((f) => ({ ...f, regio: e.target.value }))}
                className="w-full border border-hairline bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-on-surface"
              >
                <option value="">Kies jouw regio</option>
                {REGIO_S.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">FASE</label>
              <div className="flex gap-2">
                {FASEN.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, fase: value }))}
                    className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase border transition-colors ${
                      form.fase === value ? "bg-on-surface text-on-primary border-on-surface" : "border-hairline text-outline hover:border-on-surface"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "missie" && (
          <>
            <h2 className="text-headline-sm text-on-surface">Wat drijft jou?</h2>
            <div>
              <label className="text-label-caps text-outline block mb-2">MISSIE</label>
              <Textarea
                value={form.missie}
                onChange={(e) => setForm((f) => ({ ...f, missie: e.target.value }))}
                placeholder="Wat is de missie van jouw onderneming?"
                rows={3}
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
          </>
        )}

        {step === "mentorship" && (
          <>
            <h2 className="text-headline-sm text-on-surface">Mentorschap</h2>
            <p className="text-body-sm text-on-surface-variant">
              Ben je beschikbaar als mentor voor andere ondernemers, of zoek je zelf een mentor?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MENTORSHIP_ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mentorshipRole: value }))}
                  className={`py-4 text-label-caps border transition-colors ${
                    form.mentorshipRole === value ? "bg-on-surface text-on-primary border-on-surface" : "border-hairline text-outline hover:border-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {update.error && <p className="text-sm text-red-600">{update.error.message}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleNext} disabled={update.isPending} className="flex-1">
            {update.isPending ? <Spinner /> : stepIndex < STEPS.length - 1 ? "Volgende stap →" : "Profiel opslaan →"}
          </Button>
          {stepIndex > 0 && (
            <Button variant="secondary" onClick={() => setStep(STEPS[stepIndex - 1]!)}>
              Terug
            </Button>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-xs text-outline hover:text-on-surface transition-colors py-2"
        >
          Nu overslaan, later invullen
        </button>
      </div>
    </div>
  );
}
