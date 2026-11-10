import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "positive" | "negative" | "caution";

const tones: Record<Tone, string> = {
  neutral: "bg-mist text-ink-2",
  brand: "bg-brand-tint text-brand",
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
  caution: "bg-caution/10 text-caution",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

/** Mandatory label wherever synthetic figures are displayed. */
export function DemoDataBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border border-caution/30 bg-caution/[0.06] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-caution", className)}
      title="Synthetic demonstration data — not Magicbricks market statistics"
    >
      {compact ? "Demo data" : "Demonstration data"}
    </span>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-xs border border-dashed border-line-strong px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-2", className)}>Sample entry</span>;
}
