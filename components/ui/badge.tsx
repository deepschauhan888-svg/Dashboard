import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "positive" | "negative" | "caution" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-haze text-subtle",
  signal: "bg-signal-500/12 text-signal-400 ring-1 ring-inset ring-signal-500/30",
  positive: "bg-positive/12 text-positive ring-1 ring-inset ring-positive/30",
  negative: "bg-negative/12 text-negative ring-1 ring-inset ring-negative/30",
  caution: "bg-caution/12 text-caution ring-1 ring-inset ring-caution/30",
  dark: "bg-white/[0.06] text-white/70 ring-1 ring-inset ring-white/10",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em]", tones[tone], className)}>
      {children}
    </span>
  );
}

/** The mandatory label on every surface that shows synthetic numbers. */
export function DemoDataBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs bg-caution/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-caution ring-1 ring-inset ring-caution/35",
        className,
      )}
      title="Synthetic demonstration data — not Magicbricks market statistics"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-caution" aria-hidden />
      {compact ? "Demo data" : "Demonstration data"}
    </span>
  );
}

export function PlaceholderBadge({ children = "Sample entry", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-xs border border-dashed border-current px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70", className)}>
      {children}
    </span>
  );
}
