/**
 * Core analytical types for MB Research Intelligence.
 *
 * These types describe the canonical data model shared by the demonstration
 * data provider and the future API/database provider. Dashboard components
 * depend ONLY on these types and on the MarketDataService interface — never on
 * the demo dataset directly.
 *
 * Units (applied consistently everywhere):
 *  - demand          buyer-demand units in the period (count; demo definition:
 *                    normalised qualified buyer enquiries)
 *  - supply          new residential units listed / launched in the period (count)
 *  - average_price   ₹ per sq ft (super built-up), supply-weighted when aggregated
 *  - price_change    % change in average_price vs the previous quarter (record level)
 *  - inventory       unsold units at the END of the period (stock, not flow)
 *  - unit_size_sqft  representative unit size of the record's product archetype
 *  - ticket_size_inr representative ticket size (₹) = average_price × unit_size_sqft
 */

export type Quarter = 1 | 2 | 3 | 4;

export type BhkConfiguration = "1BHK" | "2BHK" | "3BHK" | "4BHK+";

export type PropertyType = "apartment" | "builder_floor" | "villa";

export interface Bracket {
  id: string;
  label: string;
  /** inclusive lower bound */
  min: number;
  /** exclusive upper bound; null = open-ended */
  max: number | null;
}

export interface BracketPreset {
  id: string;
  label: string;
  description: string;
  brackets: Bracket[];
}

export interface Micromarket {
  micromarket_id: string;
  micromarket_name: string;
  city_id: string;
}

export interface City {
  city_id: string;
  city_name: string;
  state: string;
  region: string;
  /** geographic coordinates used by the coverage map */
  lat: number;
  lon: number;
  micromarkets: Micromarket[];
}

/** One fact row at the finest grain of the analytical model. */
export interface MarketRecord {
  city_id: string;
  city_name: string;
  micromarket_id: string;
  micromarket_name: string;
  reporting_year: number;
  reporting_quarter: Quarter;
  property_type: PropertyType;
  bhk_configuration: BhkConfiguration;
  ticket_size_bracket: string;
  property_size_bracket: string;
  unit_size_sqft: number;
  ticket_size_inr: number;
  demand: number;
  supply: number;
  average_price: number;
  price_change: number | null;
  inventory: number;
}

export interface PeriodRef {
  year: number;
  quarter: Quarter;
}

export interface MarketFilters {
  cityId: string | "all";
  micromarketId: string | "all";
  year: number;
  quarter: Quarter | "all";
  /** retained in the model; not exposed as a filter in the current UI */
  propertyType: PropertyType | "all";
  bhk: BhkConfiguration | "all";
  /** id of a default ticket-size bracket */
  ticketBracket: string | "all";
  /** id of a default property-size bracket */
  sizeBracket: string | "all";
}

/** Filters that define the geographic / product scope (everything except the period). */
export type ScopeFilters = Omit<MarketFilters, "year" | "quarter">;

export interface Aggregate {
  demand: number;
  supply: number;
  /** supply-weighted ₹/sq ft; null when there is no supply */
  avgPrice: number | null;
  /** unsold units at the end of the period */
  inventory: number;
  /** demand ÷ supply; null when supply is zero */
  dsRatio: number | null;
  recordCount: number;
}

export interface PeriodDescriptor {
  label: string;
  quarters: PeriodRef[];
  /** true when the period is a partial year (e.g. YTD) */
  partial: boolean;
}

export interface KpiSet {
  period: PeriodDescriptor;
  comparisonPeriod: PeriodDescriptor | null;
  yoyPeriod: PeriodDescriptor | null;
  current: Aggregate;
  comparison: Aggregate | null;
  yoy: Aggregate | null;
  /** YoY change in supply-weighted average price, % */
  priceAppreciationYoY: number | null;
  /** average monthly absorption-based months of inventory */
  monthsOfInventory: number | null;
  comparisonBasis: "QoQ" | "YoY";
  sparkline: TrendPoint[];
}

export interface TrendPoint {
  key: string;
  label: string;
  year: number;
  quarter: Quarter;
  demand: number;
  supply: number;
  avgPrice: number | null;
  inventory: number;
  dsRatio: number | null;
  /** YoY change in avgPrice for this quarter, % */
  priceYoY: number | null;
}

export type BreakdownDimension =
  | "bhk"
  | "ticket"
  | "size"
  | "micromarket"
  | "city"
  | "propertyType";

export interface BreakdownRow {
  id: string;
  label: string;
  demand: number;
  supply: number;
  avgPrice: number | null;
  inventory: number;
  dsRatio: number | null;
  /** share of total demand within the filtered scope, % (sums to 100) */
  demandShare: number;
  /** share of total supply within the filtered scope, % (sums to 100) */
  supplyShare: number;
  /** demandShare − supplyShare, percentage points */
  gapPp: number;
  /** % change in demand vs comparison period */
  demandChange: number | null;
  /** % change in supply vs comparison period */
  supplyChange: number | null;
  /** YoY % change in average price */
  priceYoY: number | null;
}

export interface BreakdownOptions {
  /** override bracket definitions for ticket / size dimensions */
  brackets?: Bracket[];
}

export interface ShareTrendPoint {
  key: string;
  label: string;
  /** category id → share % */
  demandShare: Record<string, number>;
  supplyShare: Record<string, number>;
}

export interface EntityComparison {
  id: string;
  label: string;
  cityName: string;
  aggregate: Aggregate;
  priceYoY: number | null;
  trend: TrendPoint[];
  bhkMix: BreakdownRow[];
  ticketMix: BreakdownRow[];
}

export type ObservationKind =
  | "demand_shift"
  | "supply_shift"
  | "price_movement"
  | "mismatch"
  | "inventory"
  | "leader";

export interface Observation {
  id: string;
  kind: ObservationKind;
  tone: "positive" | "negative" | "neutral";
  headline: string;
  detail: string;
  /** the exact numbers the observation was derived from */
  evidence: { label: string; value: string }[];
}

export interface DataStatus {
  mode: "demo" | "live";
  label: string;
  asOf: PeriodRef;
  generatedAt: string;
  recordCount: number;
}

export interface MarketCatalog {
  cities: City[];
  years: number[];
  firstPeriod: PeriodRef;
  latestPeriod: PeriodRef;
  propertyTypes: { id: PropertyType; label: string }[];
  bhkConfigurations: BhkConfiguration[];
  ticketBrackets: Bracket[];
  sizeBrackets: Bracket[];
  ticketPresets: BracketPreset[];
  sizePresets: BracketPreset[];
  status: DataStatus;
}
