"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { MarketFilters, PropertyType, Quarter } from "@/types/market";
import { Select } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils/cn";
import { useWorkspace } from "./workspace-context";

export type FilterKey = keyof MarketFilters;

/** Global filter row. Every control updates every chart and KPI on the page. */
export function FilterBar({ hidden = [] }: { hidden?: FilterKey[] }) {
  const { catalog, filters, setFilter, resetFilters } = useWorkspace();
  if (!catalog) return <div className="h-[58px] animate-pulse rounded-xs bg-white/[0.03]" />;

  const city = catalog.cities.find((c) => c.city_id === filters.cityId);
  const show = (k: FilterKey) => !hidden.includes(k);
  const latest = catalog.latestPeriod;
  const quarterOptions = [
    { value: "all", label: filters.year === latest.year && latest.quarter < 4 ? `Full year (YTD)` : "Full year" },
    ...[1, 2, 3, 4].map((q) => ({
      value: String(q),
      label: `Q${q}`,
      disabled: filters.year === latest.year && q > latest.quarter,
    })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-3" role="group" aria-label="Global filters">
      <div className="hidden items-center gap-2 self-center pr-1 text-muted xl:flex">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
      </div>
      {show("cityId") && (
        <Select
          label="City"
          size="sm"
          className="w-[150px]"
          value={filters.cityId}
          onChange={(e) => setFilter("cityId", e.target.value)}
          options={[{ value: "all", label: "All cities" }, ...catalog.cities.map((c) => ({ value: c.city_id, label: c.city_name }))]}
        />
      )}
      {show("micromarketId") && (
        <Select
          label="Micromarket"
          size="sm"
          className="w-[190px]"
          value={filters.micromarketId}
          disabled={!city}
          title={!city ? "Select a city first" : undefined}
          onChange={(e) => setFilter("micromarketId", e.target.value)}
          options={[{ value: "all", label: city ? "All micromarkets" : "Select a city first" }, ...(city?.micromarkets.map((m) => ({ value: m.micromarket_id, label: m.micromarket_name })) ?? [])]}
        />
      )}
      {show("year") && (
        <Select
          label="Year"
          size="sm"
          className="w-[96px]"
          value={String(filters.year)}
          onChange={(e) => setFilter("year", Number(e.target.value))}
          options={[...catalog.years].reverse().map((y) => ({ value: String(y), label: String(y) }))}
        />
      )}
      {show("quarter") && (
        <Select
          label="Quarter"
          size="sm"
          className="w-[140px]"
          value={String(filters.quarter)}
          onChange={(e) => setFilter("quarter", e.target.value === "all" ? "all" : (Number(e.target.value) as Quarter))}
          options={quarterOptions}
        />
      )}
      {show("propertyType") && (
        <Select
          label="Property type"
          size="sm"
          className="w-[190px]"
          value={filters.propertyType}
          onChange={(e) => setFilter("propertyType", e.target.value as PropertyType | "all")}
          options={[{ value: "all", label: "All property types" }, ...catalog.propertyTypes.map((p) => ({ value: p.id, label: p.label }))]}
        />
      )}
      <button
        type="button"
        onClick={resetFilters}
        className={cn("inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[12.5px] text-muted ring-1 ring-inset ring-ink-600 transition-colors hover:text-white hover:ring-ink-500")}
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
      </button>
    </div>
  );
}
