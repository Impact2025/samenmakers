"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function PayoutActions({
  state,
  canStart,
}: {
  state: "none" | "pending" | "ready";
  canStart: boolean;
}) {
  const onboard = trpc.tickets.connectOnboard.useMutation({
    onSuccess: ({ url }) => (window.location.href = url),
  });
  const dashboard = trpc.tickets.connectDashboard.useMutation({
    onSuccess: ({ url }) => window.open(url, "_blank", "noopener"),
  });
  const error = onboard.error ?? dashboard.error;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {state !== "ready" && (
          <Button
            onClick={() => onboard.mutate()}
            disabled={onboard.isPending || (!canStart && state === "none")}
          >
            {onboard.isPending ? (
              <Spinner />
            ) : state === "none" ? (
              "Rekening koppelen via Stripe"
            ) : (
              "Gegevens aanvullen"
            )}
          </Button>
        )}
        {state !== "none" && (
          <Button
            variant="secondary"
            onClick={() => dashboard.mutate()}
            disabled={dashboard.isPending}
          >
            {dashboard.isPending ? <Spinner /> : "Stripe-dashboard"}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-body-sm text-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
