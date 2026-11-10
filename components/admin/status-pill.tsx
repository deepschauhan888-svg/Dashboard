import { cn } from "@/lib/utils/cn";

const TONES = {
  good: "bg-positive/12 text-positive ring-positive/30",
  bad: "bg-negative/12 text-negative ring-negative/30",
  warn: "bg-caution/12 text-caution ring-caution/30",
  info: "bg-brand-tint text-brand ring-brand/40",
  muted: "bg-mist text-ink-2 ring-line",
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-xs px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.1em] ring-1 ring-inset", TONES[tone])}>{children}</span>;
}

export function uploadTone(s: string): keyof typeof TONES {
  if (s === "published") return "good";
  if (s === "failed") return "bad";
  if (s === "validated") return "info";
  if (s === "rolled_back") return "warn";
  return "muted";
}
