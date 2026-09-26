"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { MoreHorizontal } from "lucide-react";

interface Props {
  userId: string;
  currentStatus: string;
  currentRole: string;
}

export function UserActions({ userId, currentStatus, currentRole }: Props) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      void utils.admin.users.invalidate();
      setOpen(false);
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-secondary hover:text-on-surface p-1.5 transition-colors"
        aria-label="Opties"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="border-hairline absolute top-full right-0 z-10 mt-1 min-w-48 border bg-white shadow-sm">
          {currentStatus !== "suspended" && (
            <button
              className="hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
              onClick={() =>
                updateUser.mutate({ id: userId, status: "suspended" })
              }
            >
              Schorsen
            </button>
          )}
          {currentStatus === "suspended" && (
            <button
              className="hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
              onClick={() =>
                updateUser.mutate({ id: userId, status: "active" })
              }
            >
              Activeren
            </button>
          )}
          {currentStatus !== "banned" && (
            <button
              className="text-error hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
              onClick={() =>
                updateUser.mutate({ id: userId, status: "banned" })
              }
            >
              Bannen
            </button>
          )}
          {currentRole !== "admin" && (
            <button
              className="hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
              onClick={() => updateUser.mutate({ id: userId, role: "admin" })}
            >
              Maak admin
            </button>
          )}
          <button
            className="hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
            onClick={() => updateUser.mutate({ id: userId, isFeatured: true })}
          >
            Featured markeren
          </button>
          <button
            className="hover:bg-surface-container-low w-full px-4 py-2.5 text-left text-sm"
            onClick={() => updateUser.mutate({ id: userId, isVerified: true })}
          >
            Verifiëren
          </button>
        </div>
      )}
    </div>
  );
}
