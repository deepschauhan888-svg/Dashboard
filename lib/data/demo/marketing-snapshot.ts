/**
 * Read-only snapshot of the DEMONSTRATION dataset for marketing pages.
 * Uses the same engine as the dashboards, so previews and the product agree.
 */
import { ALL_FILTERS } from "@/lib/analytics/filters";
import type { MarketFilters } from "@/types/market";
import { getDemoService } from "@/lib/services";

export function getMarketingSnapshot() {
  const svc = getDemoService();
  const engine = svc.engineSync();
  const catalog = svc.catalogSync();
  const latest = catalog.latestPeriod;
  const quarterFilters: MarketFilters = { ...ALL_FILTERS, year: latest.year, quarter: latest.quarter };
  const yearFilters: MarketFilters = { ...quarterFilters, quarter: "all" };
  return {
    catalog,
    latest,
    quarterFilters,
    yearFilters,
    trend: engine.trend(quarterFilters, 12),
    bhk: engine.breakdown(yearFilters, "bhk"),
    ticket: engine.breakdown(yearFilters, "ticket"),
    size: engine.breakdown(yearFilters, "size"),
    cities: engine.breakdown(yearFilters, "city"),
    yearPeriodLabel: engine.periods(yearFilters).current.label,
    engine,
  };
}

export type MarketingSnapshot = ReturnType<typeof getMarketingSnapshot>;
