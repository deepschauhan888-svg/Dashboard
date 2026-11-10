"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useMemo } from "react";
import { sparklineOption } from "@/lib/charts/options";
import { formatPct } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { EChart } from "@/components/charts/echart";

export function KpiCard({
  label,
  value,
  unit,
  change,
  changeLabel,
  deltaText,
  goodWhen = "up",
  spark,
  sparkColor,
  note,
  loading,
}: {
  label: string;
  value: string;
  unit?: string;
  change: number | null;
  changeLabel: string;
  /** replaces the % change chip with plain text (neutral tone) */
  deltaText?: string;
  goodWhen?: "up" | "down" | "neutral";
  spark?: (number | null)[];
  sparkColor: string;
  note?: string;
  loading?: boolean;
}) {
  const option = useMemo(() => (spark && spark.length > 1 ? sparklineOption(spark, sparkColor) : null), [spark, sparkColor]);
  const dir = change === null ? 0 : change > 0.05 ? 1 : change < -0.05 ? -1 : 0;
  const tone = deltaText ? "neutral" : dir === 0 || goodWhen === "neutral" ? "neutral" : (dir > 0) === (goodWhen === "up") ? "good" : "bad";
  const Icon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;

  return (
    <article className={cn("relative flex min-w-0 flex-col overflow-hidden rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60 transition-opacity", loading && "opacity-60")}>
      <div className="px-4 pt-4">
        <p className="eyebrow !text-[10px] text-muted">{label}</p>
        <p className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-mono text-[24px] leading-none tracking-tight text-white tabular">{value}</span>
          {unit && <span className="text-[12px] text-muted">{unit}</span>}
        </p>
        <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-xs px-1.5 py-0.5 font-mono",
              tone === "good" && "bg-positive/12 text-positive",
              tone === "bad" && "bg-negative/12 text-negative",
              tone === "neutral" && "bg-white/[0.06] text-white/70",
            )}
          >
            {!deltaText && <Icon className="h-3 w-3" aria-hidden />}
            {deltaText ?? (change === null ? "n/a" : formatPct(change))}
          </span>
          <span className="text-muted">{changeLabel}</span>
        </p>
      </div>
      <div className="mt-auto h-12 px-1 pb-1 pt-2" aria-hidden>
        {option && <EChart option={option} height={44} ariaLabel={`${label} trend`} />}
      </div>
      {note && <p className="border-t border-ink-600/50 px-4 py-2 text-[11px] text-muted">{note}</p>}
    </article>
  );
}
