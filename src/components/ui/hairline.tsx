import { cn } from "@/lib/utils";

interface HairlineProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Hairline({
  orientation = "horizontal",
  className,
}: HairlineProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn("w-px bg-hairline self-stretch", className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn("border-0 border-t border-hairline w-full", className)}
    />
  );
}
