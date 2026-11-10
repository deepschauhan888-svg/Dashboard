/**
 * Read-only snapshot of the DEMONSTRATION dataset for marketing pages.
 * Uses the same engine as the dashboards, so previews and the product agree.
 */
import type { MarketFilters } from "@/types/market";
import { getDemoService } from "@/lib/services";

export function getMarketingSnapshot() {
  const svc = getDemoService();
  const engine = svc.engineSync();
  const catalog = svc.catalogSync();
  const latest = catalog.latestPeriod;
  const quarterScope: MarketFilters = { cityId: "all", micromarketId: "all", year: latest.year, quarter: latest.quarter, propertyType: "all" };
  const yearScope: MarketFilters = { ...quarterScope, quarter: "all" };
  return {
    catalog,
    latest,
    kpis: engine.kpis(quarterScope),
    trend: engine.trend(quarterScope, 12),
    bhk: engine.breakdown(yearScope, "bhk"),
    ticket: engine.breakdown(yearScope, "ticket"),
    size: engine.breakdown(yearScope, "size"),
    cities: engine.breakdown(yearScope, "city"),
    yearPeriodLabel: engine.periods(yearScope).current.label,
    engine,
  };
}

export type MarketingSnapshot = ReturnType<typeof getMarketingSnapshot>;
