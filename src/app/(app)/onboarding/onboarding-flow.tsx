"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    zoektNaar:
      (user as { zoektNaar?: string[] })?.zoektNaar ?? ([] as string[]),
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
        sector: (form.sector as (typeof SECTOREN)[number]) || undefined,
        regio: (form.regio as (typeof REGIO_S)[number]) || undefined,
        fase: (form.fase as "starter" | "groei" | "scale") || undefined,
      });
    } else if (step === "missie") {
      update.mutate({
        missie: form.missie || undefined,
        ikZoek: form.ikZoek || undefined,
        zoektNaar: form.zoektNaar,
      });
    } else {
      update.mutate({
        mentorshipRole: form.mentorshipRole as
          | "mentor"
          | "mentee"
          | "both"
          | "none",
      });
    }
  }

  return (
    <div className="border-hairline border bg-white">
      {/* Progress */}
      <div className="px-8 pt-8 pb-0">
        <div className="text-label-md text-secondary mb-3 flex items-center justify-between">
          <span>
            STAP {stepIndex + 1} VAN {STEPS.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="bg-surface-container mb-8 h-1 w-full">
          <div
            className="bg-primary h-1 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-5 px-8 pb-8">
        {step === "basis" && (
          <>
            <h2 className="text-headline-md text-on-surface">Wie ben jij?</h2>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                NAAM *
              </label>
              <Input
                value={form.naam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, naam: e.target.value }))
                }
                placeholder="Jouw naam"
              />
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                BIO
              </label>
              <Textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                placeholder="Vertel in een paar zinnen over jezelf en je onderneming"
                rows={3}
              />
            </div>
          </>
        )}

        {step === "context" && (
          <>
            <h2 className="text-headline-md text-on-surface">
              In welke context werk jij?
            </h2>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                SECTOR
              </label>
              <select
                value={form.sector}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sector: e.target.value }))
                }
                className="border-hairline focus:border-on-surface w-full border bg-white px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">Kies jouw sector</option>
                {SECTOREN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                REGIO
              </label>
              <select
                value={form.regio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, regio: e.target.value }))
                }
                className="border-hairline focus:border-on-surface w-full border bg-white px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">Kies jouw regio</option>
                {REGIO_S.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                FASE
              </label>
              <div className="flex gap-2">
                {FASEN.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, fase: value }))}
                    className={`flex-1 border py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                      form.fase === value
                        ? "bg-on-surface text-on-primary border-on-surface"
                        : "border-hairline text-secondary hover:border-on-surface"
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
            <h2 className="text-headline-md text-on-surface">
              Wat drijft jou?
            </h2>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                MISSIE
              </label>
              <Textarea
                value={form.missie}
                onChange={(e) =>
                  setForm((f) => ({ ...f, missie: e.target.value }))
                }
                placeholder="Wat is de missie van jouw onderneming?"
                rows={3}
              />
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                WAT ZOEK JE? *
              </label>
              <p className="text-body-md text-secondary mb-3">
                Dit bepaalt wie je te zien krijgt.
              </p>
              <div className="flex flex-wrap gap-2">
                {ZOEKT_NAAR_OPTIONS.map(({ value, label }) => {
                  const selected = form.zoektNaar.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          zoektNaar: f.zoektNaar.includes(value)
                            ? f.zoektNaar.filter((v) => v !== value)
                            : [...f.zoektNaar, value],
                        }))
                      }
                      className={`border px-3 py-2 text-xs font-bold tracking-wide transition-colors ${
                        selected
                          ? "bg-primary text-on-primary border-primary"
                          : "border-hairline text-secondary hover:border-on-surface"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                TOELICHTING (OPTIONEEL)
              </label>
              <Textarea
                value={form.ikZoek}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ikZoek: e.target.value }))
                }
                placeholder="Vertel meer over wat je zoekt in een samenwerking"
                rows={2}
              />
            </div>
          </>
        )}

        {step === "mentorship" && (
          <>
            <h2 className="text-headline-md text-on-surface">Mentorschap</h2>
            <p className="text-body-md text-on-surface-variant">
              Ben je beschikbaar als mentor voor andere ondernemers, of zoek je
              zelf een mentor?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MENTORSHIP_ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, mentorshipRole: value }))
                  }
                  className={`text-label-md border py-4 transition-colors ${
                    form.mentorshipRole === value
                      ? "bg-on-surface text-on-primary border-on-surface"
                      : "border-hairline text-secondary hover:border-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {update.error && (
          <p className="text-error text-sm">{update.error.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={update.isPending}
            className="flex-1"
          >
            {update.isPending ? (
              <Spinner />
            ) : stepIndex < STEPS.length - 1 ? (
              "Volgende stap →"
            ) : (
              "Profiel opslaan →"
            )}
          </Button>
          {stepIndex > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep(STEPS[stepIndex - 1]!)}
            >
              Terug
            </Button>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-secondary hover:text-on-surface w-full py-2 text-center text-xs transition-colors"
        >
          Nu overslaan, later invullen
        </button>
      </div>
    </div>
  );
}
