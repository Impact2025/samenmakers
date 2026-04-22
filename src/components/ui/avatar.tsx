import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<AvatarSize, { px: number; className: string }> = {
  xs: { px: 32, className: "w-8 h-8 text-[10px]" },
  sm: { px: 48, className: "w-12 h-12 text-xs" },
  md: { px: 64, className: "w-16 h-16 text-sm" },
  lg: { px: 96, className: "w-24 h-24 text-base" },
  xl: { px: 128, className: "w-32 h-32 text-lg" },
};

interface AvatarProps {
  src?: string | null | undefined;
  naam: string;
  size?: AvatarSize;
  grayscale?: boolean;
  className?: string;
}

export function Avatar({
  src,
  naam,
  size = "md",
  grayscale = true,
  className,
}: AvatarProps) {
  const { px, className: sizeClass } = sizes[size];

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-surface-container-high flex-shrink-0 flex items-center justify-center",
        sizeClass,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={naam}
          width={px}
          height={px}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            grayscale && "grayscale group-hover:grayscale-0",
          )}
        />
      ) : (
        <span className="font-semibold text-outline select-none">
          {initials(naam)}
        </span>
      )}
    </div>
  );
}
