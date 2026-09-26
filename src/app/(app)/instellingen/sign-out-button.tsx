"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="text-secondary hover:text-error bg-surface-container-lowest shadow-card flex w-full items-center gap-3 rounded-2xl px-5 py-4 transition-colors hover:border-red-200"
    >
      <LogOut size={18} />
      <span className="text-sm font-semibold">Uitloggen</span>
    </button>
  );
}
