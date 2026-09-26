import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "solid"
  | "tertiary"
  | "secondary"
  | "error"
  | "date";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Pulserende stip vóór de tekst (live/actief). */
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-container text-on-surface",
  primary: "bg-primary-fixed text-on-primary-fixed",
  solid: "bg-primary-container text-on-primary",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  secondary: "bg-secondary-container text-on-secondary-container",
  error: "bg-error-container text-on-error-container",
  date: "bg-on-surface text-surface-container-lowest",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-label-sm uppercase",
  md: "px-3 py-1 text-label-md",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span className="bg-primary-container h-1.5 w-1.5 animate-pulse rounded-full" />
      )}
      {children}
    </span>
  );
}
