/**
 * ApiMarketDataService — placeholder for the production data provider.
 *
 * Each method maps 1:1 to a planned REST endpoint (Next.js route handlers in
 * /app/api/v1/* backed by PostgreSQL / Supabase). Filters are sent as query
 * parameters; responses must match the types in /types/market.ts exactly.
 *
 * Until NEXT_PUBLIC_API_BASE_URL is configured, every call rejects with a
 * descriptive error, which dashboards render as an error state.
 */
import type { MarketDataService } from "./market-data-service";

class NotConfiguredError extends Error {
  constructor() {
    super("Live data API is not configured. Set NEXT_PUBLIC_API_BASE_URL or use NEXT_PUBLIC_DATA_PROVIDER=demo.");
  }
}

function qs(params: Record<string, unknown>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  });
  return sp.toString();
}

export class ApiMarketDataService implements MarketDataService {
  readonly mode = "live" as const;
  constructor(private readonly baseUrl: string | undefined) {}

  private async get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    if (!this.baseUrl) throw new NotConfiguredError();
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}?${qs(params)}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Data API error ${res.status} on ${path}`);
    return (await res.json()) as T;
  }

  getCatalog: MarketDataService["getCatalog"] = () => this.get("/v1/catalog");
  getKpis: MarketDataService["getKpis"] = (f) => this.get("/v1/kpis", { ...f });
  getTrend: MarketDataService["getTrend"] = (f, quarters) => this.get("/v1/trend", { ...f, quarters });
  getHistory: MarketDataService["getHistory"] = (f) => this.get("/v1/history", { ...f });
  getBreakdown: MarketDataService["getBreakdown"] = (f, dimension, options) =>
    this.get("/v1/breakdown", { ...f, dimension, brackets: options?.brackets });
  getShareTrend: MarketDataService["getShareTrend"] = (f, dimension, quarters, options) =>
    this.get("/v1/share-trend", { ...f, dimension, quarters, brackets: options?.brackets });
  getPriceByBhk: MarketDataService["getPriceByBhk"] = (f, quarters) => this.get("/v1/price-by-bhk", { ...f, quarters });
  getPriceDistribution: MarketDataService["getPriceDistribution"] = (f, bandWidth) =>
    this.get("/v1/price-distribution", { ...f, bandWidth });
  compare: MarketDataService["compare"] = (ids, level, f, trendQuarters) =>
    this.get("/v1/compare", { ids: ids.join(","), level, ...f, trendQuarters });
  getRangeAggregate: MarketDataService["getRangeAggregate"] = (f, from, to) =>
    this.get("/v1/range", { ...f, from: `${from.year}-Q${from.quarter}`, to: `${to.year}-Q${to.quarter}` });
  getObservations: MarketDataService["getObservations"] = (f) => this.get("/v1/observations", { ...f });
}
