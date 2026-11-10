"use client";

import { useMemo } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { demandSupplyOption, priceTrendOption, shareComparisonOption, volumeBarsOption } from "@/lib/charts/options";
import { breakdownTable, trendTable } from "@/lib/charts/tables";
import { periodKey } from "@/lib/analytics/period";
import { formatNumber, formatPct, formatPp, formatPsf, formatRatio } from "@/lib/utils/format";
import { ChartPanel } from "@/components/charts/chart-panel";
import { ErrorState } from "@/components/ui/states";
import { ObservationsPanel } from "./observations-panel";
import { PerformanceTable, performanceTable } from "./performance-table";
import { SectionTitle, WorkspacePageHeader } from "./page-header";
import { StatStrip } from "./stat-strip";
import { useRegisterExport, useViewFilters, useWorkspace } from "./workspace-context";

export function ExecutiveOverview() {
  const { catalog, setFilter, catalogError } = useWorkspace();
  const { filters, key, scope } = useViewFilters("executive");
  const svc = getMarketDataService();
  const perfDim = filters.cityId === "all" ? "city" : "micromarket";

  const { data, loading, error } = useAsync(async () => {
    const [kpis, trend, bhk, ticket, perf, observations] = await Promise.all([
      svc.getKpis(filters),
      svc.getTrend(filters, 12),
      svc.getBreakdown(filters, "bhk"),
      svc.getBreakdown(filters, "ticket"),
      svc.getBreakdown({ ...filters, micromarketId: "all" }, perfDim),
      svc.getObservations(filters),
    ]);
    return { kpis, trend, bhk, ticket, perf, observations };
  }, [key]);

  const k = data?.kpis;
  const empty = !!k && k.current.recordCount === 0;
  const vs = k?.comparisonPeriod ? `vs ${k.comparisonPeriod.label}` : "";
  const highlightKey = k?.period.quarters.length === 1 ? periodKey(k.period.quarters[0]) : undefined;

  const options = useMemo(() => {
    if (!data) return null;
    return {
      ds: demandSupplyOption(data.trend, { highlightKey }),
      price: priceTrendOption(data.trend),
      bhk: shareComparisonOption(data.bhk),
      ticket: volumeBarsOption(data.ticket),
    };
  }, [data, highlightKey]);

  const tables = useMemo(() => {
    if (!data || !k) return null;
    return {
      trend: trendTable(data.trend),
      bhk: breakdownTable(data.bhk, "Configuration"),
      ticket: breakdownTable(data.ticket, "Ticket size"),
      perf: performanceTable(data.perf),
      kpi: {
        columns: ["Indicator", k.period.label, k.comparisonPeriod?.label ?? "Comparison", "Change %"],
        rows: [
          ["Demand (units)", k.current.demand, k.comparison?.demand ?? null, pct(k.current.demand, k.comparison?.demand)],
          ["Supply (units)", k.current.supply, k.comparison?.supply ?? null, pct(k.current.supply, k.comparison?.supply)],
          ["Average price (₹/sq ft)", round0(k.current.avgPrice), round0(k.comparison?.avgPrice ?? null), pct(k.current.avgPrice, k.comparison?.avgPrice)],
          ["Price appreciation YoY (%)", k.priceAppreciationYoY === null ? null : Number(k.priceAppreciationYoY.toFixed(2)), null, null],
          ["Demand ÷ supply", k.current.dsRatio === null ? null : Number(k.current.dsRatio.toFixed(3)), k.comparison?.dsRatio == null ? null : Number(k.comparison.dsRatio.toFixed(3)), null],
          ["Unsold inventory (units)", k.current.inventory, k.comparison?.inventory ?? null, pct(k.current.inventory, k.comparison?.inventory)],
        ],
      },
    };
  }, [data, k]);

  useRegisterExport("Market overview", tables?.kpi);
  useRegisterExport("Quarterly demand, supply and price", tables?.trend);
  useRegisterExport("Configuration mix", tables?.bhk);
  useRegisterExport("Ticket-size distribution", tables?.ticket);
  useRegisterExport("Market comparison", tables?.perf);

  if (catalogError) return <ErrorState message={catalogError} />;

  const bhkTop = data ? [...data.bhk].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const ticketTop = data ? [...data.ticket].sort((a, b) => b.demandShare - a.demandShare)[0] : null;
  const ticketGap = data ? [...data.ticket].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const dChange = k ? pct(k.current.demand, k.comparison?.demand) : null;

  return (
    <div>
      <WorkspacePageHeader kicker="Executive overview" title="Market Overview" description={`${scope}${k?.period.partial ? " (year to date)" : ""}. Changes are ${k?.comparisonBasis === "QoQ" ? "quarter-on-quarter" : "year-on-year"} unless stated.`} />
      {error && <ErrorState message={error} />}

      {/* 1–6 Market overview */}
      <section aria-label="Market overview">
        {k && !empty && (
          <p className="display max-w-4xl text-[21px] leading-snug text-ink sm:text-[23px]">
            Demand {dChange === null ? "stood at" : dChange >= 0 ? "rose" : "fell"} {dChange === null ? "" : `${formatPct(Math.abs(dChange), 1, false)} ${k.comparisonBasis === "QoQ" ? "quarter-on-quarter" : "year-on-year"} to `}
            {formatNumber(k.current.demand)} units against {formatNumber(k.current.supply)} units of new supply — a demand–supply ratio of {formatRatio(k.current.dsRatio)}. Prices average {formatPsf(k.current.avgPrice)} per sq ft, {k.priceAppreciationYoY === null ? "" : `${k.priceAppreciationYoY >= 0 ? "up" : "down"} ${formatPct(Math.abs(k.priceAppreciationYoY), 1, false)} on a year earlier`}.
          </p>
        )}
        <StatStrip
          className="mt-6"
          loading={loading}
          stats={[
            { label: "Demand", value: k ? formatNumber(k.current.demand) : "—", unit: "units", change: k ? pct(k.current.demand, k.comparison?.demand) : null, changeLabel: vs },
            { label: "Supply", value: k ? formatNumber(k.current.supply) : "—", unit: "units", change: k ? pct(k.current.supply, k.comparison?.supply) : null, changeLabel: vs, goodWhen: "neutral" },
            { label: "Average price", value: k ? formatPsf(k.current.avgPrice) : "—", unit: "/ sq ft", change: k ? pct(k.current.avgPrice, k.comparison?.avgPrice) : null, changeLabel: vs },
            { label: "Price appreciation", value: k ? formatPct(k.priceAppreciationYoY) : "—", unit: "YoY", note: k?.yoy ? `from ${formatPsf(k.yoy.avgPrice)} in ${k.yoyPeriod?.label}` : "" },
            { label: "Demand ÷ supply", value: k ? formatRatio(k.current.dsRatio) : "—", note: k?.current.dsRatio ? (k.current.dsRatio >= 1 ? "Demand exceeds new supply" : "Supply exceeds demand") : "" },
            { label: "Unsold inventory", value: k ? formatNumber(k.current.inventory) : "—", unit: "units", change: k ? pct(k.current.inventory, k.comparison?.inventory) : null, changeLabel: vs, goodWhen: "down" },
          ]}
        />
      </section>

      {/* Demand–supply relationship + observations */}
      <div className="mt-8 grid gap-6 xl:grid-cols-12">
        <ChartPanel
          className="xl:col-span-8"
          title="Demand and supply"
          subtitle="Units per quarter · lower panel: market gap (demand − supply)"
          option={options?.ds ?? null}
          table={tables?.trend}
          loading={loading}
          empty={empty}
          height={360}
          footer={data && data.trend.length ? <TrendFooter t={data.trend} /> : undefined}
        />
        <ObservationsPanel className="xl:col-span-4 xl:max-h-[500px]" items={data?.observations ?? null} loading={loading} />
      </div>

      <SectionTitle title="Price" description="Supply-weighted average price per sq ft and its year-on-year appreciation" />
      <ChartPanel title="Average price and appreciation" subtitle="₹ per sq ft · lower panel: year-on-year %" option={options?.price ?? null} table={tables?.trend} loading={loading} empty={empty} height={320} />

      <SectionTitle title="Product mix" description="How demand and supply are distributed across configurations and budgets" />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Configuration mix"
          subtitle="Share of demand vs share of supply, %"
          option={options?.bhk ?? null}
          table={tables?.bhk}
          loading={loading}
          empty={empty}
          height={300}
          footer={bhkTop ? <>Widest shortfall: <span className="font-medium text-ink">{bhkTop.label}</span> at {formatPp(bhkTop.gapPp)}</> : undefined}
        />
        <ChartPanel
          title="Ticket-size distribution"
          subtitle="Demand and supply units by budget bracket"
          option={options?.ticket ?? null}
          table={tables?.ticket}
          loading={loading}
          empty={empty}
          height={300}
          footer={ticketTop && ticketGap ? <>Most demand: <span className="font-medium text-ink">{ticketTop.label}</span> ({ticketTop.demandShare.toFixed(1)}%). Most under-supplied: <span className="font-medium text-ink">{ticketGap.label}</span> ({formatPp(ticketGap.gapPp)}).</> : undefined}
        />
      </div>

      <SectionTitle
        title="Market comparison"
        description={`${perfDim === "city" ? "All cities" : `Micromarkets in ${catalog?.cities.find((c) => c.city_id === filters.cityId)?.city_name ?? ""}`} for ${k?.period.label ?? ""}. Select a row to drill in; sort by any column.`}
      />
      <div className="rounded-sm border border-line px-2 py-1 sm:px-3">
        {data ? (
          data.perf.length ? (
            <PerformanceTable rows={data.perf} highlightId={perfDim === "city" ? undefined : filters.micromarketId} onSelect={(id) => (perfDim === "city" ? setFilter("cityId", id) : setFilter("micromarketId", id))} />
          ) : (
            <p className="px-3 py-8 text-center text-[13px] text-ink-2">No markets have data for this selection.</p>
          )
        ) : (
          <div className="h-64 animate-pulse rounded-xs bg-paper" />
        )}
      </div>
    </div>
  );
}

function TrendFooter({ t }: { t: { demand: number; supply: number; label: string }[] }) {
  const last = t[t.length - 1];
  const gap = last.demand - last.supply;
  return (
    <>
      {last.label}: market gap of <span className="font-medium text-ink">{gap >= 0 ? "+" : ""}{formatNumber(gap)} units</span> — {gap >= 0 ? "demand-led" : "supply-led"}.
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
