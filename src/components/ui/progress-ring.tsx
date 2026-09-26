import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percent: number;
  size?: number;
  children?: React.ReactNode;
  className?: string;
}

/** Cirkelvormige voortgang (Leertraject-kaart). */
export function ProgressRing({
  percent,
  size = 64,
  children,
  className,
}: ProgressRingProps) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-surface-variant"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${value}, 100`}
          className="text-primary-container transition-[stroke-dasharray] duration-700"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
