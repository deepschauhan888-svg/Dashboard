"use client";

import type { EChartsOption } from "echarts";
import { useMemo, useState } from "react";
import type { BreakdownRow, TrendPoint } from "@/types/market";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { entityBarsOption, multiLineOption, rankedBarsOption, shareTrendOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { breakdownTable } from "@/lib/charts/tables";
import { formatNumber, formatPct, round } from "@/lib/utils/format";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useViewFilters, useWorkspace } from "@/components/dashboard/workspace-context";

type Metric = "demand" | "supply";

const COPY: Record<Metric, { code: string; title: string; description: string; noun: string }> = {
  demand: {
    code: "Analyst · Demand",
    title: "Demand Analytics",
    description: "Buyer demand by quarter, configuration, budget, unit size and micromarket — with growth rates and mix shifts.",
    noun: "Demand",
  },
  supply: {
    code: "Analyst · Supply",
    title: "Supply Analytics",
    description: "New supply by quarter, configuration, budget, unit size and micromarket — with growth rates and mix shifts.",
    noun: "Supply",
  },
};

function growthSeries(points: TrendPoint[], metric: Metric) {
  return points.map((p, i) => {
    const prev = points[i - 1];
    const yearAgo = points[i - 4];
    return {
      label: p.label,
      qoq: prev ? ((p[metric] - prev[metric]) / prev[metric]) * 100 : null,
      yoy: yearAgo ? ((p[metric] - yearAgo[metric]) / yearAgo[metric]) * 100 : null,
    };
  });
}

function singleBars(rows: BreakdownRow[], metric: Metric, color: string): EChartsOption {
  return entityBarsOption(rows.map((r) => r.label), [{ name: metric === "demand" ? "Demand units" : "Supply units", data: rows.map((r) => r[metric]), color }]);
}

