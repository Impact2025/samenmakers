import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percent: number;
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressBar({
  percent,
  color,
  label,
  className,
}: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Voortgang"}
      className={cn(
        "bg-surface-container h-2 w-full overflow-hidden rounded-full",
        className,
      )}
    >
      <div
        className="bg-primary-container h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${value}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}
