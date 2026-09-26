import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-low flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="bg-surface-container-lowest text-primary-container shadow-card mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-headline-sm text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-body-md text-secondary mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
