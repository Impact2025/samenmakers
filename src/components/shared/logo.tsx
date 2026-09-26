import { cn } from "@/lib/utils";

/** Beeldmerk: magenta tegel met vinkje. */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#d8006e" />
      <path
        d="M11 20.5l6.2 6.2L29 13.5"
        fill="none"
        stroke="#fff"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.3" cy="12.2" r="2.6" fill="#fff" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  /** Woordmerk tonen; standaard verborgen op heel smalle schermen. */
  wordmark?: "always" | "sm" | "never";
  className?: string;
}

export function Logo({ size = 32, wordmark = "sm", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {wordmark !== "never" && (
        <span
          className={cn(
            "font-display text-on-surface text-[17px] leading-none font-bold tracking-tight whitespace-nowrap",
            wordmark === "sm" && "hidden sm:inline",
          )}
        >
          We Shape the <span className="text-primary-container">Future</span>
        </span>
      )}
    </span>
  );
}
