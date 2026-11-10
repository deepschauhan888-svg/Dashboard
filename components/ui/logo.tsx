import { cn } from "@/lib/utils/cn";

/**
 * Wordmark for MB Research Intelligence. The mark — three rising bars with a
 * red keystone — is an original placeholder pending an approved brand mark.
 */
export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  const bar = inverse ? "#FFFFFF" : "#252525";
  return (
    <svg viewBox="0 0 28 28" className={cn("h-7 w-7", className)} aria-hidden>
      <rect x="5" y="15" width="4" height="8" fill={bar} fillOpacity="0.45" />
      <rect x="12" y="10" width="4" height="13" fill={bar} fillOpacity="0.75" />
      <rect x="19" y="5" width="4" height="18" fill={bar} />
      <rect x="19" y="5" width="4" height="4" fill="#B5122B" />
    </svg>
  );
}

export function Logo({ className, inverse, compact }: { className?: string; inverse?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", inverse ? "text-white" : "text-ink", className)}>
      <LogoMark inverse={inverse} />
      <span className="flex flex-col leading-none">
        <span className="text-[14px] font-semibold tracking-[0.04em]">MB RESEARCH</span>
        {!compact && <span className={cn("mt-1 text-[9.5px] font-medium tracking-[0.3em]", inverse ? "text-white/60" : "text-brand")}>INTELLIGENCE</span>}
      </span>
    </span>
  );
}
