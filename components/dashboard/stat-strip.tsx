import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatPct } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface Stat {
  label: string;
  value: string;
  unit?: string;
  /** % change; omit to show `note` instead */
  change?: number | null;
  changeLabel?: string;
  /** whether an increase is favourable, unfavourable or neither */
  goodWhen?: "up" | "down" | "neutral";
  note?: string;
}

/**
 * One horizontal band of headline figures separated by hairlines — the
 * workspace's alternative to a wall of KPI cards.
 */
export function StatStrip({ stats, loading, className }: { stats: Stat[]; loading?: boolean; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 border-y border-line sm:grid-cols-3", stats.length >= 6 ? "xl:grid-cols-6" : stats.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4", loading && "opacity-60", className)}>
      {stats.map((s, i) => (
        <div key={s.label} className={cn("px-1 py-5 sm:px-5", i > 0 && "sm:border-l sm:border-line", "first:pl-0")}>
          <dt className="text-[12px] text-ink-2">{s.label}</dt>
          <dd className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[24px] font-semibold tabular tracking-tight text-ink sm:text-[26px]">{s.value}</span>
            {s.unit && <span className="text-[12px] text-ink-2">{s.unit}</span>}
          </dd>
          <dd className="mt-1.5 text-[12px] text-ink-2">{s.change !== undefined ? <Change value={s.change} goodWhen={s.goodWhen} label={s.changeLabel} /> : s.note}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Change({ value, goodWhen = "up", label }: { value: number | null; goodWhen?: "up" | "down" | "neutral"; label?: string }) {
  if (value === null) return <span className="text-ink-2">— {label}</span>;
  const dir = value > 0.05 ? 1 : value < -0.05 ? -1 : 0;
  const tone = dir === 0 || goodWhen === "neutral" ? "neutral" : (dir > 0) === (goodWhen === "up") ? "good" : "bad";
  const Icon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={cn("inline-flex items-center gap-0.5 font-medium tabular", tone === "good" && "text-positive", tone === "bad" && "text-negative", tone === "neutral" && "text-ink")}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {formatPct(value)}
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
