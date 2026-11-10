import { cn } from "@/lib/utils/cn";

/**
 * Wordmark for MB Research Intelligence. The mark — a stepped bar rising into a
 * signal dot — is an original placeholder pending an approved brand mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("h-7 w-7", className)} aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="27" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <rect x="6" y="15" width="3" height="7" rx="1" fill="currentColor" fillOpacity="0.55" />
      <rect x="11" y="11" width="3" height="11" rx="1" fill="currentColor" fillOpacity="0.75" />
      <rect x="16" y="8" width="3" height="14" rx="1" fill="currentColor" />
      <circle cx="22.5" cy="6.5" r="2" fill="#318BFF" />
    </svg>
  );
}

export function Logo({ className, tone = "light", compact }: { className?: string; tone?: "light" | "dark"; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", tone === "light" ? "text-white" : "text-ink-900", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.02em]">MB RESEARCH</span>
        {!compact && <span className={cn("mt-1 font-mono text-[9.5px] tracking-[0.32em]", tone === "light" ? "text-signal-200/80" : "text-subtle")}>INTELLIGENCE</span>}
      </span>
    </span>
  );
}
