"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { PeriodRef, Quarter, TrendPoint } from "@/types/market";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { entityBarsOption, multiLineOption, seasonalOverlayOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { trendTable } from "@/lib/charts/tables";
import { comparePeriods, periodLabel } from "@/lib/analytics/period";
import { formatCompact, formatNumber, formatPct, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Select } from "@/components/ui/form-controls";
import { Segmented } from "@/components/ui/segmented";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useWorkspace } from "@/components/dashboard/workspace-context";

type Metric = "demand" | "supply" | "avgPrice" | "inventory" | "dsRatio";
const METRICS: { value: Metric; label: string; fmt: (v: number | null) => string; color: string }[] = [
  { value: "demand", label: "Demand", fmt: formatNumber, color: chartColors.demand },
  { value: "supply", label: "Supply", fmt: formatNumber, color: chartColors.supply },
  { value: "avgPrice", label: "Avg price", fmt: formatPsf, color: chartColors.price },
  { value: "inventory", label: "Inventory", fmt: formatNumber, color: chartColors.categorical[3] },
  { value: "dsRatio", label: "D/S ratio", fmt: formatRatio, color: chartColors.categorical[5] },
];

function annualValue(points: TrendPoint[], metric: Metric): number | null {
  if (!points.length) return null;
  if (metric === "demand" || metric === "supply") return points.reduce((a, p) => a + p[metric], 0);
  if (metric === "inventory") return points[points.length - 1].inventory;
  const s = points.reduce((a, p) => a + p.supply, 0);
  if (metric === "avgPrice") return s ? points.reduce((a, p) => a + (p.avgPrice ?? 0) * p.supply, 0) / s : null;
  const d = points.reduce((a, p) => a + p.demand, 0);
  return s ? d / s : null;
}

