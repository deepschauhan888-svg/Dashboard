import { cn } from "@/lib/utils/cn";

/**
 * Typographic product wordmark for MB Research Intelligence — the platform's
 * primary identity. Official partner marks (MB Research, Magicbricks) are shown
 * separately from their supplied image files; see lib/config/site.ts → logos.
 */
export function Logo({ className, inverse, size = "md" }: { className?: string; inverse?: boolean; size?: "md" | "lg" }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", inverse ? "text-white" : "text-ink", className)}>
      <span className={cn("font-semibold tracking-[0.02em]", size === "lg" ? "text-[17px] sm:text-[19px]" : "text-[15px]")}>MB Research</span>
      <span className={cn("mt-1 font-semibold text-brand", size === "lg" ? "text-[10px] tracking-[0.34em] sm:text-[11px]" : "text-[9.5px] tracking-[0.32em]")}>INTELLIGENCE</span>
    </span>
  );
}
