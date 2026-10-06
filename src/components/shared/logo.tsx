import { cn } from "@/lib/utils";

/**
 * Beeldmerk van We Shape the Future: roze vierkant met vijf witte stippen.
 * Bron: het logo van de publieke site (public/brand/wstf-mark.svg).
 */
export function LogoMark({
  size = 32,
  className,
  tone = "color",
}: {
  size?: number;
  className?: string;
  /** "light" = wit vierkant met roze stippen, voor op een roze achtergrond. */
  tone?: "color" | "light";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={
        tone === "light" ? "/brand/wstf-mark-white.svg" : "/brand/wstf-mark.svg"
      }
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
  /** "light" = origineel witte logo, voor op een roze balk. */
  tone?: "color" | "light";
}

// Verhouding van het volledige logo (357 × 60).
const FULL_RATIO = 357 / 60;

export function Logo({
  size = 32,
  wordmark = "sm",
  className,
  tone = "color",
}: LogoProps) {
  const full = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={
        tone === "light" ? "/brand/wstf-logo-white.svg" : "/brand/wstf-logo.svg"
      }
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
          tone={tone}
          className={cn(wordmark === "sm" && "sm:hidden")}
        />
      )}
      {wordmark !== "never" && full}
    </span>
  );
}
