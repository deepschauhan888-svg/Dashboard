/**
 * Chart option adapters: domain data → ECharts options.
 * Components never hand-assemble ECharts options; they call these builders,
 * which keeps styling identical everywhere and makes charts testable.
 */
import type { EChartsOption } from "echarts";
import type { BreakdownRow, EntityComparison, TrendPoint } from "@/types/market";
import { chartColors, monoStack } from "./theme";
import { formatCompact, formatNumber, formatPct, formatPp, formatPsf, formatRatio } from "@/lib/utils/format";

type Fmt = (v: number | null) => string;

/**
 * Builders assemble plain objects and hand them to ECharts as EChartsOption.
 * The cast keeps the adapters decoupled from ECharts' very deep option typings
 * (which change between minor versions); runtime shape is covered by the
 * chart-rendering smoke tests.
 */
const asOption = (o: object): EChartsOption => o as unknown as EChartsOption;

interface TipParam {
  seriesName?: string;
  value?: unknown;
  color?: unknown;
  name?: string;
  axisValueLabel?: string;
  dataIndex?: number;
}

const dot = (c: unknown) =>
  `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:8px;background:${String(c)}"></span>`;

const row = (color: unknown, label: string, value: string) =>
  `<div style="display:flex;justify-content:space-between;gap:24px;align-items:center;line-height:20px">` +
  `<span style="color:${chartColors.textSecondary}">${dot(color)}${label}</span>` +
  `<span style="font-family:${monoStack};color:${chartColors.textPrimary}">${value}</span></div>`;

const head = (t: string) =>
  `<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${chartColors.textMuted};margin-bottom:6px">${t}</div>`;

function numericValue(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (Array.isArray(v)) return typeof v[v.length - 1] === "number" ? (v[v.length - 1] as number) : null;
  return null;
}

/** Axis tooltip with per-series formatter. */
function axisTooltip(fmt: Record<string, Fmt> | Fmt, extra?: (idx: number) => string) {
  return (raw: unknown) => {
    const params = (Array.isArray(raw) ? raw : [raw]) as TipParam[];
    if (!params.length) return "";
    let html = head(params[0].axisValueLabel ?? params[0].name ?? "");
    params.forEach((p) => {
      const f = typeof fmt === "function" ? fmt : fmt[p.seriesName ?? ""] ?? formatNumber;
      html += row(p.color, p.seriesName ?? "", f(numericValue(p.value)));
    });
    if (extra && params[0].dataIndex !== undefined) html += extra(params[0].dataIndex);
    return html;
  };
}

