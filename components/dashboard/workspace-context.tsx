"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MarketCatalog, MarketFilters } from "@/types/market";
import type { TableData } from "@/components/charts/chart-panel";
import { getMarketDataService } from "@/lib/services";
import { ALL_FILTERS, effectiveFilters, filterKey } from "@/lib/analytics/filters";
import { periodLabel } from "@/lib/analytics/period";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { viewBySlug, type WorkspaceView } from "@/lib/config/workspace-nav";

const STORAGE_KEY = "mbri.filters.v2";

interface WorkspaceValue {
  catalog: MarketCatalog | null;
  catalogError: string | null;
  /** raw selections — use `useViewFilters` in modules */
  filters: MarketFilters;
  setFilter: <K extends keyof MarketFilters>(key: K, value: MarketFilters[K]) => void;
  resetFilters: () => void;
  exports: Record<string, TableData>;
  registerExport: (name: string, table: TableData | null) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function defaults(catalog: MarketCatalog | null): MarketFilters {
  return { ...ALL_FILTERS, year: catalog?.latestPeriod.year ?? 2026, quarter: catalog?.latestPeriod.quarter ?? 3 };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<MarketCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketFilters>(() => defaults(null));
  const [exports, setExports] = useState<Record<string, TableData>>({});
  const hydrated = useRef(false);

  useEffect(() => {
    getMarketDataService()
      .getCatalog()
      .then((cat) => {
        setCatalog(cat);
        let initial = defaults(cat);
        try {
          const raw = window.sessionStorage.getItem(STORAGE_KEY);
          if (raw) initial = { ...initial, ...(JSON.parse(raw) as Partial<MarketFilters>) };
        } catch {
          /* ignore */
        }
        const city = cat.cities.find((c) => c.city_id === initial.cityId);
        if (!city) initial.cityId = "all";
        if (!city || !city.micromarkets.some((m) => m.micromarket_id === initial.micromarketId)) initial.micromarketId = "all";
        if (!cat.years.includes(initial.year)) initial.year = cat.latestPeriod.year;
        if (initial.year === cat.latestPeriod.year && initial.quarter !== "all" && initial.quarter > cat.latestPeriod.quarter) initial.quarter = cat.latestPeriod.quarter;
        if (initial.bhk !== "all" && !cat.bhkConfigurations.includes(initial.bhk)) initial.bhk = "all";
        if (initial.ticketBracket !== "all" && !cat.ticketBrackets.some((b) => b.id === initial.ticketBracket)) initial.ticketBracket = "all";
        if (initial.sizeBracket !== "all" && !cat.sizeBrackets.some((b) => b.id === initial.sizeBracket)) initial.sizeBracket = "all";
        setFilters(initial);
        hydrated.current = true;
      })
      .catch((e: unknown) => setCatalogError(e instanceof Error ? e.message : "Failed to load catalog"));
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      /* ignore */
    }
  }, [filters]);

  const setFilter = useCallback(
    <K extends keyof MarketFilters>(key: K, value: MarketFilters[K]) => {
      setFilters((f) => {
        const next = { ...f, [key]: value };
        if (key === "cityId") next.micromarketId = "all";
        if (key === "year" && catalog && value === catalog.latestPeriod.year && next.quarter !== "all" && next.quarter > catalog.latestPeriod.quarter) {
          next.quarter = catalog.latestPeriod.quarter;
        }
        return next;
      });
    },
    [catalog],
  );

  const resetFilters = useCallback(() => setFilters(defaults(catalog)), [catalog]);

  const registerExport = useCallback((name: string, table: TableData | null) => {
    setExports((prev) => {
      if (!table) {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: table };
    });
  }, []);

  const value = useMemo(() => ({ catalog, catalogError, filters, setFilter, resetFilters, exports, registerExport }), [catalog, catalogError, filters, setFilter, resetFilters, exports, registerExport]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}

/**
 * The filters a view should query with: only that view's contextual filters
 * apply; everything else is "all". Also returns a stable dependency key and a
 * human-readable scope line.
 */
export function useViewFilters(view: WorkspaceView) {
  const { filters, catalog } = useWorkspace();
  const visible = viewBySlug(view).filters;
  const eff = useMemo(() => effectiveFilters(filters, visible), [filters, visible]);
  const key = filterKey(eff);
  const scope = useMemo(() => describeScope(eff, catalog, visible), [eff, catalog, visible]);
  return { filters: eff, key, scope, visible };
}

export function describeScope(f: MarketFilters, catalog: MarketCatalog | null, visible: string[]) {
  if (!catalog) return "";
  const parts: string[] = [];
  if (visible.includes("cityId")) {
    const city = catalog.cities.find((c) => c.city_id === f.cityId);
    const mm = city?.micromarkets.find((m) => m.micromarket_id === f.micromarketId);
    parts.push(mm ? `${mm.micromarket_name}, ${city?.city_name}` : city ? city.city_name : "All cities");
  }
  if (visible.includes("year")) parts.push(f.quarter === "all" ? `CY ${f.year}` : periodLabel({ year: f.year, quarter: f.quarter }));
  if (f.bhk !== "all") parts.push(BHK_LABELS[f.bhk]);
  if (f.ticketBracket !== "all") parts.push(catalog.ticketBrackets.find((b) => b.id === f.ticketBracket)?.label ?? "");
  if (f.sizeBracket !== "all") parts.push(`${catalog.sizeBrackets.find((b) => b.id === f.sizeBracket)?.label ?? ""} sq ft`);
  return parts.filter(Boolean).join(" · ");
}

/** Registers a dataset with the header Export menu for as long as the view is mounted. */
export function useRegisterExport(name: string, table: TableData | null | undefined) {
  const { registerExport } = useWorkspace();
  const key = table ? JSON.stringify(table) : "";
  useEffect(() => {
    registerExport(name, table ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
  useEffect(() => () => registerExport(name, null), [name, registerExport]);
}
