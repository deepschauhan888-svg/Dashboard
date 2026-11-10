"use client";

import { RotateCcw } from "lucide-react";
import type { BhkConfiguration, Quarter } from "@/types/market";
import type { FilterKey } from "@/lib/analytics/filters";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { Select } from "@/components/ui/form-controls";
import { useWorkspace } from "./workspace-context";

/** Contextual filter row: shows only the filters relevant to the current view. */
export function FilterBar({ visible }: { visible: FilterKey[] }) {
  const { catalog, filters, setFilter, resetFilters } = useWorkspace();
  if (!catalog) return <div className="h-[52px] animate-pulse rounded-xs bg-paper" />;

  const city = catalog.cities.find((c) => c.city_id === filters.cityId);
  const show = (k: FilterKey) => visible.includes(k);
  const latest = catalog.latestPeriod;
  const anyActive =
    (show("cityId") && filters.cityId !== "all") ||
    (show("bhk") && filters.bhk !== "all") ||
    (show("ticketBracket") && filters.ticketBracket !== "all") ||
    (show("sizeBracket") && filters.sizeBracket !== "all") ||
    (show("year") && (filters.year !== latest.year || filters.quarter !== latest.quarter));

  return (
    <div className="flex flex-wrap items-end gap-3" role="group" aria-label="Filters">
      {show("cityId") && (
        <Select label="City" size="sm" className="w-[150px]" active={filters.cityId !== "all"} value={filters.cityId} onChange={(e) => setFilter("cityId", e.target.value)} options={[{ value: "all", label: "All cities" }, ...catalog.cities.map((c) => ({ value: c.city_id, label: c.city_name }))]} />
      )}
      {show("micromarketId") && (
        <Select
          label="Micromarket"
          size="sm"
          className="w-[190px]"
          active={filters.micromarketId !== "all"}
          value={filters.micromarketId}
          disabled={!city}
          title={!city ? "Select a city first" : undefined}
          onChange={(e) => setFilter("micromarketId", e.target.value)}
          options={[{ value: "all", label: city ? "All micromarkets" : "Select a city first" }, ...(city?.micromarkets.map((m) => ({ value: m.micromarket_id, label: m.micromarket_name })) ?? [])]}
        />
      )}
      {show("year") && <Select label="Year" size="sm" className="w-[92px]" value={String(filters.year)} onChange={(e) => setFilter("year", Number(e.target.value))} options={[...catalog.years].reverse().map((y) => ({ value: String(y), label: String(y) }))} />}
      {show("quarter") && (
        <Select
          label="Quarter"
          size="sm"
          className="w-[132px]"
          value={String(filters.quarter)}
          onChange={(e) => setFilter("quarter", e.target.value === "all" ? "all" : (Number(e.target.value) as Quarter))}
          options={[
            { value: "all", label: filters.year === latest.year && latest.quarter < 4 ? "Year to date" : "Full year" },
            ...[1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}`, disabled: filters.year === latest.year && q > latest.quarter })),
          ]}
        />
      )}
      {show("bhk") && (
        <Select label="Configuration" size="sm" className="w-[140px]" active={filters.bhk !== "all"} value={filters.bhk} onChange={(e) => setFilter("bhk", e.target.value as BhkConfiguration | "all")} options={[{ value: "all", label: "All BHK" }, ...catalog.bhkConfigurations.map((b) => ({ value: b, label: BHK_LABELS[b] }))]} />
      )}
      {show("ticketBracket") && (
        <Select label="Ticket size" size="sm" className="w-[150px]" active={filters.ticketBracket !== "all"} value={filters.ticketBracket} onChange={(e) => setFilter("ticketBracket", e.target.value)} options={[{ value: "all", label: "All budgets" }, ...catalog.ticketBrackets.map((b) => ({ value: b.id, label: b.label }))]} />
      )}
      {show("sizeBracket") && (
        <Select label="Property size" size="sm" className="w-[150px]" active={filters.sizeBracket !== "all"} value={filters.sizeBracket} onChange={(e) => setFilter("sizeBracket", e.target.value)} options={[{ value: "all", label: "All sizes" }, ...catalog.sizeBrackets.map((b) => ({ value: b.id, label: `${b.label} sq ft` }))]} />
      )}
      {anyActive && (
        <button type="button" onClick={resetFilters} className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[12.5px] text-ink-2 hover:bg-mist hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
        </button>
      )}
    </div>
  );
}
