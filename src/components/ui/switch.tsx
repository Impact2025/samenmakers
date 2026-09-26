"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors disabled:opacity-40",
        checked ? "bg-primary-container" : "bg-secondary-container",
        className,
      )}
    >
      <span
        className={cn(
          "bg-surface-container-lowest block h-6 w-6 rounded-full shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
