/**
 * Deterministic synthetic data generator for the DEMONSTRATION dataset.
 *
 * Produces fact records at the grain:
 *   micromarket × quarter × property type × BHK × unit-size variant
 * Each record carries a representative unit size and ticket value, and is
 * bucketed into the default ticket / size brackets. Because every chart is
 * aggregated from these same rows, totals, shares and comparisons reconcile.
 *
 * The output is seeded and stable across runs, so screenshots and observations
 * are reproducible. It is NOT real market data.
 */
import type {
  BhkConfiguration,
  City,
  MarketRecord,
  PropertyType,
  Quarter,
} from "@/types/market";
import {
  DEFAULT_SIZE_BRACKETS,
  DEFAULT_TICKET_BRACKETS,
  DEMO_FIRST_PERIOD,
  DEMO_LATEST_PERIOD,
  bucketFor,
} from "@/lib/config/dimensions";
import { CITY_SEEDS, type CitySeed, type MicromarketSeed } from "./seeds";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seasonality: Q4 festive peak, Q2/Q3 monsoon softness. */
const DEMAND_SEASON: Record<Quarter, number> = { 1: 1.02, 2: 0.95, 3: 0.96, 4: 1.08 };
const SUPPLY_SEASON: Record<Quarter, number> = { 1: 1.04, 2: 0.98, 3: 0.93, 4: 1.06 };

const BHK_PSF_FACTOR: Record<BhkConfiguration, number> = {
  "1BHK": 0.95,
  "2BHK": 1,
  "3BHK": 1.05,
  "4BHK+": 1.15,
};

const BHK_BASE_SIZE: Record<BhkConfiguration, number> = {
  "1BHK": 540,
  "2BHK": 1000,
  "3BHK": 1500,
  "4BHK+": 2400,
};

const TYPE_CONFIG: Record<
  PropertyType,
  { psf: number; size: number; bhks: BhkConfiguration[] }
> = {
  apartment: { psf: 1, size: 1, bhks: ["1BHK", "2BHK", "3BHK", "4BHK+"] },
  builder_floor: { psf: 0.86, size: 1.18, bhks: ["2BHK", "3BHK", "4BHK+"] },
  villa: { psf: 1.22, size: 1.65, bhks: ["3BHK", "4BHK+"] },
};

const VARIANTS = [
  { id: "compact", size: 0.8, psf: 0.98, demand: 0.34, supply: 0.24 },
  { id: "standard", size: 1, psf: 1, demand: 0.45, supply: 0.46 },
  { id: "large", size: 1.25, psf: 1.04, demand: 0.21, supply: 0.3 },
] as const;

/**
 * Demand mix by BHK as a function of affluence (0..1) and elapsed years.
 * Demand drifts toward larger homes over time (+~1.4 pp/yr into 3BHK).
 */
function demandBhkMix(affluence: number, yearsElapsed: number): Record<BhkConfiguration, number> {
  const drift = yearsElapsed * 0.014;
  const raw: Record<BhkConfiguration, number> = {
    "1BHK": Math.max(0.03, 0.24 - 0.19 * affluence - drift * 0.6),
    "2BHK": Math.max(0.1, 0.45 - 0.12 * affluence - drift * 0.4),
    "3BHK": 0.24 + 0.17 * affluence + drift,
    "4BHK+": 0.05 + 0.14 * affluence + drift * 0.15,
  };
  return normalise(raw);
}

/**
 * Supply mix lags demand by ~6 quarters and is skewed toward larger,
 * higher-margin formats — which produces realistic configuration mismatches.
 */
function supplyBhkMix(affluence: number, yearsElapsed: number): Record<BhkConfiguration, number> {
  const lagged = demandBhkMix(affluence, Math.max(0, yearsElapsed - 1.5));
  const raw: Record<BhkConfiguration, number> = {
    "1BHK": lagged["1BHK"] * 0.85,
    "2BHK": lagged["2BHK"] * 0.94,
    "3BHK": lagged["3BHK"] * 1.04,
    "4BHK+": lagged["4BHK+"] * 1.32,
  };
  return normalise(raw);
}

function normalise<K extends string>(obj: Record<K, number>): Record<K, number> {
  const total = (Object.values(obj) as number[]).reduce((a, b) => a + b, 0);
  const out = {} as Record<K, number>;
  (Object.keys(obj) as K[]).forEach((k) => (out[k] = obj[k] / total));
  return out;
}

function quarterSequence(): { year: number; quarter: Quarter }[] {
  const seq: { year: number; quarter: Quarter }[] = [];
  let y = DEMO_FIRST_PERIOD.year;
  let q = DEMO_FIRST_PERIOD.quarter;
  while (y < DEMO_LATEST_PERIOD.year || (y === DEMO_LATEST_PERIOD.year && q <= DEMO_LATEST_PERIOD.quarter)) {
    seq.push({ year: y, quarter: q });
    q = (q === 4 ? 1 : q + 1) as Quarter;
    if (q === 1) y += 1;
  }
  return seq;
}

