"use client";

import { useMemo, useState } from "react";
import type { BhkConfiguration, BreakdownRow } from "@/types/market";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { gapOption, heatmapOption, shareComparisonOption, shareTrendOption, volumeBarsOption } from "@/lib/charts/options";
import { breakdownTable } from "@/lib/charts/tables";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { formatNumber, formatPct, formatPp, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { SectionTitle, WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useViewFilters } from "@/components/dashboard/workspace-context";

const CATS = (["1BHK", "2BHK", "3BHK", "4BHK+"] as BhkConfiguration[]).map((b) => ({ id: b, label: BHK_LABELS[b] }));

export function BhkModule() {
  const { filters, key } = useViewFilters("bhk");
  const svc = getMarketDataService();
  const [heatDim, setHeatDim] = useState<"ticket" | "size">("ticket");

  const { data, loading } = useAsync(async () => {
    const [bhk, shares, kpis] = await Promise.all([svc.getBreakdown(filters, "bhk"), svc.getShareTrend(filters, "bhk", 8), svc.getKpis(filters)]);
    return { bhk, shares, kpis };
  }, [key]);
  const { data: cross, loading: crossLoading } = useAsync(() => svc.getCrossTab(filters, "bhk", heatDim), [key, heatDim]);

  const empty = !!data && data.kpis.current.recordCount === 0;

  const opts = useMemo(() => {
    if (!data) return null;
    return {
      volume: volumeBarsOption(data.bhk),
      share: shareComparisonOption(data.bhk),
      gap: gapOption(data.bhk),
      demandShift: shareTrendOption(data.shares.map((s) => s.label), CATS, (id) => data.shares.map((s) => s.demandShare[id] ?? 0)),
    };
  }, [data]);

  const heat = useMemo(() => {
    if (!cross) return null;
    const cols = cross.cols.map((c) => c.label);
    return heatmapOption(
      cols,
      cross.rows.map((r) => r.label),
      cross.cells.map((c) => ({ x: c.x, y: c.y, value: c.demand + c.supply > 0 ? c.gapPp : null, detail: `Demand ${c.demandShare.toFixed(1)}% · supply ${c.supplyShare.toFixed(1)}% of total` })),
      { diverging: true, format: (v) => formatPp(v), seriesName: "Gap (demand − supply)" },
    );
  }, [cross]);

  const tbl = data ? breakdownTable(data.bhk, "Configuration") : undefined;
  const shiftTbl: TableData | undefined = data
    ? { columns: ["Quarter", ...CATS.flatMap((c) => [`${c.label} demand %`, `${c.label} supply %`])], rows: data.shares.map((s) => [s.label, ...CATS.flatMap((c) => [round(s.demandShare[c.id] ?? 0, 1), round(s.supplyShare[c.id] ?? 0, 1)])]) }
    : undefined;
  const heatTbl: TableData | undefined = cross
    ? { columns: ["Configuration", ...cross.cols.map((c) => `${c.label} gap (pp)`)], rows: cross.rows.map((r, y) => [r.label, ...cross.cols.map((_, x) => round(cross.cells.find((c) => c.x === x && c.y === y)?.gapPp ?? 0, 2))]) }
    : undefined;
  useRegisterExport("Configuration — demand vs supply", tbl);
  useRegisterExport("Configuration — quarterly mix", shiftTbl);
  useRegisterExport("Configuration × budget gap", heatTbl);

  return (
    <div>
      <WorkspacePageHeader kicker="Analyst · BHK" title="BHK-wise Analysis" description="1, 2, 3 and 4+ BHK compared on demand, supply, price and the gap between what buyers want and what is being built." />

      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[720px] border-y border-line text-[13.5px] transition-opacity", loading && "opacity-60")}>
          <thead>
            <tr className="text-left text-[12px] text-ink-2">
              <th scope="col" className="py-3 pr-4 font-medium">Configuration</th>
              {["Demand", "Share", "Supply", "Share", "Gap", "D ÷ S", "Avg ₹/sq ft", "Price YoY"].map((h, i) => (
                <th key={i} scope="col" className="px-3 py-3 text-right font-medium">{h}</th>
              ))}
              <th scope="col" className="py-3 pl-4 text-right font-medium">Position</th>
            </tr>
          </thead>
          <tbody>
            {((data?.bhk ?? CATS.map(() => null)) as (BreakdownRow | null)[]).map((r, i) => (
              <tr key={r?.id ?? i} className="border-t border-line">
                <th scope="row" className="py-3 pr-4 text-left text-[15px] font-semibold">{r?.label ?? CATS[i].label}</th>
                <td className="px-3 py-3 text-right tabular">{formatNumber(r?.demand)}</td>
                <td className="px-3 py-3 text-right tabular text-ink-2">{r ? `${r.demandShare.toFixed(1)}%` : "—"}</td>
                <td className="px-3 py-3 text-right tabular">{formatNumber(r?.supply)}</td>
                <td className="px-3 py-3 text-right tabular text-ink-2">{r ? `${r.supplyShare.toFixed(1)}%` : "—"}</td>
                <td className="px-3 py-3 text-right font-medium tabular">{formatPp(r?.gapPp)}</td>
                <td className="px-3 py-3 text-right tabular">{formatRatio(r?.dsRatio)}</td>
                <td className="px-3 py-3 text-right tabular">{formatPsf(r?.avgPrice)}</td>
                <td className="px-3 py-3 text-right tabular">{formatPct(r?.priceYoY)}</td>
                <td className="py-3 pl-4 text-right">
                  {r && (
                    <span className={cn("rounded-xs px-2 py-0.5 text-[11.5px] font-medium", r.gapPp > 0.5 ? "bg-brand-tint text-brand-dark" : r.gapPp < -0.5 ? "bg-series-2/10 text-series-2" : "bg-mist text-ink-2")}>
                      {r.gapPp > 0.5 ? "Under-supplied" : r.gapPp < -0.5 ? "Over-supplied" : "Balanced"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Demand vs supply by configuration" subtitle="Units in the selected period" option={opts?.volume ?? null} table={tbl} loading={loading} empty={empty} />
        <ChartPanel title="Share of demand vs share of supply" subtitle="% of total" option={opts?.share ?? null} table={tbl} loading={loading} empty={empty} />
      </div>

      <SectionTitle title="Where the gaps are" description="Red: demand-led (under-supplied). Blue: supply-led (over-supplied)." />
      <div className="grid gap-6 xl:grid-cols-12">
        <ChartPanel className="xl:col-span-5" title="Configuration gap" subtitle="Demand share − supply share, percentage points" option={opts?.gap ?? null} table={tbl} loading={loading} empty={empty} height={300} />
        <ChartPanel
          className="xl:col-span-7"
          title={`Configuration × ${heatDim === "ticket" ? "budget" : "unit size"}`}
          subtitle="Gap in each cell as a share of the whole market, percentage points"
          option={heat}
          table={heatTbl}
          loading={crossLoading}
          empty={empty}
          height={300}
          controls={<Segmented ariaLabel="Heatmap columns" value={heatDim} onChange={setHeatDim} options={[{ value: "ticket", label: "Budget" }, { value: "size", label: "Unit size" }]} />}
        />
      </div>

      <SectionTitle title="Mix over time" />
      <ChartPanel title="Demand mix by configuration" subtitle="Share of demand, last 8 quarters" option={opts?.demandShift ?? null} table={shiftTbl} loading={loading} empty={empty} height={280} />
    </div>
  );
}
