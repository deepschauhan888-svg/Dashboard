"use client";

import { useMemo } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { demandSupplyOption, priceTrendOption, shareComparisonOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { breakdownTable, trendTable } from "@/lib/charts/tables";
import { periodKey } from "@/lib/analytics/period";
import { formatNumber, formatPct, formatPp, formatPsf, formatRatio } from "@/lib/utils/format";
import { ChartPanel } from "@/components/charts/chart-panel";
import { ErrorState } from "@/components/ui/states";
import { KpiCard } from "./kpi-card";
import { ObservationsPanel } from "./observations-panel";
import { PerformanceTable, performanceTable } from "./performance-table";
import { WorkspacePageHeader } from "./page-header";
import { useRegisterExport, useWorkspace } from "./workspace-context";

export function ExecutiveOverview() {
  const { filters, catalog, setFilter, catalogError } = useWorkspace();
  const svc = getMarketDataService();
  const perfDim = filters.cityId === "all" ? "city" : "micromarket";

  const { data, loading, error } = useAsync(async () => {
    const perfFilters = { ...filters, micromarketId: "all" };
    const [kpis, trend, bhk, ticket, size, perf, observations] = await Promise.all([
      svc.getKpis(filters),
      svc.getTrend(filters, 12),
      svc.getBreakdown(filters, "bhk"),
      svc.getBreakdown(filters, "ticket"),
      svc.getBreakdown(filters, "size"),
      svc.getBreakdown(perfFilters, perfDim),
      svc.getObservations(filters),
    ]);
    return { kpis, trend, bhk, ticket, size, perf, observations };
  }, [filters.cityId, filters.micromarketId, filters.year, filters.quarter, filters.propertyType]);

  const k = data?.kpis;
  const empty = !!k && k.current.recordCount === 0;
  const basis = k?.comparisonBasis === "QoQ" ? `vs ${k?.comparisonPeriod?.label ?? "prior quarter"}` : `vs ${k?.comparisonPeriod?.label ?? "prior year"}`;
  const highlightKey = k?.period.quarters.length === 1 ? periodKey(k.period.quarters[0]) : undefined;

  const options = useMemo(() => {
    if (!data) return null;
    return {
      ds: demandSupplyOption(data.trend, { highlightKey }),
      price: priceTrendOption(data.trend),
      bhk: shareComparisonOption(data.bhk),
      ticket: shareComparisonOption(data.ticket),
      size: shareComparisonOption(data.size),
    };
  }, [data, highlightKey]);

  const tables = useMemo(() => {
    if (!data) return null;
    return {
      trend: trendTable(data.trend),
      bhk: breakdownTable(data.bhk, "Configuration"),
      ticket: breakdownTable(data.ticket, "Ticket size"),
      size: breakdownTable(data.size, "Unit size"),
      perf: performanceTable(data.perf),
      kpi: k
        ? {
            columns: ["Indicator", k.period.label, k.comparisonPeriod?.label ?? "Comparison", "Change %"],
            rows: [
              ["Total demand", k.current.demand, k.comparison?.demand ?? null, pct(k.current.demand, k.comparison?.demand)],
              ["Total supply", k.current.supply, k.comparison?.supply ?? null, pct(k.current.supply, k.comparison?.supply)],
              ["Avg price ₹/sq ft", round0(k.current.avgPrice), round0(k.comparison?.avgPrice ?? null), pct(k.current.avgPrice, k.comparison?.avgPrice)],
              ["Price appreciation YoY %", k.priceAppreciationYoY === null ? null : Number(k.priceAppreciationYoY.toFixed(2)), null, null],
              ["Demand-supply ratio", k.current.dsRatio === null ? null : Number(k.current.dsRatio.toFixed(3)), k.comparison?.dsRatio === null || !k.comparison ? null : Number(k.comparison.dsRatio.toFixed(3)), null],
              ["Market inventory (units)", k.current.inventory, k.comparison?.inventory ?? null, pct(k.current.inventory, k.comparison?.inventory)],
            ],
          }
        : null,
    };
  }, [data, k]);

  useRegisterExport("KPI summary", tables?.kpi);
  useRegisterExport("Quarterly demand, supply & price", tables?.trend);
  useRegisterExport("Configuration mix", tables?.bhk);
  useRegisterExport("Ticket-size distribution", tables?.ticket);
  useRegisterExport("Property-size distribution", tables?.size);
  useRegisterExport("Market performance", tables?.perf);

  if (catalogError) return <ErrorState message={catalogError} />;

  const bhkTop = data ? [...data.bhk].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const ticketTop = data ? [...data.ticket].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const sizeTop = data ? [...data.size].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const spark = (sel: (p: { demand: number; supply: number; avgPrice: number | null; dsRatio: number | null; inventory: number; priceYoY: number | null }) => number | null) =>
    k?.sparkline.map(sel);

  return (
    <div>
      <WorkspacePageHeader
        code="EXECUTIVE"
        title="Executive Market Overview"
        description={`Headline indicators for the selected market and period${k ? ` — ${k.period.label}${k.period.partial ? " (year to date)" : ""}` : ""}. Changes are ${k?.comparisonBasis === "QoQ" ? "quarter-on-quarter" : "year-on-year"} unless stated.`}
      />

      {error && <ErrorState message={error} />}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total demand" value={k ? formatNumber(k.current.demand) : "—"} unit="units" change={k ? pct(k.current.demand, k.comparison?.demand) : null} changeLabel={basis} spark={spark((p) => p.demand)} sparkColor={chartColors.demand} loading={loading} />
        <KpiCard label="Total supply" value={k ? formatNumber(k.current.supply) : "—"} unit="units" change={k ? pct(k.current.supply, k.comparison?.supply) : null} changeLabel={basis} goodWhen="neutral" spark={spark((p) => p.supply)} sparkColor={chartColors.supply} loading={loading} />
        <KpiCard label="Average price" value={k ? formatPsf(k.current.avgPrice) : "—"} unit="/sq ft" change={k ? pct(k.current.avgPrice, k.comparison?.avgPrice) : null} changeLabel={basis} spark={spark((p) => p.avgPrice)} sparkColor={chartColors.price} loading={loading} />
        <KpiCard label="Price appreciation" value={k ? formatPct(k.priceAppreciationYoY) : "—"} unit="YoY" change={null} deltaText={k?.yoy ? `from ${formatPsf(k.yoy.avgPrice)}` : "n/a"} changeLabel={`in ${k?.yoyPeriod?.label ?? "prior year"}`} spark={spark((p) => p.priceYoY)} sparkColor={chartColors.price} loading={loading} />
        <KpiCard label="Demand–supply ratio" value={k ? formatRatio(k.current.dsRatio) : "—"} change={k ? pct(k.current.dsRatio, k.comparison?.dsRatio) : null} changeLabel={basis} spark={spark((p) => p.dsRatio)} sparkColor={chartColors.demand} note={k?.current.dsRatio ? (k.current.dsRatio > 1 ? "Demand exceeds new supply" : "Supply exceeds demand") : undefined} loading={loading} />
        <KpiCard label="Market inventory" value={k ? formatNumber(k.current.inventory) : "—"} unit="units" change={k ? pct(k.current.inventory, k.comparison?.inventory) : null} changeLabel={basis} goodWhen="down" spark={spark((p) => p.inventory)} sparkColor={chartColors.categorical[3]} note={k?.monthsOfInventory ? `≈ ${k.monthsOfInventory.toFixed(1)} months of demand` : undefined} loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <ChartPanel
          className="xl:col-span-8"
          code="A"
          title="Demand vs supply trend"
          subtitle="Quarterly units · lower panel shows the market gap (demand − supply)"
          option={options?.ds ?? null}
          table={tables?.trend}
          loading={loading}
          empty={empty}
          height={360}
          footer={data && data.trend.length > 1 ? <TrendFooter t={data.trend} /> : undefined}
        />
        <ObservationsPanel className="xl:col-span-4 xl:max-h-[520px]" items={data?.observations ?? null} loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel code="B" title="Price trend" subtitle="Supply-weighted average ₹/sq ft · lower panel: YoY appreciation %" option={options?.price ?? null} table={tables?.trend} loading={loading} empty={empty} height={320} />
        <ChartPanel
          code="C"
          title="Configuration mix"
          subtitle="Share of demand vs share of supply by BHK"
          option={options?.bhk ?? null}
          table={tables?.bhk}
          loading={loading}
          empty={empty}
          height={320}
          footer={bhkTop ? <>Largest gap: <span className="text-white">{bhkTop.label}</span> at {formatPp(bhkTop.gapPp)} (demand share − supply share)</> : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel
          code="D"
          title="Ticket-size distribution"
          subtitle="Share of demand vs share of supply by budget bracket"
          option={options?.ticket ?? null}
          table={tables?.ticket}
          loading={loading}
          empty={empty}
          height={330}
          footer={ticketTop ? <>Most under-supplied bracket: <span className="text-white">{ticketTop.label}</span> ({formatPp(ticketTop.gapPp)})</> : undefined}
        />
        <ChartPanel
          code="E"
          title="Property-size distribution"
          subtitle="Share of demand vs share of supply by unit area (sq ft)"
          option={options?.size ?? null}
          table={tables?.size}
          loading={loading}
          empty={empty}
          height={330}
          footer={sizeTop ? <>Most under-supplied size: <span className="text-white">{sizeTop.label}</span> ({formatPp(sizeTop.gapPp)})</> : undefined}
        />
      </div>

      <section className="frame mt-4 rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60" aria-label="Market performance">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-600/50 px-5 py-4">
          <div>
            <span className="eyebrow text-signal-400">F</span>
            <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-white">Market performance — {perfDim === "city" ? "cities" : `micromarkets in ${catalog?.cities.find((c) => c.city_id === filters.cityId)?.city_name ?? ""}`}</h3>
            <p className="mt-0.5 text-[12.5px] text-muted">Comparative indicators for {k?.period.label}. Click a {perfDim === "city" ? "city" : "micromarket"} to drill in. Sort by any column.</p>
          </div>
        </header>
        <div className="px-2 py-2 sm:px-3">
          {data ? (
            data.perf.length ? (
              <PerformanceTable
                rows={data.perf}
                highlightId={perfDim === "city" ? undefined : filters.micromarketId}
                onSelect={(id) => (perfDim === "city" ? setFilter("cityId", id) : setFilter("micromarketId", id))}
              />
            ) : (
              <p className="px-3 py-8 text-center text-[13px] text-muted">No markets have data for this selection.</p>
            )
          ) : (
            <div className="h-64 animate-pulse rounded-xs bg-white/[0.03]" />
          )}
        </div>
      </section>
    </div>
  );
}

function TrendFooter({ t }: { t: { demand: number; supply: number; label: string }[] }) {
  const last = t[t.length - 1];
  const gap = last.demand - last.supply;
  return (
    <>
      {last.label}: demand {formatNumber(last.demand)} vs supply {formatNumber(last.supply)} — market gap of{" "}
      <span className="text-white">{gap >= 0 ? "+" : ""}{formatNumber(gap)} units</span> ({gap >= 0 ? "demand-led" : "supply-led"}).
    </>
  );
}

function pct(a: number | null, b: number | null | undefined): number | null {
  if (a === null || b === null || b === undefined || b === 0) return null;
  return Math.round(((a - b) / b) * 10000) / 100;
}

function round0(n: number | null) {
  return n === null ? null : Math.round(n);
}
