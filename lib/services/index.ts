import { ApiMarketDataService } from "./api-market-data-service";
import { DemoMarketDataService } from "./demo-market-data-service";
import type { MarketDataService } from "./market-data-service";

export type { MarketDataService } from "./market-data-service";

let instance: MarketDataService | null = null;
let demoInstance: DemoMarketDataService | null = null;

/** Demo service singleton — also used directly by marketing-page previews. */
export function getDemoService(): DemoMarketDataService {
  if (!demoInstance) demoInstance = new DemoMarketDataService();
  return demoInstance;
}

/**
 * Factory for the active data provider. Controlled by NEXT_PUBLIC_DATA_PROVIDER.
 * Components call this; they never import a concrete provider.
 */
export function getMarketDataService(): MarketDataService {
  if (instance) return instance;
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "demo";
  instance = provider === "api" ? new ApiMarketDataService(process.env.NEXT_PUBLIC_API_BASE_URL) : getDemoService();
  return instance;
}
