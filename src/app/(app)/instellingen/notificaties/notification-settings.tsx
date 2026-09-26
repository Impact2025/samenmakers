"use client";

import { useState } from "react";
import { BellRing, Mail, Smartphone } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const card =
  "flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-card";

function CardTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="text-on-surface flex items-center gap-2">
      <span className="text-secondary">{icon}</span>
      <h2 className="text-title-md">{children}</h2>
    </div>
  );
}

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
    <div className="flex flex-col gap-4">
      <section className={card}>
        <CardTitle icon={<BellRing size={20} />}>In-app meldingen</CardTitle>
        <div className="flex flex-col gap-4">
          {notifSettings.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-label-lg text-on-surface">{label}</p>
                <p className="text-body-sm text-secondary">{description}</p>
              </div>
              <span className="bg-tertiary/10 text-label-sm text-tertiary shrink-0 rounded-full px-2.5 py-1">
                Altijd aan
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <CardTitle icon={<Smartphone size={20} />}>Browsermeldingen</CardTitle>
        {permission === "denied" ? (
          <p className="text-body-md text-secondary">
            Browsermeldingen zijn geblokkeerd. Pas dit aan in je
            browser-instellingen.
          </p>
        ) : subscribed ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-label-lg text-on-surface">
                Pushmeldingen actief
              </p>
              <p className="text-body-sm text-secondary">
                Je ontvangt meldingen via je browser.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void unsubscribe()}
            >
              Uitschakelen
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-label-lg text-on-surface">Pushmeldingen</p>
              <p className="text-body-sm text-secondary">
                Ontvang directe meldingen in je browser, ook als We Shape the
                Future niet open is.
              </p>
            </div>
            <Button size="sm" onClick={() => void subscribe()}>
              Inschakelen
            </Button>
          </div>
        )}
      </section>

      <section className={card}>
        <CardTitle icon={<Mail size={20} />}>E-mail</CardTitle>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-label-lg text-on-surface">
              Wekelijkse samenvatting
            </p>
            <p className="text-body-sm text-secondary">
              Elke maandag een overzicht van nieuwe makers, events en
              kennisartikelen
            </p>
          </div>
          <Switch
            checked={digest}
            onCheckedChange={setDigest}
            label="Wekelijkse samenvatting"
          />
        </div>
        <Button
          className="self-end"
          onClick={() => updateUser.mutate({ weeklyDigestEnabled: digest })}
          disabled={updateUser.isPending || digest === weeklyDigest}
        >
          {updateUser.isPending ? <Spinner size="sm" /> : "Opslaan"}
        </Button>
      </section>
    </div>
  );
}
