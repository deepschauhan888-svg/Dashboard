"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { BreakdownRow } from "@/types/market";
import { formatNumber, formatPct, formatPsf, formatRatio } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Key = "label" | "demand" | "demandChange" | "supply" | "dsRatio" | "avgPrice" | "priceYoY" | "inventory";

const COLS: { key: Key; label: string; fmt: (r: BreakdownRow) => string }[] = [
  { key: "label", label: "Market", fmt: (r) => r.label },
  { key: "demand", label: "Demand", fmt: (r) => formatNumber(r.demand) },
  { key: "demandChange", label: "Δ Demand", fmt: (r) => formatPct(r.demandChange) },
  { key: "supply", label: "Supply", fmt: (r) => formatNumber(r.supply) },
  { key: "dsRatio", label: "D/S", fmt: (r) => formatRatio(r.dsRatio) },
  { key: "avgPrice", label: "Avg ₹/sq ft", fmt: (r) => formatPsf(r.avgPrice) },
  { key: "priceYoY", label: "Price YoY", fmt: (r) => formatPct(r.priceYoY) },
  { key: "inventory", label: "Inventory", fmt: (r) => formatNumber(r.inventory) },
];

/** Sortable comparative market table with inline magnitude bars. */
export function PerformanceTable({ rows, highlightId, onSelect }: { rows: BreakdownRow[]; highlightId?: string; onSelect?: (id: string) => void }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "demand", dir: -1 });
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sort.dir;
      return (((av as number | null) ?? -Infinity) - ((bv as number | null) ?? -Infinity)) * sort.dir;
    });
  }, [rows, sort]);
  const maxDemand = Math.max(1, ...rows.map((r) => r.demand));
  const maxDs = Math.max(1, ...rows.map((r) => r.dsRatio ?? 0));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[820px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line-strong">
            {COLS.map((c, i) => {
              const active = sort.key === c.key;
              return (
                <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-3 py-2.5 font-medium text-ink-2", i === 0 ? "text-left" : "text-right")}>
                  <button
                    type="button"
                    onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : c.key === "label" ? 1 : -1 }))}
                    className={cn("inline-flex items-center gap-1 hover:text-ink", active && "text-ink")}
                  >
                    {c.label}
                    {active ? sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className={cn("border-b border-line transition-colors", r.id === highlightId ? "bg-brand-tint" : "hover:bg-paper", onSelect && "cursor-pointer")}
              onClick={() => onSelect?.(r.id)}
            >
              <th scope="row" className="px-3 py-2.5 text-left font-medium text-ink">
                {onSelect ? (
                  <button type="button" className="hover:text-brand" onClick={(e) => { e.stopPropagation(); onSelect(r.id); }}>
                    {r.label}
                  </button>
                ) : (
                  r.label
                )}
              </th>
              <td className="px-3 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-mist sm:block" aria-hidden>
                    <div className="h-full rounded-full bg-ink/70" style={{ width: `${(r.demand / maxDemand) * 100}%` }} />
                  </div>
                  <span className="tabular text-ink">{formatNumber(r.demand)}</span>
                </div>
              </td>
              <td className={cn("px-3 py-2.5 text-right tabular", (r.demandChange ?? 0) >= 0 ? "text-positive" : "text-negative")}>{formatPct(r.demandChange)}</td>
              <td className="px-3 py-2.5 text-right tabular text-ink">{formatNumber(r.supply)}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-mist sm:block" aria-hidden>
                    <div className="h-full rounded-full bg-ink-3" style={{ width: `${((r.dsRatio ?? 0) / maxDs) * 100}%` }} />
                  </div>
                  <span className="tabular text-ink">{formatRatio(r.dsRatio)}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right tabular text-ink">{formatPsf(r.avgPrice)}</td>
              <td className={cn("px-3 py-2.5 text-right tabular", (r.priceYoY ?? 0) >= 0 ? "text-positive" : "text-negative")}>{formatPct(r.priceYoY)}</td>
              <td className="px-3 py-2.5 text-right tabular text-ink">{formatNumber(r.inventory)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function performanceTable(rows: BreakdownRow[]) {
  return { columns: COLS.map((c) => c.label), rows: rows.map((r) => COLS.map((c) => c.fmt(r))) };
}
