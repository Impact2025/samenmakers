import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "date";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "border border-hairline text-on-surface-variant",
  primary: "bg-primary-container text-on-primary",
  date: "bg-on-surface text-on-primary",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-label-caps",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tracking-widest uppercase leading-none",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