export function FlowModule({ metric }: { metric: Metric }) {
  const { catalog } = useWorkspace();
  const { filters, key } = useViewFilters(metric);
  const svc = getMarketDataService();
  const color = metric === "demand" ? chartColors.demand : chartColors.supply;
  const copy = COPY[metric];
  const [mixDim, setMixDim] = useState<"bhk" | "ticket" | "size">("bhk");

  const { data, loading, error } = useAsync(async () => {
    const [trend, bhk, ticket, size, mm, kpis] = await Promise.all([
      svc.getTrend(filters, 16),
      svc.getBreakdown(filters, "bhk"),
      svc.getBreakdown(filters, "ticket"),
      svc.getBreakdown(filters, "size"),
      svc.getBreakdown({ ...filters, micromarketId: "all" }, "micromarket"),
      svc.getKpis(filters),
    ]);
    return { trend, bhk, ticket, size, mm, kpis };
  }, [key]);

  const { data: mix, loading: mixLoading } = useAsync(() => svc.getShareTrend(filters, mixDim, 8), [key, mixDim]);

  const growth = useMemo(() => (data ? growthSeries(data.trend, metric) : []), [data, metric]);
  const empty = !!data && data.kpis.current.recordCount === 0;

  const opts = useMemo(() => {
    if (!data) return null;
    const labels = data.trend.map((t) => t.label);
    const sortedMm = [...data.mm].sort((a, b) => b[metric] - a[metric]).slice(0, 12);
    return {
      trend: multiLineOption(labels, [{ name: `${copy.noun} units`, data: data.trend.map((t) => t[metric]), color }]),
      growth: entityBarsOption(
        growth.map((g) => g.label),
        [
          { name: "QoQ growth %", data: growth.map((g) => (g.qoq === null ? null : round(g.qoq, 1))), color },
          { name: "YoY growth %", data: growth.map((g) => (g.yoy === null ? null : round(g.yoy, 1))), color: chartColors.categorical[2] },
        ],
        { format: (v) => formatPct(v) },
      ),
      bhk: singleBars(data.bhk, metric, color),
      ticket: singleBars(data.ticket, metric, color),
      size: singleBars(data.size, metric, color),
      mm: rankedBarsOption(sortedMm.map((r) => ({ label: r.label, value: r[metric] })), { seriesName: `${copy.noun} units`, color }),
      sortedMm,
    };
  }, [data, metric, color, copy.noun, growth]);

  const mixCats = useMemo(() => {
    if (!catalog) return [];
    if (mixDim === "bhk") return catalog.bhkConfigurations.map((b) => ({ id: b, label: b.replace("BHK", " BHK") }));
    if (mixDim === "ticket") return catalog.ticketBrackets.map((b) => ({ id: b.id, label: b.label }));
    return catalog.sizeBrackets.map((b) => ({ id: b.id, label: `${b.label} sq ft` }));
  }, [catalog, mixDim]);

  const mixOption = useMemo(() => {
    if (!mix) return null;
    const key = metric === "demand" ? "demandShare" : "supplyShare";
    return shareTrendOption(mix.map((m) => m.label), mixCats, (id) => mix.map((m) => m[key][id] ?? 0));
  }, [mix, mixCats, metric]);

  const trendTbl: TableData | undefined = data
    ? {
        columns: ["Quarter", `${copy.noun} units`, "QoQ %", "YoY %"],
        rows: data.trend.map((t, i) => [t.label, t[metric], growth[i]?.qoq === null ? null : round(growth[i]?.qoq ?? 0, 1), growth[i]?.yoy === null ? null : round(growth[i]?.yoy ?? 0, 1)]),
      }
    : undefined;
  const mmTbl = data ? breakdownTable(data.mm, "Micromarket") : undefined;
  const mixTbl: TableData | undefined = mix
    ? { columns: ["Quarter", ...mixCats.map((c) => `${c.label} share %`)], rows: mix.map((m) => [m.label, ...mixCats.map((c) => round((metric === "demand" ? m.demandShare : m.supplyShare)[c.id] ?? 0, 1))]) }
    : undefined;

  useRegisterExport(`${copy.noun} — quarterly trend`, trendTbl);
  useRegisterExport(`${copy.noun} — by micromarket`, mmTbl);
  useRegisterExport(`${copy.noun} — by configuration`, data ? breakdownTable(data.bhk, "Configuration") : undefined);
  useRegisterExport(`${copy.noun} — mix shift`, mixTbl);

  const k = data?.kpis;
  const cur = k ? k.current[metric] : 0;
  const comp = k?.comparison ? k.comparison[metric] : null;
  const yoyV = k?.yoy ? k.yoy[metric] : null;
  const last = growth[growth.length - 1];
  const topBhk = data ? [...data.bhk].sort((a, b) => b[metric] - a[metric])[0] : null;
  const topMm = opts?.sortedMm[0];

  return (
    <div>
      <WorkspacePageHeader kicker={copy.code} title={copy.title} description={copy.description} />
      {error && <p className="mb-4 text-[13px] text-negative">{error}</p>}

      <StatStrip
        loading={loading}
        stats={[
          { label: `${copy.noun} · ${k?.period.label ?? ""}`, value: formatNumber(cur), unit: "units", change: comp ? ((cur - comp) / comp) * 100 : null, changeLabel: `vs ${k?.comparisonPeriod?.label ?? "—"}`, goodWhen: metric === "demand" ? "up" : "neutral" },
          { label: "Year-on-year", value: formatPct(yoyV ? ((cur - yoyV) / yoyV) * 100 : null), note: yoyV ? `from ${formatNumber(yoyV)} in ${k?.yoyPeriod?.label}` : "No prior-year period" },
          { label: "Largest configuration", value: topBhk?.label ?? "—", note: topBhk ? `${(metric === "demand" ? topBhk.demandShare : topBhk.supplyShare).toFixed(1)}% of total` : "" },
          { label: `Top micromarket`, value: topMm?.label.split(",")[0] ?? "—", note: topMm ? `${formatNumber(topMm[metric])} units` : "" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartPanel title={`Quarterly ${metric} trend`} subtitle="Units per quarter, last 16 quarters to the selected period" option={opts?.trend ?? null} table={trendTbl} loading={loading} empty={empty} />
        <ChartPanel
          title={`${copy.noun} growth`}
          subtitle="Quarter-on-quarter and year-on-year change, %"
          option={opts?.growth ?? null}
          table={trendTbl}
          loading={loading}
          empty={empty}
          footer={last ? <>Latest quarter ({last.label}): {formatPct(last.qoq)} QoQ, {formatPct(last.yoy)} YoY.</> : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChartPanel title={`BHK-wise ${metric}`} subtitle="Units by configuration" option={opts?.bhk ?? null} table={data ? breakdownTable(data.bhk, "Configuration") : undefined} loading={loading} empty={empty} height={260} />
        <ChartPanel title={`Ticket-size-wise ${metric}`} subtitle="Units by budget bracket" option={opts?.ticket ?? null} table={data ? breakdownTable(data.ticket, "Ticket size") : undefined} loading={loading} empty={empty} height={260} />
        <ChartPanel title={`Property-size-wise ${metric}`} subtitle="Units by area bracket (sq ft)" option={opts?.size ?? null} table={data ? breakdownTable(data.size, "Unit size") : undefined} loading={loading} empty={empty} height={260} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title={`Micromarket ${metric} distribution`}
          subtitle={filters.cityId === "all" ? "Top 12 micromarkets across all cities" : `Micromarkets in ${catalog?.cities.find((c) => c.city_id === filters.cityId)?.city_name}`}
          option={opts?.mm ?? null}
          table={mmTbl}
          loading={loading}
          empty={empty}
          height={380}
        />
        <ChartPanel
          title={`${copy.noun} mix shift`}
          subtitle="Share of the total by category, last 8 quarters"
          option={mixOption}
          table={mixTbl}
          loading={mixLoading}
          empty={empty}
          height={380}
          controls={
            <Segmented
              ariaLabel="Mix dimension"
              value={mixDim}
              onChange={setMixDim}
              options={[
                { value: "bhk", label: "BHK" },
                { value: "ticket", label: "Ticket" },
                { value: "size", label: "Size" },
              ]}
            />
          }
        />
      </div>
    </div>
  );
}
