"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-caps text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-b border-on-surface pb-2 text-body-lg text-on-surface placeholder:text-outline outline-none focus:border-b-2 transition-all",
            error && "border-error focus:border-error",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-body-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="text-body-sm text-outline">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
