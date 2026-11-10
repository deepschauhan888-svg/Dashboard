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
  ShareTrendPoint,
  TrendPoint,
} from "@/types/market";

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
  getHistory(filters: Omit<MarketFilters, "year" | "quarter">): Promise<TrendPoint[]>;
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
    filters: Pick<MarketFilters, "year" | "quarter" | "propertyType">,
    trendQuarters?: number,
  ): Promise<EntityComparison[]>;
  getRangeAggregate(
    filters: Omit<MarketFilters, "year" | "quarter">,
    from: PeriodRef,
    to: PeriodRef,
  ): Promise<Aggregate | null>;
  getObservations(filters: MarketFilters): Promise<Observation[]>;
}
