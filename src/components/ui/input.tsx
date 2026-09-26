"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { fieldClasses, labelClasses } from "@/components/ui/field-styles";

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