function generateMicromarket(city: CitySeed, mm: MicromarketSeed, out: MarketRecord[]) {
  const rand = mulberry32(hashString(mm.id));
  const noise = (amp: number) => 1 + (rand() * 2 - 1) * amp;
  const phase = rand() * Math.PI * 2;
  const quarters = quarterSequence();

  // micromarket-specific property mix (perturb city mix slightly)
  const typeMix = normalise({
    apartment: city.propertyMix.apartment * noise(0.05),
    builder_floor: city.propertyMix.builder_floor * noise(0.2),
    villa: city.propertyMix.villa * noise(0.25) * (0.6 + mm.affluence * 0.8),
  });

  const prevPsf = new Map<string, number>();

  quarters.forEach(({ year, quarter }, t) => {
    const yearsElapsed = t / 4;
    const cycle = 1 + 0.008 * Math.sin(t * 1.15 + phase);
    const psf = mm.psf * Math.pow(1 + mm.priceGrowth, yearsElapsed) * cycle * noise(0.004);

    // mid-2024 cooling in some markets makes demand shifts visible
    const cooling = year === 2024 && quarter >= 2 ? 0.95 + mm.affluence * 0.03 : 1;
    const totalDemand =
      mm.demand * Math.pow(1 + mm.demandGrowth, yearsElapsed) * DEMAND_SEASON[quarter] * cooling * noise(0.035);
    const totalSupply =
      mm.supply * Math.pow(1 + mm.supplyGrowth, yearsElapsed) * SUPPLY_SEASON[quarter] * noise(0.05);

    const ds = totalDemand / totalSupply;
    // inventory: stock of unsold units, ~2–3.4× a quarter's supply, lower when demand is strong
    const invFactor = Math.min(3.4, Math.max(1.5, 3.9 - 1.6 * ds)) * noise(0.03);

    const dMix = demandBhkMix(mm.affluence, yearsElapsed);
    const sMix = supplyBhkMix(mm.affluence, yearsElapsed);

    (Object.keys(TYPE_CONFIG) as PropertyType[]).forEach((ptype) => {
      const share = typeMix[ptype];
      if (!share || share < 0.005) return;
      const cfg = TYPE_CONFIG[ptype];
      const dSub = normalise(Object.fromEntries(cfg.bhks.map((b) => [b, dMix[b]])) as Record<BhkConfiguration, number>);
      const sSub = normalise(Object.fromEntries(cfg.bhks.map((b) => [b, sMix[b]])) as Record<BhkConfiguration, number>);

      cfg.bhks.forEach((bhk) => {
        VARIANTS.forEach((v) => {
          const key = `${ptype}|${bhk}|${v.id}`;
          const recPsf = Math.round(psf * cfg.psf * BHK_PSF_FACTOR[bhk] * v.psf);
          const size = Math.round(BHK_BASE_SIZE[bhk] * cfg.size * city.sizeFactor * v.size * (0.95 + mm.affluence * 0.1));
          const ticket = recPsf * size;

          const demand = Math.round(totalDemand * share * dSub[bhk] * v.demand * noise(0.06));
          const supply = Math.round(totalSupply * share * sSub[bhk] * v.supply * noise(0.06));
          if (demand === 0 && supply === 0) return;
          const inventory = Math.round(supply * invFactor * (v.id === "large" ? 1.12 : 1));

          const prev = prevPsf.get(key);
          prevPsf.set(key, recPsf);

          out.push({
            city_id: city.id,
            city_name: city.name,
            micromarket_id: mm.id,
            micromarket_name: mm.name,
            reporting_year: year,
            reporting_quarter: quarter,
            property_type: ptype,
            bhk_configuration: bhk,
            ticket_size_bracket: bucketFor(ticket, DEFAULT_TICKET_BRACKETS).id,
            property_size_bracket: bucketFor(size, DEFAULT_SIZE_BRACKETS).id,
            unit_size_sqft: size,
            ticket_size_inr: ticket,
            demand,
            supply,
            average_price: recPsf,
            price_change: prev ? Math.round(((recPsf - prev) / prev) * 10000) / 100 : null,
            inventory,
          });
        });
      });
    });
  });
}

export function generateDemoRecords(): MarketRecord[] {
  const out: MarketRecord[] = [];
  CITY_SEEDS.forEach((city) => city.micromarkets.forEach((mm) => generateMicromarket(city, mm, out)));
  return out;
}

export function demoCities(): City[] {
  return CITY_SEEDS.map((c) => ({
    city_id: c.id,
    city_name: c.name,
    state: c.state,
    region: c.region,
    lat: c.lat,
    lon: c.lon,
    micromarkets: c.micromarkets.map((m) => ({
      micromarket_id: m.id,
      micromarket_name: m.name,
      city_id: c.id,
    })),
  }));
}
