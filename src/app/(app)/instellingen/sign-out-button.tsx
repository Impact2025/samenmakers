"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="flex items-center gap-3 w-full px-5 py-4 border border-hairline bg-white text-outline hover:text-red-600 hover:border-red-200 transition-colors"
    >
      <LogOut size={18} />
      <span className="font-semibold text-sm">Uitloggen</span>
    </button>
  );
}
