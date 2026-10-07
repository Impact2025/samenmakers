"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { MoreHorizontal } from "lucide-react";

interface Props {
  userId: string;
  currentStatus: string;
  currentRole: string;
}

type Change = {
  label: string;
  confirm?: string; // aanwezig = eerst bevestigen
  danger?: boolean;
  run: () => void;
};

export function UserActions({ userId, currentStatus, currentRole }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Change | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const close = () => {
    setOpen(false);
    setPending(null);
  };
  const done = (msg?: string) => {
    void utils.admin.users.invalidate();
    setNotice(msg ?? null);
    close();
  };
  const onError = (e: { message: string }) => {
    setNotice(e.message);
    setPending(null);
  };

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => done(),
    onError,
  });
  const reset = trpc.admin.sendPasswordReset.useMutation({
    onSuccess: () => done("Resetlink verstuurd."),
    onError,
  });
  const verify = trpc.admin.markEmailVerified.useMutation({
    onSuccess: () => done("E-mailadres als bevestigd gemarkeerd."),
    onError,
  });

  const update = (data: Parameters<typeof updateUser.mutate>[0]) => () =>
    updateUser.mutate(data);

  const items: Change[] = [
    ...(currentStatus !== "suspended"
      ? [
          {
            label: "Schorsen",
            confirm: "Dit account kan niet meer inloggen tot je het activeert.",
            run: update({ id: userId, status: "suspended" }),
          },
        ]
      : [
          { label: "Activeren", run: update({ id: userId, status: "active" }) },
        ]),
    ...(currentStatus !== "banned"
      ? [
          {
            label: "Bannen",
            danger: true,
            confirm: "Dit account wordt geblokkeerd en kan niet meer inloggen.",
            run: update({ id: userId, status: "banned" }),
          },
        ]
      : []),
    ...(currentRole !== "admin"
      ? [
          {
            label: "Maak admin",
            danger: true,
            confirm:
              "Dit account krijgt volledige toegang tot alle gebruikersgegevens en de export.",
            run: update({ id: userId, role: "admin" }),
          },
        ]
      : [
          {
            label: "Adminrol intrekken",
            confirm: "Dit account verliest de toegang tot het beheer.",
            run: update({ id: userId, role: "user" }),
          },
        ]),
    {
      label: "Wachtwoord-reset sturen",
      run: () => reset.mutate({ id: userId }),
    },
    {
      label: "E-mail als bevestigd markeren",
      run: () => verify.mutate({ id: userId }),
    },
    {
      label: "Featured markeren",
      run: update({ id: userId, isFeatured: true }),
    },
    { label: "Verifiëren", run: update({ id: userId, isVerified: true }) },
  ];

  const row =
    "hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-secondary hover:text-on-surface p-1.5 transition-colors"
        aria-label="Opties"
      >
        <MoreHorizontal size={16} />
      </button>
      {notice && (
        <p
          role="status"
          className="text-label-sm text-secondary absolute right-0 mt-1 w-56 text-right"
        >
          {notice}
        </p>
      )}

      {open && (
        <div className="bg-surface-container-lowest shadow-card absolute top-full right-0 z-10 mt-1 min-w-56 rounded-2xl shadow-sm">
          {pending ? (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-label-lg text-on-surface">{pending.label}?</p>
              <p className="text-body-sm text-secondary">{pending.confirm}</p>
              <div className="flex gap-2">
                <button
                  className="bg-primary-container text-on-primary text-label-md rounded-full px-4 py-2"
                  onClick={pending.run}
                  disabled={updateUser.isPending}
                >
                  Bevestigen
                </button>
                <button
                  className="text-label-md text-secondary px-3 py-2"
                  onClick={() => setPending(null)}
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            items.map((it) => (
              <button
                key={it.label}
                className={`${row} ${it.danger ? "text-error" : ""}`}
                onClick={() => {
                  setNotice(null);
                  if (it.confirm) setPending(it);
                  else it.run();
                }}
              >
                {it.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
