import Image from "next/image";
import { cn } from "@/lib/utils";

interface GrayscaleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: true;
  className?: string;
  sizes?: string;
}

export function GrayscaleImage({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  className,
  sizes,
}: GrayscaleImageProps) {
  const imageProps = fill
    ? { fill: true as const }
    : { width: width ?? 400, height: height ?? 400 };

  return (
    <Image
      src={src}
      alt={alt}
      {...imageProps}
      {...(priority ? { priority } : {})}
      {...(sizes ? { sizes } : {})}
      className={cn(
        "object-cover grayscale group-hover:grayscale-0 transition-all duration-500",
        className,
      )}
    />
  );
}
