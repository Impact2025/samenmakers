"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="bg-surface-container-lowest text-label-lg text-error shadow-card hover:bg-error-container hover:text-on-error-container flex h-12 w-full items-center justify-center gap-2 rounded-full transition-colors"
    >
      <LogOut size={18} />
      Uitloggen
    </button>
  );
}
