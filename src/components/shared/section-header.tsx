import Link from "next/link";
import { Hairline } from "@/components/ui/hairline";

interface SectionHeaderProps {
  title: string;
  count?: number | string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeader({
  title,
  count,
  viewAllHref,
  viewAllLabel = "BEKIJK ALLES",
}: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end pb-4 hairline-b mb-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        {count !== undefined && (
          <span className="text-label-caps text-outline">{count}</span>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-label-caps text-outline hover:text-on-surface border-b border-on-surface pb-0.5 transition-colors"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
