import { cn } from "@/lib/utils";

/**
 * Beeldmerk van We Shape the Future: roze vierkant met vijf witte stippen.
 * Bron: het logo van de publieke site (public/brand/wstf-mark.svg).
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/wstf-mark.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={cn("shrink-0", className)}
    />
  );
}

interface LogoProps {
  /** Hoogte van het logo in px. */
  size?: number;
  /** Volledig logo (met woordmerk) tonen; "sm" = alleen beeldmerk op heel smalle schermen. */
  wordmark?: "always" | "sm" | "never";
  className?: string;
}

// Verhouding van het volledige logo (357 × 60).
const FULL_RATIO = 357 / 60;

export function Logo({ size = 32, wordmark = "sm", className }: LogoProps) {
  const full = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/wstf-logo.svg"
      width={Math.round(size * FULL_RATIO)}
      height={size}
      alt="We Shape the Future"
      className={cn("shrink-0", wordmark === "sm" && "hidden sm:block")}
    />
  );

  return (
    <span className={cn("inline-flex items-center", className)}>
      {wordmark !== "always" && (
        <LogoMark
          size={size}
          className={cn(wordmark === "sm" && "sm:hidden")}
        />
      )}
      {wordmark !== "never" && full}
    </span>
  );
}
