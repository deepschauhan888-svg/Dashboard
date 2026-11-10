/**
 * Rule-based observation generator.
 *
 * Every observation is computed from the numbers returned by the engine for
 * the current filters, and carries the evidence it was derived from. No text
 * is written independently of the data: if a rule's threshold is not met, the
 * observation is simply not produced.
 */
import type { MarketCatalog, MarketFilters, Observation } from "@/types/market";
import type { AnalyticsEngine } from "./engine";
import { formatNumber, formatPct, formatPp, formatPsf, formatRatio } from "@/lib/utils/format";

const DEMAND_SHIFT_THRESHOLD = 3; // %
const PRICE_THRESHOLD = 2; // %
const MISMATCH_THRESHOLD = 2; // pp

export function generateObservations(
  engine: AnalyticsEngine,
  catalog: MarketCatalog,
  f: MarketFilters,
): Observation[] {
  const out: Observation[] = [];
  const k = engine.kpis(f);
  if (k.current.recordCount === 0) return out;

  const scopeName = scopeLabel(catalog, f);
  const basis = k.comparisonBasis;
  const compLabel = k.comparisonPeriod?.label;

  // 1. Demand shift
  if (k.comparison) {
    const dChange = pct(k.current.demand, k.comparison.demand);
    const sChange = pct(k.current.supply, k.comparison.supply);
    if (dChange !== null && Math.abs(dChange) >= DEMAND_SHIFT_THRESHOLD) {
      const up = dChange > 0;
      out.push({
        id: "demand-shift",
        kind: "demand_shift",
        tone: up ? "positive" : "negative",
        headline: `Demand ${up ? "rose" : "fell"} ${formatPct(Math.abs(dChange), 1, false)} ${basis} in ${scopeName}`,
        detail:
          sChange !== null
            ? `Supply moved ${formatPct(sChange)} over the same comparison, so the demand–supply ratio is now ${formatRatio(k.current.dsRatio)} versus ${formatRatio(k.comparison.dsRatio)} in ${compLabel}.`
            : `Compared with ${compLabel}.`,
        evidence: [
          { label: `Demand · ${k.period.label}`, value: formatNumber(k.current.demand) },
          { label: `Demand · ${compLabel}`, value: formatNumber(k.comparison.demand) },
          { label: "Supply change", value: formatPct(sChange) },
        ],
      });
    } else if (sChange !== null && Math.abs(sChange) >= DEMAND_SHIFT_THRESHOLD) {
      out.push({
        id: "supply-shift",
        kind: "supply_shift",
        tone: "neutral",
        headline: `New supply ${sChange > 0 ? "expanded" : "contracted"} ${formatPct(Math.abs(sChange), 1, false)} ${basis} in ${scopeName}`,
        detail: `Demand moved ${formatPct(dChange)} against ${compLabel}, so the demand–supply ratio shifted from ${formatRatio(k.comparison.dsRatio)} to ${formatRatio(k.current.dsRatio)}.`,
        evidence: [
          { label: `Supply · ${k.period.label}`, value: formatNumber(k.current.supply) },
          { label: `Supply · ${compLabel}`, value: formatNumber(k.comparison.supply) },
        ],
      });
    }
  }

  // 2. Price movement
  if (k.priceAppreciationYoY !== null && Math.abs(k.priceAppreciationYoY) >= PRICE_THRESHOLD) {
    const up = k.priceAppreciationYoY > 0;
    out.push({
      id: "price-yoy",
      kind: "price_movement",
      tone: up ? "positive" : "negative",
      headline: `Average price ${up ? "appreciated" : "corrected"} ${formatPct(Math.abs(k.priceAppreciationYoY), 1, false)} year-on-year`,
      detail: `Supply-weighted average reached ${formatPsf(k.current.avgPrice)}/sq ft in ${k.period.label}, against ${formatPsf(k.yoy?.avgPrice)}/sq ft in ${k.yoyPeriod?.label}.`,
      evidence: [
        { label: k.period.label, value: `${formatPsf(k.current.avgPrice)}/sq ft` },
        { label: k.yoyPeriod?.label ?? "Prior year", value: `${formatPsf(k.yoy?.avgPrice)}/sq ft` },
      ],
    });
  }

  // 3. Fastest-appreciating sub-market (city when all, micromarket when city selected)
  if (f.micromarketId === "all") {
    const dim = f.cityId === "all" ? "city" : "micromarket";
    const rows = engine.breakdown(f, dim).filter((r) => r.priceYoY !== null);
    if (rows.length >= 3) {
      const sorted = [...rows].sort((a, b) => (b.priceYoY ?? 0) - (a.priceYoY ?? 0));
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      out.push({
        id: "price-leader",
        kind: "leader",
        tone: "neutral",
        headline: `${top.label} leads price growth at ${formatPct(top.priceYoY)} YoY`,
        detail: `The spread across ${rows.length} ${dim === "city" ? "cities" : "micromarkets"} runs from ${formatPct(top.priceYoY)} (${top.label}) to ${formatPct(bottom.priceYoY)} (${bottom.label}).`,
        evidence: [
          { label: top.label, value: `${formatPsf(top.avgPrice)}/sq ft` },
          { label: bottom.label, value: `${formatPsf(bottom.avgPrice)}/sq ft` },
        ],
      });

      const tight = [...rows].filter((r) => r.dsRatio !== null).sort((a, b) => (b.dsRatio ?? 0) - (a.dsRatio ?? 0))[0];
      if (tight && tight.dsRatio !== null && tight.dsRatio > 1.05) {
        out.push({
          id: "tightest",
          kind: "mismatch",
          tone: "positive",
          headline: `${tight.label} is the most supply-constrained ${dim === "city" ? "city" : "micromarket"}`,
          detail: `Demand runs at ${formatRatio(tight.dsRatio)} of new supply — ${formatNumber(tight.demand)} demand units against ${formatNumber(tight.supply)} units supplied in ${k.period.label}.`,
          evidence: [
            { label: "Demand", value: formatNumber(tight.demand) },
            { label: "Supply", value: formatNumber(tight.supply) },
          ],
        });
      }
    }
  }

  // 4. Configuration mismatch
  const bhk = engine.breakdown(f, "bhk");
  const bhkGap = [...bhk].sort((a, b) => Math.abs(b.gapPp) - Math.abs(a.gapPp))[0];
  if (bhkGap && Math.abs(bhkGap.gapPp) >= MISMATCH_THRESHOLD) {
    const under = bhkGap.gapPp > 0;
    out.push({
      id: "bhk-mismatch",
      kind: "mismatch",
      tone: under ? "positive" : "negative",
      headline: `${bhkGap.label} is ${under ? "under-supplied" : "over-supplied"} relative to demand`,
      detail: `${bhkGap.label} accounts for ${bhkGap.demandShare.toFixed(1)}% of demand but ${bhkGap.supplyShare.toFixed(1)}% of new supply (${formatPp(bhkGap.gapPp)}).`,
      evidence: [
        { label: "Demand share", value: `${bhkGap.demandShare.toFixed(1)}%` },
        { label: "Supply share", value: `${bhkGap.supplyShare.toFixed(1)}%` },
      ],
    });
  }

  // 5. Ticket-size mismatch
  const tickets = engine.breakdown(f, "ticket").filter((r) => r.demand + r.supply > 0);
  const tGap = [...tickets].sort((a, b) => b.gapPp - a.gapPp)[0];
  if (tGap && tGap.gapPp >= MISMATCH_THRESHOLD) {
    out.push({
      id: "ticket-gap",
      kind: "mismatch",
      tone: "positive",
      headline: `Unmet demand concentrates in the ${tGap.label} budget bracket`,
      detail: `This bracket carries ${tGap.demandShare.toFixed(1)}% of demand against ${tGap.supplyShare.toFixed(1)}% of supply — the widest positive gap of any ticket size (${formatPp(tGap.gapPp)}).`,
      evidence: [
        { label: "Demand share", value: `${tGap.demandShare.toFixed(1)}%` },
        { label: "Supply share", value: `${tGap.supplyShare.toFixed(1)}%` },
      ],
    });
  }

  // 6. Inventory
  if (k.comparison && k.comparison.inventory > 0) {
    const iChange = pct(k.current.inventory, k.comparison.inventory);
    if (iChange !== null && Math.abs(iChange) >= 2) {
      out.push({
        id: "inventory",
        kind: "inventory",
        tone: iChange < 0 ? "positive" : "negative",
        headline: `Unsold inventory ${iChange < 0 ? "declined" : "increased"} ${formatPct(Math.abs(iChange), 1, false)} ${basis}`,
        detail: `${formatNumber(k.current.inventory)} units remained unsold at the end of ${k.period.label}${k.monthsOfInventory !== null ? `, equal to about ${k.monthsOfInventory.toFixed(1)} months of demand at the current pace` : ""}.`,
        evidence: [
          { label: `Inventory · ${k.period.label}`, value: formatNumber(k.current.inventory) },
          { label: `Inventory · ${compLabel}`, value: formatNumber(k.comparison.inventory) },
        ],
      });
    }
  }

  return out;
}

function pct(a: number, b: number): number | null {
  return b === 0 ? null : ((a - b) / b) * 100;
}

function scopeLabel(catalog: MarketCatalog, f: MarketFilters) {
  if (f.cityId === "all") return "all covered cities";
  const city = catalog.cities.find((c) => c.city_id === f.cityId);
  if (!city) return "the selected market";
  if (f.micromarketId === "all") return city.city_name;
  const mm = city.micromarkets.find((m) => m.micromarket_id === f.micromarketId);
  return mm ? `${mm.micromarket_name}, ${city.city_name}` : city.city_name;
}
