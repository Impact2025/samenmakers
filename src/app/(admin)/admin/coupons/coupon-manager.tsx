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
        form.discountType === "amount"
          ? Math.round(rawValue * 100)
          : Math.round(rawValue),
      duration: form.duration,
      durationInMonths:
        form.duration === "repeating" && form.durationInMonths
          ? Number(form.durationInMonths)
          : undefined,
      maxRedemptions: form.maxRedemptions
        ? Number(form.maxRedemptions)
        : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <Card hover={false}>
        <CardBody className="p-6">
          <h2 className="text-on-surface mb-4 text-[11px] font-bold tracking-widest uppercase">
            Nieuwe coupon
          </h2>
          <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                CODE *
              </label>
              <Input
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="ZOMER25"
              />
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                OMSCHRIJVING
              </label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Intern label"
              />
            </div>

            <div>
              <label className="text-label-md text-secondary mb-2 block">
                TYPE
              </label>
              <div className="flex gap-2">
                {(["percent", "amount"] as DiscountType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("discountType", t)}
                    className={`border px-4 py-2 text-sm font-medium transition-colors ${
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
              <label className="text-label-md text-secondary mb-2 block">
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
              <label className="text-label-md text-secondary mb-2 block">
                DUUR
              </label>
              <div className="flex flex-wrap gap-2">
                {(["once", "repeating", "forever"] as Duration[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("duration", d)}
                    className={`border px-3 py-2 text-xs font-medium transition-colors ${
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
                <label className="text-label-md text-secondary mb-2 block">
                  AANTAL MAANDEN *
                </label>
                <Input
                  type="number"
                  value={form.durationInMonths}
                  onChange={(e) => set("durationInMonths", e.target.value)}
                  placeholder="3"
                />
              </div>
            )}

            <div>
              <label className="text-label-md text-secondary mb-2 block">
                MAX. GEBRUIK
              </label>
              <Input
                type="number"
                value={form.maxRedemptions}
                onChange={(e) => set("maxRedemptions", e.target.value)}
                placeholder="onbeperkt"
              />
            </div>
            <div>
              <label className="text-label-md text-secondary mb-2 block">
                VERLOOPT OP
              </label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2 md:col-span-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={create.isPending}
              >
                {create.isPending ? <Spinner /> : "Coupon aanmaken"}
              </Button>
              {create.error && (
                <p className="text-error text-sm">{create.error.message}</p>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {/* List */}
      <Card hover={false}>
        <CardBody className="p-0">
          {list.isLoading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : !list.data?.length ? (
            <p className="text-secondary p-8 text-sm">Nog geen coupons.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-hairline border-b text-left">
                  <th className="text-secondary p-4 text-[10px] font-bold tracking-widest">
                    CODE
                  </th>
                  <th className="text-secondary p-4 text-[10px] font-bold tracking-widest">
                    KORTING
                  </th>
                  <th className="text-secondary p-4 text-[10px] font-bold tracking-widest">
                    DUUR
                  </th>
                  <th className="text-secondary p-4 text-[10px] font-bold tracking-widest">
                    GEBRUIK
                  </th>
                  <th className="text-secondary p-4 text-[10px] font-bold tracking-widest">
                    STATUS
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((c) => {
                  const busy =
                    (setActive.isPending && setActive.variables?.id === c.id) ||
                    (remove.isPending && remove.variables?.id === c.id);
                  return (
                    <tr
                      key={c.id}
                      className="border-hairline/50 border-b last:border-0"
                    >
                      <td className="p-4">
                        <span className="text-on-surface font-mono font-bold">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-secondary mt-0.5 text-xs">
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td className="text-on-surface p-4 font-semibold">
                        {formatDiscount(c.discountType, c.discountValue)}
                      </td>
                      <td className="text-on-surface-variant p-4">
                        {DURATION_LABEL[c.duration]}
                        {c.duration === "repeating" && c.durationInMonths
                          ? ` (${c.durationInMonths}m)`
                          : ""}
                      </td>
                      <td className="text-on-surface-variant p-4">
                        {c.timesRedeemed}
                        {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                      </td>
                      <td className="p-4">
                        {c.active ? (
                          <Badge variant="primary" size="sm">
                            Actief
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            Inactief
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setActive.mutate({ id: c.id, active: !c.active })
                            }
                            className="text-primary font-semibold hover:underline disabled:opacity-40"
                          >
                            {c.active ? "Deactiveer" : "Activeer"}
                          </button>
                          {c.timesRedeemed === 0 && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (confirm(`Coupon ${c.code} verwijderen?`))
                                  remove.mutate({ id: c.id });
                              }}
                              className="text-error font-semibold hover:underline disabled:opacity-40"
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
            <p className="text-error p-4 text-sm">{remove.error.message}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
