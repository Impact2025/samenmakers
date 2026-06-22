"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type DiscountType = "percent" | "amount";
type Duration = "once" | "repeating" | "forever";

const DURATION_LABEL: Record<Duration, string> = {
  once: "Eenmalig",
  repeating: "Herhalend",
  forever: "Voor altijd",
};

function formatDiscount(type: DiscountType, value: number) {
  return type === "percent" ? `${value}%` : `€${(value / 100).toFixed(2)}`;
}

export function CouponManager() {
  const utils = trpc.useUtils();
  const list = trpc.coupons.list.useQuery();

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percent" as DiscountType,
    discountValue: "",
    duration: "once" as Duration,
    durationInMonths: "",
    maxRedemptions: "",
    expiresAt: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const create = trpc.coupons.create.useMutation({
    onSuccess: () => {
      void utils.coupons.list.invalidate();
      setForm((f) => ({
        ...f,
        code: "",
        description: "",
        discountValue: "",
        durationInMonths: "",
        maxRedemptions: "",
        expiresAt: "",
      }));
    },
  });
  const setActive = trpc.coupons.setActive.useMutation({
    onSuccess: () => void utils.coupons.list.invalidate(),
  });
  const remove = trpc.coupons.remove.useMutation({
    onSuccess: () => void utils.coupons.list.invalidate(),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const rawValue = Number(form.discountValue);
    if (!form.code || !rawValue) return;
    create.mutate({
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      // amount is entered in euros, stored in cents
      discountValue:
        form.discountType === "amount" ? Math.round(rawValue * 100) : Math.round(rawValue),
      duration: form.duration,
      durationInMonths:
        form.duration === "repeating" && form.durationInMonths
          ? Number(form.durationInMonths)
          : undefined,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <Card hover={false}>
        <CardBody className="p-6">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface mb-4">
            Nieuwe coupon
          </h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-label-caps text-outline block mb-2">CODE *</label>
              <Input
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="ZOMER25"
              />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">OMSCHRIJVING</label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Intern label"
              />
            </div>

            <div>
              <label className="text-label-caps text-outline block mb-2">TYPE</label>
              <div className="flex gap-2">
                {(["percent", "amount"] as DiscountType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("discountType", t)}
                    className={`px-4 py-2 text-sm font-medium border transition-colors ${
                      form.discountType === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-hairline text-on-surface-variant"
                    }`}
                  >
                    {t === "percent" ? "Percentage" : "Vast bedrag"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">
                WAARDE * {form.discountType === "percent" ? "(%)" : "(€)"}
              </label>
              <Input
                type="number"
                step={form.discountType === "amount" ? "0.01" : "1"}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percent" ? "25" : "5.00"}
              />
            </div>

            <div>
              <label className="text-label-caps text-outline block mb-2">DUUR</label>
              <div className="flex flex-wrap gap-2">
                {(["once", "repeating", "forever"] as Duration[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("duration", d)}
                    className={`px-3 py-2 text-xs font-medium border transition-colors ${
                      form.duration === d
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-hairline text-on-surface-variant"
                    }`}
                  >
                    {DURATION_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>
            {form.duration === "repeating" && (
              <div>
                <label className="text-label-caps text-outline block mb-2">AANTAL MAANDEN *</label>
                <Input
                  type="number"
                  value={form.durationInMonths}
                  onChange={(e) => set("durationInMonths", e.target.value)}
                  placeholder="3"
                />
              </div>
            )}

            <div>
              <label className="text-label-caps text-outline block mb-2">MAX. GEBRUIK</label>
              <Input
                type="number"
                value={form.maxRedemptions}
                onChange={(e) => set("maxRedemptions", e.target.value)}
                placeholder="onbeperkt"
              />
            </div>
            <div>
              <label className="text-label-caps text-outline block mb-2">VERLOOPT OP</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={create.isPending}>
                {create.isPending ? <Spinner /> : "Coupon aanmaken"}
              </Button>
              {create.error && (
                <p className="text-sm text-red-600">{create.error.message}</p>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {/* List */}
      <Card hover={false}>
        <CardBody className="p-0">
          {list.isLoading ? (
            <div className="p-8"><Spinner /></div>
          ) : !list.data?.length ? (
            <p className="p-8 text-sm text-outline">Nog geen coupons.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">CODE</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">KORTING</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">DUUR</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">GEBRUIK</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-outline">STATUS</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((c) => {
                  const busy =
                    (setActive.isPending && setActive.variables?.id === c.id) ||
                    (remove.isPending && remove.variables?.id === c.id);
                  return (
                    <tr key={c.id} className="border-b border-hairline/50 last:border-0">
                      <td className="p-4">
                        <span className="font-mono font-bold text-on-surface">{c.code}</span>
                        {c.description && (
                          <p className="text-xs text-outline mt-0.5">{c.description}</p>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-on-surface">
                        {formatDiscount(c.discountType, c.discountValue)}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {DURATION_LABEL[c.duration]}
                        {c.duration === "repeating" && c.durationInMonths
                          ? ` (${c.durationInMonths}m)`
                          : ""}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {c.timesRedeemed}
                        {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                      </td>
                      <td className="p-4">
                        {c.active ? (
                          <Badge variant="primary" size="sm">Actief</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Inactief</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setActive.mutate({ id: c.id, active: !c.active })}
                            className="font-semibold text-primary hover:underline disabled:opacity-40"
                          >
                            {c.active ? "Deactiveer" : "Activeer"}
                          </button>
                          {c.timesRedeemed === 0 && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Coupon ${c.code} verwijderen?`)) remove.mutate({ id: c.id });
                              }}
                              className="font-semibold text-red-500 hover:underline disabled:opacity-40"
                            >
                              Verwijder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {remove.error && (
            <p className="p-4 text-sm text-red-600">{remove.error.message}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
