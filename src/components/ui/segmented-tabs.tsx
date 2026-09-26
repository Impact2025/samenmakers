import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SegmentedTab {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  href?: string;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  active: string;
  onChange?: (key: string) => void;
  className?: string;
}

/** Pil-vormige tabwissel (Evenementen: Aankomend / Mijn aanmeldingen). */
export function SegmentedTabs({
  tabs,
  active,
  onChange,
  className,
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "bg-surface-container-low flex gap-1 rounded-full p-1",
        className,
      )}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        const cls = cn(
          "flex-1 shrink-0 h-9 px-3 rounded-full text-label-md flex items-center justify-center gap-1.5 transition-all whitespace-nowrap",
          isActive
            ? "bg-primary-container text-on-primary shadow-sm"
            : "text-secondary hover:text-on-surface",
        );
        const inner = (
          <>
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  "text-label-sm rounded-full px-1.5",
                  isActive
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-surface-container-highest text-primary-container",
                )}
              >
                {t.count}
              </span>
            )}
          </>
        );
        return t.href ? (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={cls}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cls}
            onClick={() => onChange?.(t.key)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
