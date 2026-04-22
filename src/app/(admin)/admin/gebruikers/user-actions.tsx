"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { MoreHorizontal } from "lucide-react";

interface Props {
  userId: string;
  currentStatus: string;
  currentRole: string;
}

export function UserActions({ userId, currentStatus, currentRole }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
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
        className="p-1.5 text-outline hover:text-on-surface transition-colors"
        aria-label="Opties"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-hairline shadow-sm z-10 min-w-48">
          {currentStatus !== "suspended" && (
            <button
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low"
              onClick={() => updateUser.mutate({ id: userId, status: "suspended" })}
            >
              Schorsen
            </button>
          )}
          {currentStatus === "suspended" && (
            <button
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low"
              onClick={() => updateUser.mutate({ id: userId, status: "active" })}
            >
              Activeren
            </button>
          )}
          {currentStatus !== "banned" && (
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-surface-container-low"
              onClick={() => updateUser.mutate({ id: userId, status: "banned" })}
            >
              Bannen
            </button>
          )}
          {currentRole !== "admin" && (
            <button
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low"
              onClick={() => updateUser.mutate({ id: userId, role: "admin" })}
            >
              Maak admin
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low"
            onClick={() => updateUser.mutate({ id: userId, isFeatured: true })}
          >
            Featured markeren
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low"
            onClick={() => updateUser.mutate({ id: userId, isVerified: true })}
          >
            Verifiëren
          </button>
        </div>
      )}
    </div>
  );
}
