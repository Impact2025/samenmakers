import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Eyebrow-pill boven de titel (bijv. "Cohort 2024"). */
  label?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  label,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn("mb-8 flex items-start justify-between gap-4", className)}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {label && (
          <span className="bg-primary-fixed text-on-primary-fixed text-label-sm mb-1 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 uppercase">
            <span className="bg-primary-container h-1.5 w-1.5 rounded-full" />
            {label}
          </span>
        )}
        <h1 className="text-headline-lg text-on-surface">{title}</h1>
        {description && (
          <p className="text-body-md text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
