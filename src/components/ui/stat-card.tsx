import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "tertiary";

const iconTones: Record<Tone, string> = {
  neutral: "bg-secondary-container text-on-secondary-container",
  primary: "bg-primary-fixed text-on-primary-fixed-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

const valueTones: Record<Tone, string> = {
  neutral: "text-on-surface",
  primary: "text-primary-container",
  tertiary: "text-tertiary",
};

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  tone?: Tone;
  href?: string;
  className?: string;
}

/** KPI-tegel: groot getal + ronde icoon-badge + label. */
export function StatCard({
  value,
  label,
  icon,
  tone = "neutral",
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className={cn("text-display-lg", valueTones[tone])}>{value}</span>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              iconTones[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-body-sm text-secondary mt-2">{label}</p>
    </>
  );
  const cls = cn(
    "p-4 rounded-2xl bg-surface-container-lowest shadow-card flex flex-col justify-between",
    className,
  );
  return href ? (
    <Link
      href={href}
      className={cn(cls, "hover:shadow-elevated transition-shadow")}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Afgeronde icoon-tegel (hubs, taken, modules). */
export function IconTile({
  children,
  tone = "primary",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary-container/10 text-primary-container",
    tertiary: "bg-tertiary/10 text-tertiary",
    neutral: "bg-surface-container text-primary-container",
    secondary: "bg-secondary-container text-secondary",
  } as const;
  const sizes = {
    sm: "w-9 h-9 rounded-full",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-xl",
  } as const;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