const baseLine = (name: string, data: (number | null)[], color: string, opts: { area?: boolean; dashed?: boolean } = {}) => ({
  name,
  type: "line" as const,
  data,
  smooth: 0.25,
  symbol: "circle",
  symbolSize: 8,
  showSymbol: false,
  lineStyle: { width: 2, color, type: opts.dashed ? ("dashed" as const) : ("solid" as const) },
  itemStyle: { color, borderColor: chartColors.surface, borderWidth: 2 },
  emphasis: { focus: "series" as const },
  areaStyle: opts.area
    ? {
        color: {
          type: "linear" as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${color}33` },
            { offset: 1, color: `${color}00` },
          ],
        },
      }
    : undefined,
});

/* ------------------------------------------------------------------ */

/** A. Demand vs supply quarterly lines + market gap bars on a separate grid (no dual axis). */
export function demandSupplyOption(points: TrendPoint[], opts: { highlightKey?: string } = {}): EChartsOption {
  const labels = points.map((p) => p.label);
  const gap = points.map((p) => p.demand - p.supply);
  const hi = opts.highlightKey ? points.findIndex((p) => p.key === opts.highlightKey) : -1;
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, data: ["Demand", "Supply"] },
    grid: [
      { left: 8, right: 16, top: 36, height: "56%", containLabel: true },
      { left: 8, right: 16, top: "76%", bottom: 4, containLabel: true },
    ],
    tooltip: {
      trigger: "axis",
      formatter: axisTooltip({ Demand: formatNumber, Supply: formatNumber, "Market gap": (v) => (v === null ? "—" : `${v > 0 ? "+" : ""}${formatNumber(v)}`) }),
    },
    axisPointer: { link: [{ xAxisIndex: "all" }] },
    xAxis: [
      { type: "category", data: labels, gridIndex: 0, axisLabel: { show: false }, boundaryGap: true },
      { type: "category", data: labels, gridIndex: 1, boundaryGap: true, axisLabel: { hideOverlap: true } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, scale: true, axisLabel: { formatter: (v: number) => formatCompact(v) } },
      { type: "value", gridIndex: 1, splitNumber: 2, axisLabel: { formatter: (v: number) => formatCompact(v) } },
    ],
    series: [
      {
        ...baseLine("Demand", points.map((p) => p.demand), chartColors.demand, { area: true }),
        markArea:
          hi >= 0
            ? { silent: true, itemStyle: { color: "rgba(49,139,255,0.06)" }, data: [[{ xAxis: labels[hi] }, { xAxis: labels[hi] }]] }
            : undefined,
      },
      baseLine("Supply", points.map((p) => p.supply), chartColors.supply),
      {
        name: "Market gap",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        barMaxWidth: 14,
        data: gap.map((g) => ({
          value: g,
          itemStyle: {
            color: g >= 0 ? chartColors.demand : chartColors.supply,
            borderRadius: g >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
          },
        })),
      },
    ],
  });
}

/** B. Price trajectory + YoY appreciation on separate grids. */
export function priceTrendOption(points: TrendPoint[]): EChartsOption {
  const labels = points.map((p) => p.label);
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, data: ["Avg price (₹/sq ft)", "YoY appreciation"] },
    grid: [
      { left: 8, right: 16, top: 36, height: "56%", containLabel: true },
      { left: 8, right: 16, top: "76%", bottom: 4, containLabel: true },
    ],
    tooltip: {
      trigger: "axis",
      formatter: axisTooltip({ "Avg price (₹/sq ft)": formatPsf, "YoY appreciation": (v) => formatPct(v) }),
    },
    axisPointer: { link: [{ xAxisIndex: "all" }] },
    xAxis: [
      { type: "category", data: labels, gridIndex: 0, axisLabel: { show: false } },
      { type: "category", data: labels, gridIndex: 1, axisLabel: { hideOverlap: true } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, scale: true, axisLabel: { formatter: (v: number) => `₹${formatCompact(v)}` } },
      { type: "value", gridIndex: 1, splitNumber: 2, axisLabel: { formatter: (v: number) => `${v}%` } },
    ],
    series: [
      baseLine("Avg price (₹/sq ft)", points.map((p) => (p.avgPrice === null ? null : Math.round(p.avgPrice))), chartColors.price, { area: true }),
      {
        name: "YoY appreciation",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        barMaxWidth: 14,
        data: points.map((p) => (p.priceYoY === null ? null : Math.round(p.priceYoY * 10) / 10)),
        itemStyle: { color: chartColors.price, borderRadius: [4, 4, 0, 0], opacity: 0.75 },
      },
    ],
  });
}

/** Demand share vs supply share by category (grouped horizontal bars). */
export function shareComparisonOption(rows: BreakdownRow[], opts: { horizontal?: boolean } = {}): EChartsOption {
  const horizontal = opts.horizontal ?? true;
  const cats = rows.map((r) => r.label);
  const catAxis = { type: "category" as const, data: horizontal ? [...cats].reverse() : cats, axisLabel: { color: chartColors.textSecondary } };
  const valAxis = { type: "value" as const, axisLabel: { formatter: (v: number) => `${v}%` } };
  const order = horizontal ? [...rows].reverse() : rows;
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, data: ["Demand share", "Supply share"] },
    grid: { left: 8, right: 24, top: 32, bottom: 4, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } },
      formatter: axisTooltip({ "Demand share": (v) => formatPct(v, 1, false), "Supply share": (v) => formatPct(v, 1, false) }, (i) => {
        const r = order[i];
        return r ? row("transparent", "Gap (demand − supply)", formatPp(r.gapPp)) + row("transparent", "Demand units", formatNumber(r.demand)) + row("transparent", "Supply units", formatNumber(r.supply)) : "";
      }),
    },
    xAxis: horizontal ? valAxis : catAxis,
    yAxis: horizontal ? catAxis : valAxis,
    series: [
      {
        name: "Demand share",
        type: "bar",
        barGap: "18%",
        barMaxWidth: 14,
        data: order.map((r) => Math.round(r.demandShare * 10) / 10),
        itemStyle: { color: chartColors.demand, borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      },
      {
        name: "Supply share",
        type: "bar",
        barMaxWidth: 14,
        data: order.map((r) => Math.round(r.supplyShare * 10) / 10),
        itemStyle: { color: chartColors.supply, borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      },
    ],
  });
}

/** Diverging gap (pp) by category: demand-heavy → blue, supply-heavy → orange. */
export function gapOption(rows: BreakdownRow[]): EChartsOption {
  const order = [...rows].reverse();
  return asOption({
    aria: { enabled: true },
    grid: { left: 8, right: 32, top: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: "item",
      formatter: (raw: unknown) => {
        const p = raw as TipParam;
        const r = order[p.dataIndex ?? 0];
        return head(r.label) + row(chartColors.demand, "Demand share", formatPct(r.demandShare, 1, false)) + row(chartColors.supply, "Supply share", formatPct(r.supplyShare, 1, false)) + row("transparent", "Gap", formatPp(r.gapPp));
      },
    },
    xAxis: { type: "value", axisLabel: { formatter: (v: number) => `${v > 0 ? "+" : ""}${v} pp` } },
    yAxis: { type: "category", data: order.map((r) => r.label), axisLabel: { color: chartColors.textSecondary } },
    series: [
      {
        type: "bar",
        name: "Gap",
        barMaxWidth: 14,
        data: order.map((r) => ({
          value: Math.round(r.gapPp * 10) / 10,
          itemStyle: { color: r.gapPp >= 0 ? chartColors.demand : chartColors.supply, borderRadius: r.gapPp >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4] },
        })),
        label: { show: true, position: "right", color: chartColors.textSecondary, fontFamily: monoStack, fontSize: 11, formatter: (p: unknown) => formatPp(numericValue((p as TipParam).value)) },
        markLine: { silent: true, symbol: "none", lineStyle: { color: chartColors.axis, type: "solid" }, label: { show: false }, data: [{ xAxis: 0 }] },
      },
    ],
  });
}

/** Grouped vertical bars of absolute demand & supply units per category. */
export function volumeBarsOption(rows: BreakdownRow[]): EChartsOption {
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, data: ["Demand", "Supply"] },
    grid: { left: 8, right: 16, top: 34, bottom: 4, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } },
      formatter: axisTooltip(formatNumber, (i) => row("transparent", "D/S ratio", formatRatio(rows[i]?.dsRatio ?? null))),
    },
    xAxis: { type: "category", data: rows.map((r) => r.label), axisLabel: { interval: 0, hideOverlap: true, color: chartColors.textSecondary } },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatCompact(v) } },
    series: [
      { name: "Demand", type: "bar", barGap: "18%", barMaxWidth: 22, data: rows.map((r) => r.demand), itemStyle: { color: chartColors.demand, borderRadius: [4, 4, 0, 0] } },
      { name: "Supply", type: "bar", barMaxWidth: 22, data: rows.map((r) => r.supply), itemStyle: { color: chartColors.supply, borderRadius: [4, 4, 0, 0] } },
    ],
  });
}

/** Ranked single-metric horizontal bars (one series → one colour). */
export function rankedBarsOption(
  rows: { label: string; value: number | null }[],
  opts: { color?: string; format?: Fmt; seriesName: string },
): EChartsOption {
  const f = opts.format ?? formatNumber;
  const order = [...rows].reverse();
  return asOption({
    aria: { enabled: true },
    grid: { left: 8, right: 56, top: 4, bottom: 4, containLabel: true },
    tooltip: { trigger: "item", formatter: (raw: unknown) => { const p = raw as TipParam; return head(p.name ?? "") + row(opts.color ?? chartColors.demand, opts.seriesName, f(numericValue(p.value))); } },
    xAxis: { type: "value", axisLabel: { formatter: (v: number) => formatCompact(v) } },
    yAxis: { type: "category", data: order.map((r) => r.label), axisLabel: { color: chartColors.textSecondary, width: 150, overflow: "truncate" } },
    series: [
      {
        name: opts.seriesName,
        type: "bar",
        barMaxWidth: 12,
        data: order.map((r) => r.value),
        itemStyle: { color: opts.color ?? chartColors.demand, borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right", color: chartColors.textSecondary, fontFamily: monoStack, fontSize: 11, formatter: (p: unknown) => f(numericValue((p as TipParam).value)) },
      },
    ],
  });
}

/** Multiple named series on one shared-unit axis (comparisons, configuration price trends). */
export function multiLineOption(
  labels: string[],
  series: { name: string; data: (number | null)[]; color: string }[],
  opts: { format?: Fmt; axisFormat?: (v: number) => string; scale?: boolean } = {},
): EChartsOption {
  const f = opts.format ?? formatNumber;
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, type: "scroll", pageTextStyle: { color: chartColors.textMuted } },
    grid: { left: 8, right: 16, top: 36, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", formatter: axisTooltip(f) },
    xAxis: { type: "category", data: labels, axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", scale: opts.scale ?? true, axisLabel: { formatter: opts.axisFormat ?? ((v: number) => formatCompact(v)) } },
    series: series.map((s) => baseLine(s.name, s.data, s.color)),
  });
}

/** Grouped vertical bars for N entities × metric (comparison). */
export function entityBarsOption(
  categories: string[],
  series: { name: string; data: (number | null)[]; color: string }[],
  opts: { format?: Fmt } = {},
): EChartsOption {
  const f = opts.format ?? formatNumber;
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0 },
    grid: { left: 8, right: 16, top: 34, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } }, formatter: axisTooltip(f) },
    xAxis: { type: "category", data: categories, axisLabel: { interval: 0, color: chartColors.textSecondary } },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatCompact(v) } },
    series: series.map((s) => ({ name: s.name, type: "bar" as const, barGap: "18%", barMaxWidth: 22, data: s.data, itemStyle: { color: s.color, borderRadius: [4, 4, 0, 0] } })),
  });
}

/** 100% stacked horizontal bars: mix of ordered categories per entity (ordinal ramp, 2px gaps). */
export function mixStackOption(
  entities: string[],
  categories: { id: string; label: string }[],
  shareOf: (entityIdx: number, catId: string) => number,
): EChartsOption {
  const ramp = chartColors.ordinal;
  const step = categories.length <= 1 ? 0 : (ramp.length - 1) / (categories.length - 1);
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, type: "scroll", pageTextStyle: { color: chartColors.textMuted } },
    grid: { left: 8, right: 16, top: 34, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } }, formatter: axisTooltip((v) => formatPct(v, 1, false)) },
    xAxis: { type: "value", max: 100, axisLabel: { formatter: (v: number) => `${v}%` } },
    yAxis: { type: "category", data: [...entities].reverse(), axisLabel: { color: chartColors.textSecondary, width: 140, overflow: "truncate" } },
    series: categories.map((c, ci) => ({
      name: c.label,
      type: "bar" as const,
      stack: "mix",
      barMaxWidth: 22,
      data: entities.map((_, ei) => Math.round(shareOf(entities.length - 1 - ei, c.id) * 10) / 10),
      itemStyle: { color: ramp[Math.round(ci * step)], borderColor: chartColors.surface, borderWidth: 2 },
    })),
  });
}

/** Share of each ordered category over time (lines, one per category, ordinal ramp). */
export function shareTrendOption(
  labels: string[],
  categories: { id: string; label: string }[],
  values: (catId: string) => number[],
): EChartsOption {
  const ramp = chartColors.categorical;
  return multiLineOption(
    labels,
    categories.map((c, i) => ({ name: c.label, data: values(c.id).map((v) => Math.round(v * 10) / 10), color: ramp[i % ramp.length] })),
    { format: (v) => formatPct(v, 1, false), axisFormat: (v) => `${v}%`, scale: false },
  );
}

/** Price distribution: demand & supply units by ₹/sq ft band. */
export function priceDistributionOption(bands: { min: number; max: number; demand: number; supply: number }[]): EChartsOption {
  const labels = bands.map((b) => `₹${formatCompact(b.min)}–${formatCompact(b.max)}`);
  return asOption({
    aria: { enabled: true },
    legend: { top: 0, left: 0, data: ["Demand", "Supply"] },
    grid: { left: 8, right: 16, top: 34, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } }, formatter: axisTooltip(formatNumber) },
    xAxis: { type: "category", data: labels, axisLabel: { hideOverlap: true }, name: "₹ per sq ft", nameLocation: "middle", nameGap: 28, nameTextStyle: { color: chartColors.textMuted, fontSize: 11 } },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatCompact(v) } },
    series: [
      { name: "Demand", type: "bar", barGap: "10%", barCategoryGap: "24%", data: bands.map((b) => b.demand), itemStyle: { color: chartColors.demand, borderRadius: [4, 4, 0, 0] } },
      { name: "Supply", type: "bar", data: bands.map((b) => b.supply), itemStyle: { color: chartColors.supply, borderRadius: [4, 4, 0, 0] } },
    ],
  });
}

/** Minimal sparkline for KPI cards. */
export function sparklineOption(values: (number | null)[], color: string): EChartsOption {
  return asOption({
    animation: false,
    grid: { left: 0, right: 0, top: 4, bottom: 4 },
    xAxis: { type: "category", show: false, boundaryGap: false, data: values.map((_, i) => i) },
    yAxis: { type: "value", show: false, scale: true },
    tooltip: { show: false },
    series: [
      {
        type: "line",
        data: values,
        symbol: "none",
        smooth: 0.3,
        lineStyle: { width: 1.5, color },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${color}2e` }, { offset: 1, color: `${color}00` }] } },
      },
    ],
  });
}

