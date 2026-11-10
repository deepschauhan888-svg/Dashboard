import type { MarketCatalog } from "@/types/market";
import { AnalyticsEngine } from "@/lib/analytics/engine";
import { generateObservations } from "@/lib/analytics/observations";
import { getDemoCatalog, getDemoRecords } from "@/lib/data/demo/repository";
import type { MarketDataService } from "./market-data-service";

/** Small artificial latency so loading states are exercised exactly as they will be with a real API. */
const LATENCY_MS = 160;
const wait = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

export class DemoMarketDataService implements MarketDataService {
  readonly mode = "demo" as const;
  private engineInstance: AnalyticsEngine | null = null;
  private catalogInstance: MarketCatalog | null = null;

  private get catalog() {
    if (!this.catalogInstance) this.catalogInstance = getDemoCatalog();
    return this.catalogInstance;
  }

  private get engine() {
    if (!this.engineInstance) this.engineInstance = new AnalyticsEngine(getDemoRecords(), this.catalog);
    return this.engineInstance;
  }

  getCatalog: MarketDataService["getCatalog"] = () => Promise.resolve(this.catalog);
  getKpis: MarketDataService["getKpis"] = (f) => wait(this.engine.kpis(f));
  getTrend: MarketDataService["getTrend"] = (f, q = 12) => wait(this.engine.trend(f, q));
  getHistory: MarketDataService["getHistory"] = (f) => wait(this.engine.history(f));
  getBreakdown: MarketDataService["getBreakdown"] = (f, d, o) => wait(this.engine.breakdown(f, d, o));
  getShareTrend: MarketDataService["getShareTrend"] = (f, d, q = 8, o) => wait(this.engine.shareTrend(f, d, q, o));
  getPriceByBhk: MarketDataService["getPriceByBhk"] = (f, q = 12) => wait(this.engine.priceByBhk(f, q));
  getPriceDistribution: MarketDataService["getPriceDistribution"] = (f, w = 2500) =>
    wait(this.engine.priceDistribution(f, w));
  compare: MarketDataService["compare"] = (ids, level, f, q = 12) => wait(this.engine.compare(ids, level, f, q));
  getRangeAggregate: MarketDataService["getRangeAggregate"] = (f, from, to) =>
    wait(this.engine.rangeAggregate(f, from, to));
  getObservations: MarketDataService["getObservations"] = (f) =>
    wait(generateObservations(this.engine, this.catalog, f));

  /** Synchronous access for static marketing previews (no loading state needed). */
  engineSync() {
    return this.engine;
  }
  catalogSync() {
    return this.catalog;
  }
}
