import { cn } from "@/lib/utils";

type CardVariant = "elevated" | "low" | "flat";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** elevated: wit met zachte schaduw · low: getint vlak · flat: wit zonder schaduw */
  variant?: CardVariant;
  hover?: boolean;
  onClick?: () => void;
}

const variants: Record<CardVariant, string> = {
  elevated: "bg-surface-container-lowest shadow-card",
  low: "bg-surface-container-low",
  flat: "bg-surface-container-lowest border border-hairline",
};

export function Card({
  children,
  className,
  variant = "elevated",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-2xl",
        variants[variant],
        hover && "hover:shadow-elevated transition-shadow duration-200",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 pt-5 pb-3", className)}>{children}</div>;
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
