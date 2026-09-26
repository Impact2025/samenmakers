import Link from "next/link";
import { cn } from "@/lib/utils";

type ChipTone = "dark" | "primary";

interface ChipBaseProps {
  active?: boolean;
  /** Kleur van de actieve staat: charcoal (filters) of magenta (feed/urgent). */
  tone?: ChipTone;
  children: React.ReactNode;
  className?: string;
}

export function chipClasses(
  active = false,
  tone: ChipTone = "dark",
  className?: string,
) {
  return cn(
    "shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-label-md whitespace-nowrap transition-all active:scale-95",
    active
      ? tone === "primary"
        ? "bg-primary-container text-on-primary shadow-sm"
        : "bg-on-surface text-surface-container-lowest"
      : "bg-surface-container-low text-secondary hover:text-on-surface",
    className,
  );
}

export function Chip({
  active,
  tone,
  children,
  className,
  ...props
}: ChipBaseProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={chipClasses(active, tone, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ChipLink({
  href,
  active,
  tone,
  children,
  className,
}: ChipBaseProps & { href: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={chipClasses(active, tone, className)}
    >
      {children}
    </Link>
  );
}

/** Horizontaal scrollende rij, loopt door tot de schermrand op mobiel. */
export function ChipRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 py-1 lg:mx-0 lg:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
