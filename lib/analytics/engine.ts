/**
 * Pure analytics engine. Operates on canonical MarketRecord rows and returns
 * the shapes consumed by dashboards. It has no knowledge of where records come
 * from — the demo service feeds it synthetic rows; a future server-side service
 * can run the same functions over database rows (or replace them with SQL).
 */
import type {
  Aggregate,
  BhkConfiguration,
  Bracket,
  BreakdownDimension,
  BreakdownOptions,
  BreakdownRow,
  EntityComparison,
  KpiSet,
  MarketCatalog,
  MarketFilters,
  MarketRecord,
  PeriodDescriptor,
  PeriodRef,
  ShareTrendPoint,
  TrendPoint,
} from "@/types/market";
import { BHK_CONFIGURATIONS, BHK_LABELS, PROPERTY_TYPES, bucketFor } from "@/lib/config/dimensions";
import {
  fromIndex,
  inRange,
  lastPeriodOf,
  periodIndex,
  periodKey,
  periodLabel,
  resolvePeriod,
  shiftDescriptor,
  shiftPeriod,
} from "./period";

export const pctChange = (cur: number | null, prev: number | null): number | null => {
  if (cur === null || prev === null || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
};

interface Acc {
  demand: number;
  supply: number;
  priceWeighted: number;
  inventoryByPeriod: Map<number, number>;
  count: number;
}

const newAcc = (): Acc => ({ demand: 0, supply: 0, priceWeighted: 0, inventoryByPeriod: new Map(), count: 0 });

function addToAcc(acc: Acc, r: MarketRecord) {
  acc.demand += r.demand;
  acc.supply += r.supply;
  acc.priceWeighted += r.average_price * r.supply;
  const pi = r.reporting_year * 4 + (r.reporting_quarter - 1);
  acc.inventoryByPeriod.set(pi, (acc.inventoryByPeriod.get(pi) ?? 0) + r.inventory);
  acc.count += 1;
}

function finish(acc: Acc, lastPeriodIdx: number | null): Aggregate {
  const inventory = lastPeriodIdx === null ? 0 : acc.inventoryByPeriod.get(lastPeriodIdx) ?? 0;
  return {
    demand: acc.demand,
    supply: acc.supply,
    avgPrice: acc.supply > 0 ? acc.priceWeighted / acc.supply : null,
    inventory,
    dsRatio: acc.supply > 0 ? acc.demand / acc.supply : null,
    recordCount: acc.count,
  };
}

export class AnalyticsEngine {
  private byPeriod = new Map<number, MarketRecord[]>();

  constructor(
    private readonly records: MarketRecord[],
    private readonly catalog: MarketCatalog,
  ) {
    for (const r of records) {
      const i = r.reporting_year * 4 + (r.reporting_quarter - 1);
      const list = this.byPeriod.get(i);
      if (list) list.push(r);
      else this.byPeriod.set(i, [r]);
    }
  }

  get first() {
    return this.catalog.firstPeriod;
  }
  get latest() {
    return this.catalog.latestPeriod;
  }

  /* ---------------------------------------------------------------- scope */

  private inScope(r: MarketRecord, f: Pick<MarketFilters, "cityId" | "micromarketId" | "propertyType">) {
    if (f.cityId !== "all" && r.city_id !== f.cityId) return false;
    if (f.micromarketId !== "all" && r.micromarket_id !== f.micromarketId) return false;
    if (f.propertyType !== "all" && r.property_type !== f.propertyType) return false;
    return true;
  }

  /** Records for a set of quarters within the scope of the filters. */
  selectRecords(f: MarketFilters, period: PeriodDescriptor | PeriodRef[]): MarketRecord[] {
    const quarters = Array.isArray(period) ? period : period.quarters;
    const out: MarketRecord[] = [];
    for (const p of quarters) {
      const list = this.byPeriod.get(periodIndex(p));
      if (!list) continue;
      for (const r of list) if (this.inScope(r, f)) out.push(r);
    }
    return out;
  }

  aggregate(f: MarketFilters, period: PeriodDescriptor | null): Aggregate | null {
    if (!period || period.quarters.length === 0) return null;
    const acc = newAcc();
    for (const r of this.selectRecords(f, period)) addToAcc(acc, r);
    const last = lastPeriodOf(period);
    return finish(acc, last ? periodIndex(last) : null);
  }

  periods(f: Pick<MarketFilters, "year" | "quarter">) {
    const current = resolvePeriod(f, this.first, this.latest);
    const basis: "QoQ" | "YoY" = f.quarter === "all" ? "YoY" : "QoQ";
    const comparison = shiftDescriptor(current, basis === "QoQ" ? -1 : -4, this.first, this.latest);
    const yoy = shiftDescriptor(current, -4, this.first, this.latest);
    return { current, comparison, yoy, basis };
  }

  /* ----------------------------------------------------------------- KPIs */

  kpis(f: MarketFilters): KpiSet {
    const { current, comparison, yoy, basis } = this.periods(f);
    const cur = this.aggregate(f, current) ?? finish(newAcc(), null);
    const comp = this.aggregate(f, comparison);
    const yoyAgg = this.aggregate(f, yoy);
    const months = current.quarters.length * 3;
    const monthlyDemand = months > 0 ? cur.demand / months : 0;
    return {
      period: current,
      comparisonPeriod: comparison,
      yoyPeriod: yoy,
      current: cur,
      comparison: comp,
      yoy: yoyAgg,
      priceAppreciationYoY: pctChange(cur.avgPrice, yoyAgg?.avgPrice ?? null),
      monthsOfInventory: monthlyDemand > 0 ? cur.inventory / monthlyDemand : null,
      comparisonBasis: basis,
      sparkline: this.trend(f, 8),
    };
  }

  /* ---------------------------------------------------------------- trend */

  /** Quarterly series ending at the last quarter of the selected period. */
  trend(f: MarketFilters, quarters = 12): TrendPoint[] {
    const { current } = this.periods(f);
    const end = lastPeriodOf(current) ?? this.latest;
    const endIdx = periodIndex(end);
    const startIdx = Math.max(periodIndex(this.first), endIdx - quarters + 1);
    const points: TrendPoint[] = [];
    const priceByIdx = new Map<number, number | null>();
    // compute 4 quarters earlier as well for YoY
    for (let i = Math.max(periodIndex(this.first), startIdx - 4); i <= endIdx; i++) {
      const p = fromIndex(i);
      const agg = this.aggregate(f, { label: "", quarters: [p], partial: false });
      if (!agg) continue;
      priceByIdx.set(i, agg.avgPrice);
      if (i < startIdx) continue;
      points.push({
        key: periodKey(p),
        label: periodLabel(p),
        year: p.year,
        quarter: p.quarter,
        demand: agg.demand,
        supply: agg.supply,
        avgPrice: agg.avgPrice,
        inventory: agg.inventory,
        dsRatio: agg.dsRatio,
        priceYoY: pctChange(agg.avgPrice, priceByIdx.get(i - 4) ?? null),
      });
    }
    return points;
  }

  /** Full history for the scope, all quarters in the dataset. */
  history(f: Omit<MarketFilters, "year" | "quarter">): TrendPoint[] {
    const total = periodIndex(this.latest) - periodIndex(this.first) + 1;
    return this.trend({ ...f, year: this.latest.year, quarter: this.latest.quarter }, total);
  }

  /* ------------------------------------------------------------ breakdown */

  private categories(dim: BreakdownDimension, f: MarketFilters, opts?: BreakdownOptions) {
    switch (dim) {
      case "bhk":
        return BHK_CONFIGURATIONS.map((b) => ({ id: b as string, label: BHK_LABELS[b] }));
      case "ticket":
        return (opts?.brackets ?? this.catalog.ticketBrackets).map((b) => ({ id: b.id, label: b.label }));
      case "size":
        return (opts?.brackets ?? this.catalog.sizeBrackets).map((b) => ({ id: b.id, label: `${b.label} sq ft` }));
      case "propertyType":
        return PROPERTY_TYPES.map((p) => ({ id: p.id as string, label: p.label }));
      case "city":
        return this.catalog.cities.map((c) => ({ id: c.city_id, label: c.city_name }));
      case "micromarket": {
        const cities = f.cityId === "all" ? this.catalog.cities : this.catalog.cities.filter((c) => c.city_id === f.cityId);
        return cities.flatMap((c) =>
          c.micromarkets.map((m) => ({
            id: m.micromarket_id,
            label: f.cityId === "all" ? `${m.micromarket_name}, ${c.city_name}` : m.micromarket_name,
          })),
        );
      }
    }
  }

  private keyFn(dim: BreakdownDimension, opts?: BreakdownOptions): (r: MarketRecord) => string {
    switch (dim) {
      case "bhk":
        return (r) => r.bhk_configuration;
      case "ticket": {
        const br: Bracket[] = opts?.brackets ?? this.catalog.ticketBrackets;
        return opts?.brackets ? (r) => bucketFor(r.ticket_size_inr, br).id : (r) => r.ticket_size_bracket;
      }
      case "size": {
        const br: Bracket[] = opts?.brackets ?? this.catalog.sizeBrackets;
        return opts?.brackets ? (r) => bucketFor(r.unit_size_sqft, br).id : (r) => r.property_size_bracket;
      }
      case "propertyType":
        return (r) => r.property_type;
      case "city":
        return (r) => r.city_id;
      case "micromarket":
        return (r) => r.micromarket_id;
    }
  }

  private grouped(f: MarketFilters, period: PeriodDescriptor | null, dim: BreakdownDimension, opts?: BreakdownOptions) {
    const map = new Map<string, Acc>();
    if (!period) return { map, lastIdx: null as number | null };
    const key = this.keyFn(dim, opts);
    for (const r of this.selectRecords(f, period)) {
      const k = key(r);
      let acc = map.get(k);
      if (!acc) map.set(k, (acc = newAcc()));
      addToAcc(acc, r);
    }
    const last = lastPeriodOf(period);
    return { map, lastIdx: last ? periodIndex(last) : null };
  }

  breakdown(f: MarketFilters, dim: BreakdownDimension, opts?: BreakdownOptions): BreakdownRow[] {
    const { current, comparison, yoy } = this.periods(f);
    const cur = this.grouped(f, current, dim, opts);
    const comp = this.grouped(f, comparison, dim, opts);
    const prevYear = this.grouped(f, yoy, dim, opts);
    const cats = this.categories(dim, f, opts);

    let totalD = 0;
    let totalS = 0;
    cur.map.forEach((a) => {
      totalD += a.demand;
      totalS += a.supply;
    });

    const rows = cats.map((c) => {
      const a = finish(cur.map.get(c.id) ?? newAcc(), cur.lastIdx);
      const pAcc = comp.map.get(c.id);
      const p = pAcc ? finish(pAcc, comp.lastIdx) : null;
      const yAcc = prevYear.map.get(c.id);
      const y = yAcc ? finish(yAcc, prevYear.lastIdx) : null;
      const demandShare = totalD > 0 ? (a.demand / totalD) * 100 : 0;
      const supplyShare = totalS > 0 ? (a.supply / totalS) * 100 : 0;
      return {
        id: c.id,
        label: c.label,
        demand: a.demand,
        supply: a.supply,
        avgPrice: a.avgPrice,
        inventory: a.inventory,
        dsRatio: a.dsRatio,
        demandShare,
        supplyShare,
        gapPp: demandShare - supplyShare,
        demandChange: p ? pctChange(a.demand, p.demand) : null,
        supplyChange: p ? pctChange(a.supply, p.supply) : null,
        priceYoY: y ? pctChange(a.avgPrice, y.avgPrice) : null,
      } satisfies BreakdownRow;
    });

    if (dim === "micromarket" || dim === "city") {
      return rows.filter((r) => r.demand + r.supply > 0).sort((a, b) => b.demand - a.demand);
    }
    return rows;
  }

  /** Quarterly share of each category (demand and supply), for mix-shift charts. */
  shareTrend(f: MarketFilters, dim: BreakdownDimension, quarters = 8, opts?: BreakdownOptions): ShareTrendPoint[] {
    const series = this.trend(f, quarters);
    return series.map((pt) => {
      const period: PeriodDescriptor = { label: pt.label, quarters: [{ year: pt.year, quarter: pt.quarter }], partial: false };
      const g = this.grouped(f, period, dim, opts);
      let d = 0;
      let s = 0;
      g.map.forEach((a) => {
        d += a.demand;
        s += a.supply;
      });
      const demandShare: Record<string, number> = {};
      const supplyShare: Record<string, number> = {};
      this.categories(dim, f, opts).forEach((c) => {
        const a = g.map.get(c.id);
        demandShare[c.id] = a && d > 0 ? (a.demand / d) * 100 : 0;
        supplyShare[c.id] = a && s > 0 ? (a.supply / s) * 100 : 0;
      });
      return { key: pt.key, label: pt.label, demandShare, supplyShare };
    });
  }

  /** Average price by BHK over time. */
  priceByBhk(f: MarketFilters, quarters = 12): { key: string; label: string; values: Record<BhkConfiguration, number | null> }[] {
    return this.trend(f, quarters).map((pt) => {
      const period: PeriodDescriptor = { label: pt.label, quarters: [{ year: pt.year, quarter: pt.quarter }], partial: false };
      const g = this.grouped(f, period, "bhk");
      const values = {} as Record<BhkConfiguration, number | null>;
      BHK_CONFIGURATIONS.forEach((b) => {
        const a = g.map.get(b);
        values[b] = a && a.supply > 0 ? a.priceWeighted / a.supply : null;
      });
      return { key: pt.key, label: pt.label, values };
    });
  }

  /** Supply-weighted distribution of record prices into ₹/sq ft bands. */
  priceDistribution(f: MarketFilters, bandWidth = 2500) {
    const { current } = this.periods(f);
    const recs = this.selectRecords(f, current);
    const bands = new Map<number, { demand: number; supply: number }>();
    for (const r of recs) {
      const b = Math.floor(r.average_price / bandWidth) * bandWidth;
      const cur = bands.get(b) ?? { demand: 0, supply: 0 };
      cur.demand += r.demand;
      cur.supply += r.supply;
      bands.set(b, cur);
    }
    return [...bands.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([min, v]) => ({ min, max: min + bandWidth, ...v }));
  }

  /* ------------------------------------------------------------ compare */

  compare(
    ids: string[],
    level: "micromarket" | "city",
    f: Pick<MarketFilters, "year" | "quarter" | "propertyType">,
    trendQuarters = 12,
  ): EntityComparison[] {
    return ids
      .map((id) => {
        let scope: MarketFilters;
        let label = id;
        let cityName = "";
        if (level === "city") {
          const c = this.catalog.cities.find((x) => x.city_id === id);
          if (!c) return null;
          label = c.city_name;
          cityName = c.city_name;
          scope = { cityId: id, micromarketId: "all", ...f };
        } else {
          const c = this.catalog.cities.find((x) => x.micromarkets.some((m) => m.micromarket_id === id));
          const m = c?.micromarkets.find((x) => x.micromarket_id === id);
          if (!c || !m) return null;
          label = m.micromarket_name;
          cityName = c.city_name;
          scope = { cityId: c.city_id, micromarketId: id, ...f };
        }
        const k = this.kpis(scope);
        return {
          id,
          label,
          cityName,
          aggregate: k.current,
          priceYoY: k.priceAppreciationYoY,
          trend: this.trend(scope, trendQuarters),
          bhkMix: this.breakdown(scope, "bhk"),
          ticketMix: this.breakdown(scope, "ticket"),
        } satisfies EntityComparison;
      })
      .filter((x): x is EntityComparison => x !== null);
  }

  /** Aggregate for an arbitrary period range (historical comparisons). */
  rangeAggregate(f: Omit<MarketFilters, "year" | "quarter">, from: PeriodRef, to: PeriodRef): Aggregate | null {
    const quarters: PeriodRef[] = [];
    for (let i = periodIndex(from); i <= periodIndex(to); i++) {
      const p = fromIndex(i);
      if (inRange(p, this.first, this.latest)) quarters.push(p);
    }
    return this.aggregate({ ...f, year: from.year, quarter: "all" }, { label: "", quarters, partial: false });
  }

  shift(p: PeriodRef, n: number) {
    return shiftPeriod(p, n);
  }
}