export function HistoryModule() {
  const { filters, catalog } = useWorkspace();
  const svc = getMarketDataService();
  const [metric, setMetric] = useState<Metric>("demand");
  const years = catalog?.years ?? [];
  const [picked, setPicked] = useState<number[] | null>(null);
  const activeYears = picked ?? years;
  const latest = catalog?.latestPeriod ?? { year: 2026, quarter: 3 as Quarter };

  const [a, setA] = useState<{ from: PeriodRef; to: PeriodRef }>({ from: { year: latest.year - 1, quarter: 1 }, to: { year: latest.year - 1, quarter: latest.quarter } });
  const [b, setB] = useState<{ from: PeriodRef; to: PeriodRef }>({ from: { year: latest.year, quarter: 1 }, to: latest });

  const scope = { cityId: filters.cityId, micromarketId: filters.micromarketId, propertyType: filters.propertyType };
  const { data: history, loading } = useAsync(() => svc.getHistory(scope), [filters.cityId, filters.micromarketId, filters.propertyType]);

  const validA = comparePeriods(a.from, a.to) <= 0;
  const validB = comparePeriods(b.from, b.to) <= 0;
  const { data: cmp, loading: cmpLoading } = useAsync(async () => {
    if (!validA || !validB) return null;
    const [ra, rb] = await Promise.all([svc.getRangeAggregate(scope, a.from, a.to), svc.getRangeAggregate(scope, b.from, b.to)]);
    return { ra, rb };
  }, [filters.cityId, filters.micromarketId, filters.propertyType, JSON.stringify(a), JSON.stringify(b)]);

  const m = METRICS.find((x) => x.value === metric)!;
  const yearColor = (y: number) => chartColors.categorical[years.indexOf(y) % chartColors.categorical.length];

  const opts = useMemo(() => {
    if (!history) return null;
    const val = (p: TrendPoint) => {
      const v = p[metric];
      return v === null ? null : metric === "dsRatio" ? round(v, 2) : Math.round(v);
    };
    const annual = activeYears.map((y) => ({ y, partial: history.filter((p) => p.year === y).length < 4, v: annualValue(history.filter((p) => p.year === y), metric) }));
    return {
      full: multiLineOption(history.map((p) => p.label), [{ name: m.label, data: history.map(val), color: m.color }], {
        format: m.fmt,
        axisFormat: metric === "dsRatio" ? (v) => `${v.toFixed(2)}×` : metric === "avgPrice" ? (v) => `₹${formatCompact(v)}` : undefined,
      }),
      overlay: seasonalOverlayOption(activeYears, (y, q) => {
        const p = history.find((h) => h.year === y && h.quarter === q);
        return p ? val(p) : null;
      }, yearColor, m.fmt),
      annual: entityBarsOption(
        annual.map((x) => (x.partial ? `${x.y} YTD` : String(x.y))),
        [{ name: metric === "inventory" ? "Year-end inventory" : metric === "avgPrice" ? "Annual avg ₹/sq ft" : metric === "dsRatio" ? "Annual D/S" : `Annual ${m.label.toLowerCase()}`, data: annual.map((x) => (x.v === null ? null : metric === "dsRatio" ? round(x.v, 2) : Math.round(x.v))), color: m.color }],
        { format: m.fmt },
      ),
      annualRows: annual,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, metric, activeYears.join(",")]);

  const quarterOptions = (year: number) =>
    ([1, 2, 3, 4] as Quarter[]).map((q) => ({ value: `${year}-${q}`, label: `Q${q} ${year}`, disabled: year === latest.year && q > latest.quarter }));
  const periodOptions = years.flatMap((y) => quarterOptions(y));
  const parse = (v: string): PeriodRef => {
    const [y, q] = v.split("-").map(Number);
    return { year: y, quarter: q as Quarter };
  };
  const key = (p: PeriodRef) => `${p.year}-${p.quarter}`;

  const cmpRows = cmp?.ra && cmp?.rb
    ? [
        { label: "Demand (units)", a: cmp.ra.demand, b: cmp.rb.demand, fmt: formatNumber },
        { label: "Supply (units)", a: cmp.ra.supply, b: cmp.rb.supply, fmt: formatNumber },
        { label: "Avg price (₹/sq ft)", a: cmp.ra.avgPrice, b: cmp.rb.avgPrice, fmt: formatPsf },
        { label: "Demand–supply ratio", a: cmp.ra.dsRatio, b: cmp.rb.dsRatio, fmt: formatRatio },
        { label: "Inventory at period end", a: cmp.ra.inventory, b: cmp.rb.inventory, fmt: formatNumber },
      ]
    : [];
  const lenA = validA ? (a.to.year - a.from.year) * 4 + (a.to.quarter - a.from.quarter) + 1 : 0;
  const lenB = validB ? (b.to.year - b.from.year) * 4 + (b.to.quarter - b.from.quarter) + 1 : 0;

  const cmpTable: TableData = {
    columns: ["Indicator", `A: ${periodLabel(a.from)}–${periodLabel(a.to)}`, `B: ${periodLabel(b.from)}–${periodLabel(b.to)}`, "Change %"],
    rows: cmpRows.map((r) => [r.label, r.a === null ? null : round(r.a, 2), r.b === null ? null : round(r.b, 2), r.a && r.b !== null ? round(((r.b - r.a) / r.a) * 100, 1) : null]),
  };
  const annualTbl: TableData | undefined = opts ? { columns: ["Year", m.label], rows: opts.annualRows.map((x) => [x.partial ? `${x.y} YTD` : x.y, x.v === null ? null : round(x.v, 2)]) } : undefined;
  useRegisterExport("History — all quarters", history ? trendTable(history) : undefined);
  useRegisterExport("History — period comparison", cmpRows.length ? cmpTable : undefined);
  useRegisterExport(`History — annual ${m.label.toLowerCase()}`, annualTbl);

  return (
    <div>
      <WorkspacePageHeader
        code="ANALYST · H"
        title="Historical Analysis"
        description="Navigate the full quarterly history, overlay years to isolate seasonality, and compare any two periods. Geography and property type follow the global filters."
        actions={<Segmented ariaLabel="Metric" size="md" value={metric} onChange={setMetric} options={METRICS.map((x) => ({ value: x.value, label: x.label }))} />}
      />

      <ChartPanel code="H.1" title={`${m.label} — full history`} subtitle={`${history?.[0]?.label ?? ""} to ${history?.[history.length - 1]?.label ?? ""}, quarterly`} option={opts?.full ?? null} table={history ? trendTable(history) : undefined} loading={loading} height={300} />

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel
          code="H.2"
          title="Year-over-year overlay"
          subtitle="Each line is one year, plotted Q1–Q4"
          option={opts?.overlay ?? null}
          loading={loading}
          height={320}
          controls={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Years to show">
              {years.map((y) => {
                const on = activeYears.includes(y);
                return (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const next = on ? activeYears.filter((x) => x !== y) : [...activeYears, y].sort();
                      setPicked(next.length ? next : [y]);
                    }}
                    className={cn("inline-flex h-7 items-center gap-1.5 rounded-xs px-2 font-mono text-[11.5px] ring-1 ring-inset", on ? "bg-white/[0.06] text-white ring-ink-500" : "text-muted ring-ink-600")}
                  >
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: on ? yearColor(y) : "transparent", boxShadow: on ? undefined : "inset 0 0 0 1px #5B6779" }} aria-hidden />
                    {y}
                  </button>
                );
              })}
            </div>
          }
        />
        <ChartPanel code="H.3" title={`Annual ${m.label.toLowerCase()}`} subtitle={metric === "inventory" ? "Unsold units at year end (or latest quarter)" : metric === "avgPrice" || metric === "dsRatio" ? "Supply-weighted annual value" : "Sum of quarters"} option={opts?.annual ?? null} table={annualTbl} loading={loading} height={320} />
      </div>

      <section className="frame mt-4 rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60" aria-label="Period comparison">
        <header className="border-b border-ink-600/50 px-5 py-4">
          <span className="eyebrow text-signal-400">H.4</span>
          <h3 className="mt-1 text-[15px] font-semibold text-white">Compare two periods</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Pick any start and end quarter for each period. Flows (demand, supply) are summed; price is supply-weighted; inventory is taken at period end.</p>
        </header>
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto_1fr]">
          {[
            { name: "Period A", v: a, set: setA, valid: validA, len: lenA },
            { name: "Period B", v: b, set: setB, valid: validB, len: lenB },
          ].map((p, i) => (
            <div key={p.name} className={cn("rounded-xs bg-ink-900/60 p-4 ring-1 ring-inset", p.valid ? "ring-ink-600/60" : "ring-negative/60", i === 1 && "lg:order-3")}>
              <p className="text-[13px] font-medium text-white">
                {p.name} <span className="ml-1 font-mono text-[11px] text-muted">{p.valid ? `${p.len} quarter${p.len > 1 ? "s" : ""}` : ""}</span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select label="From" size="sm" value={key(p.v.from)} onChange={(e) => p.set({ ...p.v, from: parse(e.target.value) })} options={periodOptions} />
                <Select label="To" size="sm" value={key(p.v.to)} onChange={(e) => p.set({ ...p.v, to: parse(e.target.value) })} options={periodOptions} />
              </div>
              {!p.valid && <p className="mt-2 text-[12px] text-negative">“From” must be on or before “To”.</p>}
            </div>
          ))}
          <div className="hidden items-center justify-center text-muted lg:order-2 lg:flex">
            <ArrowRight className="h-5 w-5" aria-hidden />
          </div>
        </div>
        {lenA !== lenB && validA && validB && (
          <p className="mx-5 -mt-1 mb-3 rounded-xs bg-caution/10 px-3 py-2 text-[12px] text-caution">Periods have different lengths ({lenA} vs {lenB} quarters) — compare flows with care.</p>
        )}
        <div className="overflow-x-auto px-5 pb-5">
          <table className={cn("w-full min-w-[560px] text-[13px] transition-opacity", cmpLoading && "opacity-50")}>
            <thead>
              <tr className="border-b border-ink-600 text-muted">
                <th scope="col" className="py-2 text-left font-medium">Indicator</th>
                <th scope="col" className="py-2 text-right font-medium">Period A</th>
                <th scope="col" className="py-2 text-right font-medium">Period B</th>
                <th scope="col" className="py-2 text-right font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {cmpRows.map((r) => {
                const ch = r.a && r.b !== null ? ((r.b - r.a) / r.a) * 100 : null;
                return (
                  <tr key={r.label} className="border-b border-ink-700/60">
                    <th scope="row" className="py-2.5 text-left font-normal text-white/85">{r.label}</th>
                    <td className="py-2.5 text-right font-mono text-white/80">{r.fmt(r.a)}</td>
                    <td className="py-2.5 text-right font-mono text-white/80">{r.fmt(r.b)}</td>
                    <td className={cn("py-2.5 text-right font-mono", ch === null ? "text-muted" : ch >= 0 ? "text-positive" : "text-negative")}>{formatPct(ch)}</td>
                  </tr>
                );
              })}
              {!cmpRows.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted">
                    {validA && validB ? "No data for the selected periods." : "Fix the period selection above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
