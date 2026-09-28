import { cn } from "@/lib/utils";

/** Beeldmerk: vijf magenta stippen die samen een pijl/chevron vormen. */
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
      viewBox="10 6.5 46 46"
      fill="#e6007d"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="25" cy="13.6" r="3.2" />
      <circle cx="33.1" cy="22.1" r="3.2" />
      <circle cx="41" cy="29.5" r="3.2" />
      <circle cx="33.2" cy="37.8" r="3.2" />
      <circle cx="24.9" cy="45.3" r="3.2" />
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
