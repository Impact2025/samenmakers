import { ChipLink, ChipRow } from "@/components/ui/chip";
import { POST_CATEGORIES } from "@/lib/constants";

export function KennisFilters({
  activeCategory,
  search,
}: {
  activeCategory?: string;
  search?: string;
}) {
  const href = (cat: string | null) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (search) params.set("search", search);
    const s = params.toString();
    return s ? `/kennis?${s}` : "/kennis";
  };

  return (
    <ChipRow>
      <ChipLink href={href(null)} active={!activeCategory}>
        Alles
      </ChipLink>
      {POST_CATEGORIES.map(({ value, label }) => (
        <ChipLink
          key={value}
          href={href(value)}
          active={activeCategory === value}
        >
          {label}
        </ChipLink>
      ))}
    </ChipRow>
  );
}
