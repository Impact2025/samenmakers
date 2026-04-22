import { cn } from "@/lib/utils";

interface PageHeaderProps {
  label?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ label, title, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-16", className)}>
      {label && (
        <p className="text-label-caps text-primary-container mb-2">{label}</p>
      )}
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-headline-lg text-on-surface">{title}</h1>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
