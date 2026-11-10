/**
 * MarketDataService — the ONLY contract dashboards depend on.
 *
 * Implementations:
 *  - DemoMarketDataService  (synthetic, in-browser; default for the showcase)
 *  - ApiMarketDataService   (future: Next.js route handlers / Supabase / Postgres)
 *
 * Every method is async so that swapping the demo provider for a network
 * provider requires no change to components.
 */
import type {
  Aggregate,
  BhkConfiguration,
  BreakdownDimension,
  BreakdownOptions,
  BreakdownRow,
  EntityComparison,
  KpiSet,
  MarketCatalog,
  MarketFilters,
  Observation,
  PeriodRef,
  ScopeFilters,
  ShareTrendPoint,
  TrendPoint,
} from "@/types/market";

import type { CrossTab } from "@/lib/analytics/engine";
export type { CrossTab };

export interface MicromarketSeries {
  quarters: string[];
  micromarkets: { id: string; label: string; series: (Aggregate | null)[] }[];
}

export interface PriceBand {
  min: number;
  max: number;
  demand: number;
  supply: number;
}

export interface PriceByBhkPoint {
  key: string;
  label: string;
  values: Record<BhkConfiguration, number | null>;
}

export interface MarketDataService {
  readonly mode: "demo" | "live";
  getCatalog(): Promise<MarketCatalog>;
  getKpis(filters: MarketFilters): Promise<KpiSet>;
  getTrend(filters: MarketFilters, quarters?: number): Promise<TrendPoint[]>;
  getHistory(filters: ScopeFilters): Promise<TrendPoint[]>;
  getBreakdown(filters: MarketFilters, dimension: BreakdownDimension, options?: BreakdownOptions): Promise<BreakdownRow[]>;
  getShareTrend(
    filters: MarketFilters,
    dimension: BreakdownDimension,
    quarters?: number,
    options?: BreakdownOptions,
  ): Promise<ShareTrendPoint[]>;
  getPriceByBhk(filters: MarketFilters, quarters?: number): Promise<PriceByBhkPoint[]>;
  getPriceDistribution(filters: MarketFilters, bandWidth?: number): Promise<PriceBand[]>;
  compare(
    ids: string[],
    level: "micromarket" | "city",
    filters: Omit<MarketFilters, "cityId" | "micromarketId">,
    trendQuarters?: number,
  ): Promise<EntityComparison[]>;
  getRangeAggregate(
    filters: ScopeFilters,
    from: PeriodRef,
    to: PeriodRef,
  ): Promise<Aggregate | null>;
  getObservations(filters: MarketFilters): Promise<Observation[]>;
  getCrossTab(filters: MarketFilters, rowDim: BreakdownDimension, colDim: BreakdownDimension): Promise<CrossTab>;
  getMicromarketSeries(filters: MarketFilters, quarters?: number): Promise<MicromarketSeries>;
}
