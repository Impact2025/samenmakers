"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Gedeelde veldstijl: 50px, gevuld, magenta focusring. Ook voor <select>. */
export const fieldClasses =
  "w-full h-[50px] px-4 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-secondary border border-transparent outline-none transition-all focus:bg-surface-container-lowest focus:border-primary-container focus:ring-[3px] focus:ring-primary-container/15 disabled:opacity-50";

export const labelClasses = "text-label-lg text-on-surface";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            fieldClasses,
            error && "border-error focus:border-error focus:ring-error/15",
            className,
          )}
          {...props}
        />
        {error && <p className="text-body-sm text-error">{error}</p>}
        {hint && !error && (
          <p className="text-body-sm text-secondary">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
