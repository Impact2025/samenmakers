import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<
  AvatarSize,
  { px: number; className: string; dot: string }
> = {
  xs: { px: 32, className: "w-8 h-8 text-label-sm", dot: "w-2.5 h-2.5" },
  sm: { px: 48, className: "w-12 h-12 text-sm", dot: "w-3 h-3" },
  md: { px: 64, className: "w-16 h-16 text-base", dot: "w-3.5 h-3.5" },
  lg: { px: 96, className: "w-24 h-24 text-xl", dot: "w-4 h-4" },
  xl: { px: 128, className: "w-32 h-32 text-2xl", dot: "w-5 h-5" },
};

interface AvatarProps {
  src?: string | null | undefined;
  naam: string;
  size?: AvatarSize;
  /** Legacy: het nieuwe ontwerp toont foto's in kleur. */
  grayscale?: boolean;
  /** Statusstip rechtsonder (bijv. online / mentor). */
  status?: "online" | "lead" | null;
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  naam,
  size = "md",
  grayscale = false,
  status,
  ring,
  className,
}: AvatarProps) {
  const { px, className: sizeClass, dot } = sizes[size];

  return (
    <div className={cn("relative flex-shrink-0", sizeClass, className)}>
      <div
        className={cn(
          "bg-primary-fixed flex h-full w-full items-center justify-center overflow-hidden rounded-full",
          ring && "ring-surface-variant ring-2",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={naam}
            width={px}
            height={px}
            className={cn(
              "h-full w-full object-cover",
              grayscale && "grayscale",
            )}
          />
        ) : (
          <span className="font-display text-on-primary-fixed-variant font-bold select-none">
            {initials(naam)}
          </span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "ring-surface-container-lowest absolute right-0 bottom-0 rounded-full ring-2",
            dot,
            status === "online" ? "bg-tertiary" : "bg-primary-container",
          )}
        />
      )}
    </div>
  );
}
