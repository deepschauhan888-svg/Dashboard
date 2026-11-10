import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { ArchitectureIllustration } from "./architecture-illustration";

/**
 * Photography slot. Renders the approved photograph when configured in
 * lib/config/site.ts; otherwise a fine-line architectural illustration.
 */
export function ImageSlot({
  src,
  alt,
  className,
  variant = "skyline",
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src: string | null;
  alt: string;
  className?: string;
  variant?: "skyline" | "facade" | "plan";
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-sm bg-paper", className?.includes("absolute") ? "" : "relative", className)}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} priority={priority} />
      ) : (
        <ArchitectureIllustration variant={variant} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
