/** Tabular equivalents of charts — used for the table view and CSV export. */
import type { BreakdownRow, TrendPoint } from "@/types/market";
import type { TableData } from "@/components/charts/chart-panel";
import { round } from "@/lib/utils/format";

export function trendTable(points: TrendPoint[]): TableData {
  return {
    columns: ["Quarter", "Demand", "Supply", "Market gap", "D/S ratio", "Avg ₹/sq ft", "Price YoY %", "Inventory"],
    rows: points.map((p) => [
      p.label,
      p.demand,
      p.supply,
      p.demand - p.supply,
      p.dsRatio === null ? null : round(p.dsRatio, 2),
      p.avgPrice === null ? null : Math.round(p.avgPrice),
      p.priceYoY === null ? null : round(p.priceYoY, 1),
      p.inventory,
    ]),
  };
}

export function breakdownTable(rows: BreakdownRow[], dimLabel: string): TableData {
  return {
    columns: [dimLabel, "Demand", "Supply", "Demand share %", "Supply share %", "Gap (pp)", "Avg ₹/sq ft", "Price YoY %", "Δ demand %"],
    rows: rows.map((r) => [
      r.label,
      r.demand,
      r.supply,
      round(r.demandShare, 1),
      round(r.supplyShare, 1),
      round(r.gapPp, 1),
      r.avgPrice === null ? null : Math.round(r.avgPrice),
      r.priceYoY === null ? null : round(r.priceYoY, 1),
      r.demandChange === null ? null : round(r.demandChange, 1),
    ]),
  };
}
