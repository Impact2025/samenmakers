import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border border-hairline bg-white",
        hover && "hover:border-on-surface transition-colors",
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
  return (
    <div className={cn("p-6 hairline-b", className)}>{children}</div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
