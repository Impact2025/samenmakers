import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-24 text-center", className)}>
      <h3 className="text-headline-md text-on-surface mb-3">{title}</h3>
      {description && (
        <p className="text-body-lg text-outline max-w-sm mb-8">{description}</p>
      )}
      {action}
    </div>
  );
}