/** Year-over-year seasonal overlay: x = Q1..Q4, one line per year. */
export function seasonalOverlayOption(
  years: number[],
  valueFor: (year: number, quarter: number) => number | null,
  colorFor: (year: number) => string,
  fmt: Fmt,
): EChartsOption {
  return multiLineOption(
    ["Q1", "Q2", "Q3", "Q4"],
    years.map((y) => ({ name: String(y), data: [1, 2, 3, 4].map((q) => valueFor(y, q)), color: colorFor(y) })),
    { format: fmt, axisFormat: (v) => formatCompact(v) },
  );
}

/** Comparison helper: trend lines for each entity for a metric. */
export function comparisonTrendOption(
  entities: EntityComparison[],
  colorFor: (id: string) => string,
  metric: "demand" | "supply" | "avgPrice" | "dsRatio",
): EChartsOption {
  const labels = entities[0]?.trend.map((t) => t.label) ?? [];
  const fmt: Fmt = metric === "avgPrice" ? formatPsf : metric === "dsRatio" ? formatRatio : formatNumber;
  return multiLineOption(
    labels,
    entities.map((e) => ({
      name: e.label,
      color: colorFor(e.id),
      data: e.trend.map((t) => {
        const v = t[metric];
        return v === null ? null : metric === "dsRatio" ? Math.round(v * 100) / 100 : Math.round(v);
      }),
    })),
    { format: fmt, axisFormat: metric === "dsRatio" ? (v) => `${v.toFixed(1)}×` : metric === "avgPrice" ? (v) => `₹${formatCompact(v)}` : undefined },
  );
}
