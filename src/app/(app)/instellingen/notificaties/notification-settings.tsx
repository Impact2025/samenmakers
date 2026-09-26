"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationSettings({
  weeklyDigest,
}: {
  weeklyDigest: boolean;
}) {
  const [digest, setDigest] = useState(weeklyDigest);
  const utils = trpc.useUtils();
  const { permission, subscribed, subscribe, unsubscribe } =
    usePushNotifications();

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => void utils.users.me.invalidate(),
  });

  const notifSettings = [
    {
      key: "new_match",
      label: "Nieuwe match",
      description: "Wanneer iemand jouw connect-aanvraag accepteert",
    },
    {
      key: "new_message",
      label: "Nieuw bericht",
      description: "Wanneer je een bericht ontvangt",
    },
    {
      key: "event_reminder",
      label: "Event reminders",
      description: "Herinneringen voor events waarvoor je aangemeld bent",
    },
    {
      key: "profile_view",
      label: "Profielbezoekers (Pro)",
      description: "Wanneer iemand je profiel bekijkt",
    },
  ];

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">IN-APP NOTIFICATIES</h2>
        </CardHeader>
        <CardBody className="divide-hairline divide-y p-0">
          {notifSettings.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 px-6 py-4"
            >
              <div>
                <p className="text-on-surface text-sm font-semibold">{label}</p>
                <p className="text-secondary mt-0.5 text-xs">{description}</p>
              </div>
              <div className="bg-primary mt-0.5 h-5 w-10 shrink-0 rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Browser push */}
      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">
            BROWSER NOTIFICATIES
          </h2>
        </CardHeader>
        <CardBody>
          {permission === "denied" ? (
            <p className="text-body-md text-secondary">
              Browser notificaties zijn geblokkeerd. Pas dit aan in je
              browser-instellingen.
            </p>
          ) : subscribed ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Push-notificaties actief
                </p>
                <p className="text-secondary mt-0.5 text-xs">
                  Je ontvangt notificaties via je browser.
                </p>
              </div>
              <Button variant="secondary" onClick={() => void unsubscribe()}>
                Uitschakelen
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Push-notificaties
                </p>
                <p className="text-secondary mt-0.5 text-xs">
                  Ontvang directe meldingen in je browser, ook als We Shape the
                  Future niet open is.
                </p>
              </div>
              <Button variant="primary" onClick={() => void subscribe()}>
                Inschakelen
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">E-MAIL</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-on-surface text-sm font-semibold">
                Wekelijkse samenvatting
              </p>
              <p className="text-secondary mt-0.5 text-xs">
                Ontvang elke maandag een overzicht van nieuwe makers, events en
                kennisartikelen
              </p>
            </div>
            <button
              onClick={() => setDigest((v) => !v)}
              className={`mt-0.5 h-5 w-10 shrink-0 rounded-full transition-colors ${digest ? "bg-primary" : "bg-hairline"}`}
              aria-label="Toggle wekelijkse samenvatting"
            />
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => updateUser.mutate({ weeklyDigestEnabled: digest })}
              disabled={updateUser.isPending || digest === weeklyDigest}
            >
              {updateUser.isPending ? <Spinner /> : "Opslaan"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
