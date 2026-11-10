import type { MarketFilters } from "@/types/market";

/** Scope with every dimension unrestricted. Period fields must be supplied by the caller. */
export const ALL_FILTERS: Omit<MarketFilters, "year" | "quarter"> = {
  cityId: "all",
  micromarketId: "all",
  propertyType: "all",
  bhk: "all",
  ticketBracket: "all",
  sizeBracket: "all",
};

export type FilterKey = "cityId" | "micromarketId" | "year" | "quarter" | "bhk" | "ticketBracket" | "sizeBracket";

/**
 * Applies a module's contextual filter set: any filter the module does not
 * expose is reset to "all", so a hidden filter can never silently constrain
 * a view.
 */
export function effectiveFilters(f: MarketFilters, visible: FilterKey[]): MarketFilters {
  const out: MarketFilters = { ...f };
  if (!visible.includes("cityId")) out.cityId = "all";
  if (!visible.includes("micromarketId") || out.cityId === "all") out.micromarketId = "all";
  if (!visible.includes("bhk")) out.bhk = "all";
  if (!visible.includes("ticketBracket")) out.ticketBracket = "all";
  if (!visible.includes("sizeBracket")) out.sizeBracket = "all";
  out.propertyType = "all";
  return out;
}

export function filterKey(f: MarketFilters) {
  return [f.cityId, f.micromarketId, f.year, f.quarter, f.propertyType, f.bhk, f.ticketBracket, f.sizeBracket].join("|");
}
