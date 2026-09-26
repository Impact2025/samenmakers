import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tonal"
  | "dark"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-on-primary shadow-cta hover:brightness-105",
  secondary:
    "bg-surface-container-lowest text-on-surface border border-surface-container hover:bg-surface-container-low",
  tonal:
    "bg-surface-container-high text-primary-container hover:bg-primary-container hover:text-on-primary",
  dark: "bg-on-surface text-surface-container-lowest hover:opacity-90",
  ghost: "bg-transparent text-secondary hover:text-primary-container",
  danger:
    "bg-surface-container-lowest text-error shadow-card hover:bg-error-container hover:text-on-error-container",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 gap-1.5 text-label-md",
  md: "h-11 px-5 gap-2 text-label-lg",
  lg: "h-12 px-6 gap-2 text-label-lg",
  icon: "h-11 w-11 text-label-lg",
};

/** Klassen voor een knop-uiterlijk, ook bruikbaar op <Link>. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-full cursor-pointer select-none whitespace-nowrap",
    "transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
    variants[variant],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
