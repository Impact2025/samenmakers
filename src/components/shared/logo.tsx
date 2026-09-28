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
      viewBox="93 62.5 396 396"
      fill="#dd026a"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="221" cy="122.7" r="27.1" />
      <circle cx="292.5" cy="195.6" r="27.1" />
      <circle cx="361.1" cy="260.4" r="27.1" />
      <circle cx="292.6" cy="333.6" r="27.1" />
      <circle cx="221.1" cy="398.3" r="27.1" />
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
