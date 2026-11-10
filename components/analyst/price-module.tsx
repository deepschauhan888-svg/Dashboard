"use client";

import { useMemo, useState } from "react";
import type { BhkConfiguration } from "@/types/market";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { entityBarsOption, multiLineOption, priceDistributionOption, priceTrendOption, rankedBarsOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { breakdownTable, trendTable } from "@/lib/charts/tables";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { formatCompact, formatPct, formatPsf, round } from "@/lib/utils/format";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useViewFilters } from "@/components/dashboard/workspace-context";

export function PriceModule() {
  const { filters, key } = useViewFilters("price");
  const svc = getMarketDataService();
  const [band, setBand] = useState<"1000" | "2500" | "5000">("2500");
  const [mmMetric, setMmMetric] = useState<"price" | "yoy">("price");

  const { data, loading } = useAsync(async () => {
    const [trend, history, mm, byBhk, kpis] = await Promise.all([
      svc.getTrend(filters, 16),
      svc.getHistory(filters),
      svc.getBreakdown({ ...filters, micromarketId: "all" }, "micromarket"),
      svc.getPriceByBhk(filters, 12),
      svc.getKpis(filters),
    ]);
    return { trend, history, mm, byBhk, kpis };
  }, [key]);

  const { data: dist, loading: distLoading } = useAsync(
    () => svc.getPriceDistribution(filters, Number(band)),
    [key, band],
  );

  const annual = useMemo(() => {
    if (!data) return [];
    // annual supply-weighted average from quarterly points (weights = supply)
    const byYear = new Map<number, { w: number; s: number; n: number }>();
    data.history.forEach((p) => {
      if (p.avgPrice === null) return;
      const cur = byYear.get(p.year) ?? { w: 0, s: 0, n: 0 };
      cur.w += p.avgPrice * p.supply;
      cur.s += p.supply;
      cur.n += 1;
      byYear.set(p.year, cur);
    });
    const years = [...byYear.keys()].sort();
    return years.map((y, i) => {
      const v = byYear.get(y)!;
      const avg = v.s ? v.w / v.s : null;
      const prev = i > 0 ? byYear.get(years[i - 1])! : null;
      const prevAvg = prev && prev.s ? prev.w / prev.s : null;
      return { year: y, avg, partial: v.n < 4, yoy: avg !== null && prevAvg !== null ? ((avg - prevAvg) / prevAvg) * 100 : null };
    });
  }, [data]);

  const empty = !!data && data.kpis.current.recordCount === 0;
  const bhkKeys: BhkConfiguration[] = ["1BHK", "2BHK", "3BHK", "4BHK+"];

  const opts = useMemo(() => {
    if (!data) return null;
    const mmRows = [...data.mm]
      .filter((r) => r.avgPrice !== null)
      .sort((a, b) => (mmMetric === "price" ? (b.avgPrice ?? 0) - (a.avgPrice ?? 0) : (b.priceYoY ?? 0) - (a.priceYoY ?? 0)))
      .slice(0, 12);
    return {
      trend: priceTrendOption(data.trend),
      annual: entityBarsOption(
        annual.map((a) => (a.partial ? `${a.year} YTD` : String(a.year))),
        [{ name: "Annual appreciation %", data: annual.map((a) => (a.yoy === null ? null : round(a.yoy, 1))), color: chartColors.price }],
        { format: (v) => formatPct(v) },
      ),
      mm: rankedBarsOption(
        mmRows.map((r) => ({ label: r.label, value: mmMetric === "price" ? (r.avgPrice === null ? null : Math.round(r.avgPrice)) : r.priceYoY === null ? null : round(r.priceYoY, 1) })),
        mmMetric === "price"
          ? { seriesName: "Avg ₹/sq ft", color: chartColors.price, format: (v) => formatPsf(v) }
          : { seriesName: "Price YoY", color: chartColors.price, format: (v) => formatPct(v) },
      ),
      byBhk: multiLineOption(
        data.byBhk.map((p) => p.label),
        bhkKeys.map((b, i) => ({ name: BHK_LABELS[b], data: data.byBhk.map((p) => (p.values[b] === null ? null : Math.round(p.values[b]!))), color: chartColors.categorical[i] })),
        { format: (v) => formatPsf(v), axisFormat: (v) => `₹${formatCompact(v)}` },
      ),
    };
  }, [data, annual, mmMetric]);

  const distOption = useMemo(() => (dist ? priceDistributionOption(dist) : null), [dist]);

  const annualTbl: TableData = { columns: ["Year", "Avg ₹/sq ft", "Appreciation %"], rows: annual.map((a) => [a.partial ? `${a.year} YTD` : a.year, a.avg === null ? null : Math.round(a.avg), a.yoy === null ? null : round(a.yoy, 1)]) };
  const bhkTbl: TableData | undefined = data
    ? { columns: ["Quarter", ...bhkKeys.map((b) => `${BHK_LABELS[b]} ₹/sq ft`)], rows: data.byBhk.map((p) => [p.label, ...bhkKeys.map((b) => (p.values[b] === null ? null : Math.round(p.values[b]!)))]) }
    : undefined;
  const distTbl: TableData | undefined = dist ? { columns: ["Band ₹/sq ft", "Demand", "Supply"], rows: dist.map((d) => [`${d.min}–${d.max}`, d.demand, d.supply]) } : undefined;

  useRegisterExport("Price — quarterly", data ? trendTable(data.trend) : undefined);
  useRegisterExport("Price — annual appreciation", annualTbl);
  useRegisterExport("Price — by configuration", bhkTbl);
  useRegisterExport("Price — micromarkets", data ? breakdownTable(data.mm, "Micromarket") : undefined);

  const k = data?.kpis;
  const bhkLatest = data?.byBhk[data.byBhk.length - 1];
  const spread = bhkLatest && bhkLatest.values["4BHK+"] && bhkLatest.values["1BHK"] ? ((bhkLatest.values["4BHK+"]! - bhkLatest.values["1BHK"]!) / bhkLatest.values["1BHK"]!) * 100 : null;

  return (
    <div>
      <WorkspacePageHeader kicker="Analyst · Price" title="Price Intelligence" description="Supply-weighted average prices (₹ per sq ft), appreciation, micromarket comparison, distribution and configuration-level trends." />
      <StatStrip
        loading={loading}
        stats={[
          { label: "Average price", value: formatPsf(k?.current.avgPrice), unit: "/ sq ft", change: k?.comparison?.avgPrice && k.current.avgPrice ? ((k.current.avgPrice - k.comparison.avgPrice) / k.comparison.avgPrice) * 100 : null, changeLabel: `vs ${k?.comparisonPeriod?.label ?? "—"}` },
          { label: "Appreciation, year-on-year", value: formatPct(k?.priceAppreciationYoY), note: k?.yoy ? `from ${formatPsf(k.yoy.avgPrice)} in ${k.yoyPeriod?.label}` : "No prior-year period" },
          { label: "Since first quarter on record", value: formatPct(annual.length > 1 && annual[0].avg && annual[annual.length - 1].avg ? ((annual[annual.length - 1].avg! - annual[0].avg!) / annual[0].avg!) * 100 : null), note: annual.length ? `${annual[0].year} → ${annual[annual.length - 1].year}, annual averages` : "" },
          { label: "4 BHK+ premium over 1 BHK", value: formatPct(spread), note: bhkLatest ? `per sq ft, ${bhkLatest.label}` : "" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <ChartPanel className="xl:col-span-8" title="Quarterly price movement" subtitle="Avg ₹/sq ft and YoY appreciation, last 16 quarters" option={opts?.trend ?? null} table={data ? trendTable(data.trend) : undefined} loading={loading} empty={empty} height={340} />
        <ChartPanel className="xl:col-span-4" title="Annual price appreciation" subtitle="Change in annual supply-weighted average" option={opts?.annual ?? null} table={annualTbl} loading={loading} empty={empty} height={340} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Micromarket price comparison"
          subtitle={filters.cityId === "all" ? "Top 12 micromarkets" : "Micromarkets in the selected city"}
          option={opts?.mm ?? null}
          table={data ? breakdownTable(data.mm, "Micromarket") : undefined}
          loading={loading}
          empty={empty}
          height={380}
          controls={<Segmented ariaLabel="Micromarket metric" value={mmMetric} onChange={setMmMetric} options={[{ value: "price", label: "₹/sq ft" }, { value: "yoy", label: "YoY %" }]} />}
        />
        <ChartPanel
          title="Price distribution"
          subtitle="Demand and supply units by ₹/sq ft band"
          option={distOption}
          table={distTbl}
          loading={distLoading}
          empty={empty}
          height={380}
          controls={<Segmented ariaLabel="Band width" value={band} onChange={setBand} options={[{ value: "1000", label: "₹1K" }, { value: "2500", label: "₹2.5K" }, { value: "5000", label: "₹5K" }]} />}
        />
      </div>
      <div className="mt-6">
        <ChartPanel title="Price trends by configuration" subtitle="Avg ₹/sq ft by BHK, last 12 quarters" option={opts?.byBhk ?? null} table={bhkTbl} loading={loading} empty={empty} height={320} />
      </div>
    </div>
  );
}
