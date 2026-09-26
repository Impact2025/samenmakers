"use client";

import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { labelClasses } from "@/components/ui/input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const textareaClasses =
  "w-full px-4 py-3 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-secondary border border-transparent outline-none transition-all resize-none focus:bg-surface-container-lowest focus:border-primary-container focus:ring-[3px] focus:ring-primary-container/15";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            textareaClasses,
            error && "border-error focus:border-error",
            className,
          )}
          rows={4}
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

Textarea.displayName = "Textarea";
