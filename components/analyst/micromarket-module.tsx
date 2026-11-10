"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { heatmapOption, rankedBarsOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { breakdownTable } from "@/lib/charts/tables";
import { formatNumber, formatPct, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { PerformanceTable } from "@/components/dashboard/performance-table";
import { SectionTitle, WorkspacePageHeader } from "@/components/dashboard/page-header";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { useRegisterExport, useViewFilters, useWorkspace } from "@/components/dashboard/workspace-context";

type HeatMetric = "ds" | "demandYoY";

export function MicromarketModule() {
  const { catalog, setFilter } = useWorkspace();
  const { filters, key } = useViewFilters("micromarkets");
  const svc = getMarketDataService();
  const router = useRouter();
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("ds");
  const city = catalog?.cities.find((c) => c.city_id === filters.cityId);

  const { data, loading } = useAsync(async () => {
    if (!city) return null;
    const [rows, series, kpis] = await Promise.all([svc.getBreakdown(filters, "micromarket"), svc.getMicromarketSeries(filters, 12), svc.getKpis(filters)]);
    return { rows, series, kpis };
  }, [key]);

  const heat = useMemo(() => {
    if (!data) return null;
    const q = data.series.quarters;
    const start = 4; // 12 quarters loaded; the last 8 are shown so YoY always has a base
    const xLabels = q.slice(start);
    const cells = data.series.micromarkets.flatMap((m, y) =>
      xLabels.map((_, xi) => {
        const i = xi + start;
        const cur = m.series[i];
        if (heatMetric === "ds") {
          const ds = cur?.dsRatio ?? null;
          return { x: xi, y, value: ds === null ? null : (ds - 1) * 100, detail: `Demand ÷ supply ${formatRatio(ds)}` };
        }
        const prev = m.series[i - 4];
        const g = cur && prev && prev.demand ? ((cur.demand - prev.demand) / prev.demand) * 100 : null;
        return { x: xi, y, value: g, detail: `Demand ${formatNumber(cur?.demand)} vs ${formatNumber(prev?.demand)} a year earlier` };
      }),
    );
    return {
      option: heatmapOption(xLabels, data.series.micromarkets.map((m) => m.label), cells, {
        diverging: true,
        format: (v) => formatPct(v, 0),
        seriesName: heatMetric === "ds" ? "Demand above (+) / below (−) supply" : "Demand growth YoY",
      }),
      table: {
        columns: ["Micromarket", ...xLabels],
        rows: data.series.micromarkets.map((m, y) => [m.label, ...xLabels.map((_, x) => { const c = cells.find((cc) => cc.x === x && cc.y === y); return c?.value === null || c?.value === undefined ? null : round(c.value, 1); })]),
      } as TableData,
    };
  }, [data, heatMetric]);

  const opts = useMemo(() => {
    if (!data) return null;
    const byShare = [...data.rows].sort((a, b) => b.demandShare - a.demandShare);
    const byPrice = [...data.rows].sort((a, b) => (b.avgPrice ?? 0) - (a.avgPrice ?? 0));
    return {
      share: rankedBarsOption(byShare.map((r) => ({ label: r.label, value: round(r.demandShare, 1) })), { seriesName: "Share of city demand", color: chartColors.demand, format: (v) => (v === null ? "—" : `${v.toFixed(1)}%`) }),
      price: rankedBarsOption(byPrice.map((r) => ({ label: r.label, value: r.avgPrice === null ? null : Math.round(r.avgPrice) })), { seriesName: "Avg ₹/sq ft", color: chartColors.supply, format: (v) => formatPsf(v) }),
    };
  }, [data]);

  useRegisterExport("Micromarket ranking", data ? breakdownTable(data.rows, "Micromarket") : undefined);
  useRegisterExport("Micromarket heatmap", heat?.table);

  if (catalog && !city) {
    return (
      <div>
        <WorkspacePageHeader kicker="Analyst · Micromarkets" title="Micromarket Analysis" description="Locality-level analysis within one city. Choose a city to begin." />
        <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {catalog.cities.map((c) => (
            <li key={c.city_id} className="bg-white">
              <button type="button" onClick={() => setFilter("cityId", c.city_id)} className="flex w-full flex-col items-start px-5 py-5 text-left transition-colors hover:bg-brand-tint">
                <span className="text-[16px] font-medium">{c.city_name}</span>
                <span className="mt-1 text-[12.5px] text-ink-2">{c.micromarkets.length} micromarkets</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const tightest = [...rows].filter((r) => r.dsRatio !== null).sort((a, b) => (b.dsRatio ?? 0) - (a.dsRatio ?? 0))[0];
  const fastest = [...rows].filter((r) => r.priceYoY !== null).sort((a, b) => (b.priceYoY ?? 0) - (a.priceYoY ?? 0))[0];
  const largest = [...rows].sort((a, b) => b.demandShare - a.demandShare)[0];
  const k = data?.kpis;
  const empty = !!k && k.current.recordCount === 0;

  return (
    <div>
      <WorkspacePageHeader kicker="Analyst · Micromarkets" title={`Micromarkets in ${city?.city_name ?? ""}`} description={`How the localities of ${city?.city_name ?? "the city"} compare in ${k?.period.label ?? "the selected period"}, and how each has moved quarter by quarter. Change the city in the filters above.`} />
      <StatStrip
        loading={loading}
        stats={[
          { label: "City demand", value: formatNumber(k?.current.demand), unit: "units", change: k?.comparison ? ((k.current.demand - k.comparison.demand) / k.comparison.demand) * 100 : null, changeLabel: `vs ${k?.comparisonPeriod?.label ?? "—"}` },
          { label: "Largest micromarket", value: largest?.label ?? "—", note: largest ? `${largest.demandShare.toFixed(1)}% of city demand` : "" },
          { label: "Most supply-constrained", value: tightest?.label ?? "—", note: tightest ? `demand ÷ supply ${formatRatio(tightest.dsRatio)}` : "" },
          { label: "Fastest price growth", value: fastest?.label ?? "—", note: fastest ? `${formatPct(fastest.priceYoY)} year-on-year` : "" },
        ]}
      />

      <SectionTitle title="Ranking" description="Sort by any column. Select a micromarket to open it in Demand Analytics." />
      <div className="rounded-sm border border-line px-2 py-1 sm:px-3">
        {data ? (
          rows.length ? (
            <PerformanceTable rows={rows} onSelect={(id) => { setFilter("micromarketId", id); router.push("/dashboard/analyst/demand"); }} />
          ) : (
            <p className="px-3 py-8 text-center text-[13px] text-ink-2">No micromarkets have data for this selection.</p>
          )
        ) : (
          <div className="h-56 animate-pulse rounded-xs bg-paper" />
        )}
      </div>

      <SectionTitle title="Momentum" description="Each cell is one micromarket in one quarter. Red: demand ahead; blue: supply ahead (or demand falling)." />
      <ChartPanel
        title={heatMetric === "ds" ? "Demand relative to supply" : "Demand growth, year-on-year"}
        subtitle={heatMetric === "ds" ? "% by which demand exceeds (+) or falls short of (−) new supply" : "% change in demand against the same quarter a year earlier"}
        option={heat?.option ?? null}
        table={heat?.table}
        loading={loading}
        empty={empty}
        height={Math.max(260, (data?.series.micromarkets.length ?? 5) * 46 + 90)}
        controls={<Segmented ariaLabel="Heatmap metric" value={heatMetric} onChange={setHeatMetric} options={[{ value: "ds", label: "Demand vs supply" }, { value: "demandYoY", label: "Demand growth" }]} />}
      />

      <SectionTitle title="Composition" />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Share of city demand" subtitle="% of the city's demand in the selected period" option={opts?.share ?? null} loading={loading} empty={empty} height={280} />
        <ChartPanel title="Average price" subtitle="₹ per sq ft, supply-weighted" option={opts?.price ?? null} loading={loading} empty={empty} height={280} />
      </div>
    </div>
  );
}
