/**
 * Demo repository: builds and memoises the synthetic dataset and catalog.
 * Replaceable in its entirety by a database-backed repository.
 */
import type { MarketCatalog, MarketRecord } from "@/types/market";
import {
  BHK_CONFIGURATIONS,
  DEFAULT_SIZE_BRACKETS,
  DEFAULT_TICKET_BRACKETS,
  DEMO_FIRST_PERIOD,
  DEMO_LATEST_PERIOD,
  PROPERTY_TYPES,
  SIZE_PRESETS,
  TICKET_PRESETS,
} from "@/lib/config/dimensions";
import { demoCities, generateDemoRecords } from "./generator";

let records: MarketRecord[] | null = null;
let catalog: MarketCatalog | null = null;

export function getDemoRecords(): MarketRecord[] {
  if (!records) records = generateDemoRecords();
  return records;
}

export function getDemoCatalog(): MarketCatalog {
  if (!catalog) {
    const years: number[] = [];
    for (let y = DEMO_FIRST_PERIOD.year; y <= DEMO_LATEST_PERIOD.year; y++) years.push(y);
    catalog = {
      cities: demoCities(),
      years,
      firstPeriod: DEMO_FIRST_PERIOD,
      latestPeriod: DEMO_LATEST_PERIOD,
      propertyTypes: PROPERTY_TYPES,
      bhkConfigurations: BHK_CONFIGURATIONS,
      ticketBrackets: DEFAULT_TICKET_BRACKETS,
      sizeBrackets: DEFAULT_SIZE_BRACKETS,
      ticketPresets: TICKET_PRESETS,
      sizePresets: SIZE_PRESETS,
      status: {
        mode: "demo",
        label: "Demonstration data",
        asOf: DEMO_LATEST_PERIOD,
        generatedAt: "2026-10-15",
        recordCount: getDemoRecords().length,
      },
    };
  }
  return catalog;
}
