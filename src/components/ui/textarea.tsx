"use client";

import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { labelClasses, textareaClasses } from "@/components/ui/field-styles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

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
