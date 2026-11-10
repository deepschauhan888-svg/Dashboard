import type { MarketFilters, PeriodDescriptor, PeriodRef, Quarter } from "@/types/market";

export const periodKey = (p: PeriodRef) => `${p.year}-Q${p.quarter}`;
export const periodLabel = (p: PeriodRef) => `Q${p.quarter} ${p.year}`;
export const periodIndex = (p: PeriodRef) => p.year * 4 + (p.quarter - 1);
export const fromIndex = (i: number): PeriodRef => ({
  year: Math.floor(i / 4),
  quarter: ((i % 4) + 1) as Quarter,
});

export function comparePeriods(a: PeriodRef, b: PeriodRef) {
  return periodIndex(a) - periodIndex(b);
}

export function shiftPeriod(p: PeriodRef, quarters: number): PeriodRef {
  return fromIndex(periodIndex(p) + quarters);
}

export function inRange(p: PeriodRef, first: PeriodRef, last: PeriodRef) {
  const i = periodIndex(p);
  return i >= periodIndex(first) && i <= periodIndex(last);
}

/** Resolve the filter's year/quarter into the concrete set of quarters. */
export function resolvePeriod(
  filters: Pick<MarketFilters, "year" | "quarter">,
  first: PeriodRef,
  latest: PeriodRef,
): PeriodDescriptor {
  if (filters.quarter !== "all") {
    const p = { year: filters.year, quarter: filters.quarter };
    return { label: periodLabel(p), quarters: inRange(p, first, latest) ? [p] : [], partial: false };
  }
  const quarters: PeriodRef[] = [];
  for (let q = 1 as Quarter; q <= 4; q = (q + 1) as Quarter) {
    const p = { year: filters.year, quarter: q };
    if (inRange(p, first, latest)) quarters.push(p);
    if (q === 4) break;
  }
  const partial = quarters.length > 0 && quarters.length < 4;
  const label = partial
    ? `${filters.year} YTD (Q${quarters[0].quarter}–Q${quarters[quarters.length - 1].quarter})`
    : `CY ${filters.year}`;
  return { label, quarters, partial };
}

/** Same quarters shifted by `deltaQuarters`; null if any falls outside the data window. */
export function shiftDescriptor(
  d: PeriodDescriptor,
  deltaQuarters: number,
  first: PeriodRef,
  latest: PeriodRef,
): PeriodDescriptor | null {
  if (d.quarters.length === 0) return null;
  const quarters = d.quarters.map((p) => shiftPeriod(p, deltaQuarters));
  if (!quarters.every((p) => inRange(p, first, latest))) return null;
  if (quarters.length === 1) return { label: periodLabel(quarters[0]), quarters, partial: false };
  const y = quarters[0].year;
  return {
    label: d.partial
      ? `${y} (Q${quarters[0].quarter}–Q${quarters[quarters.length - 1].quarter})`
      : `CY ${y}`,
    quarters,
    partial: d.partial,
  };
}

export function lastPeriodOf(d: PeriodDescriptor): PeriodRef | null {
  return d.quarters.length ? d.quarters[d.quarters.length - 1] : null;
}
