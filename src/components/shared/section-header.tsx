import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number | string;
  icon?: React.ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  count,
  icon,
  viewAllHref,
  viewAllLabel = "Alles bekijken",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-3", className)}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="bg-secondary-container text-on-secondary-container flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-headline-sm text-on-surface">{title}</h2>
            {count !== undefined && (
              <span className="text-label-md text-secondary">{count}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-body-sm text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-label-md text-primary-container shrink-0 underline-offset-4 hover:underline"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
