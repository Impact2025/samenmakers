"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-on-primary active:bg-primary transition-colors",
  secondary:
    "border border-on-surface bg-transparent text-on-surface hover:bg-on-surface hover:text-on-primary transition-colors",
  ghost:
    "bg-transparent text-on-surface underline underline-offset-4 hover:opacity-60 transition-opacity",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-label-caps",
  md: "px-8 py-4 text-label-caps",
  lg: "px-10 py-5 text-label-caps",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold tracking-widest uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
