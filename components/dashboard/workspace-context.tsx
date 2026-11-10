"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MarketCatalog, MarketFilters } from "@/types/market";
import type { TableData } from "@/components/charts/chart-panel";
import { getMarketDataService } from "@/lib/services";
import { periodLabel } from "@/lib/analytics/period";

const STORAGE_KEY = "mbri.filters";

interface WorkspaceValue {
  catalog: MarketCatalog | null;
  catalogError: string | null;
  filters: MarketFilters;
  setFilter: <K extends keyof MarketFilters>(key: K, value: MarketFilters[K]) => void;
  resetFilters: () => void;
  scopeLabel: string;
  /** Datasets registered by the current view for the header Export menu */
  exports: Record<string, TableData>;
  registerExport: (name: string, table: TableData | null) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function defaults(catalog: MarketCatalog | null): MarketFilters {
  return {
    cityId: "all",
    micromarketId: "all",
    year: catalog?.latestPeriod.year ?? 2026,
    quarter: catalog?.latestPeriod.quarter ?? 3,
    propertyType: "all",
  };
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
        // sanitise against the catalog
        const city = cat.cities.find((c) => c.city_id === initial.cityId);
        if (!city) initial.cityId = "all";
        if (!city || !city.micromarkets.some((m) => m.micromarket_id === initial.micromarketId)) initial.micromarketId = "all";
        if (!cat.years.includes(initial.year)) initial.year = cat.latestPeriod.year;
        if (initial.year === cat.latestPeriod.year && initial.quarter !== "all" && initial.quarter > cat.latestPeriod.quarter) initial.quarter = cat.latestPeriod.quarter;
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

  const scopeLabel = useMemo(() => {
    if (!catalog) return "";
    const city = catalog.cities.find((c) => c.city_id === filters.cityId);
    const mm = city?.micromarkets.find((m) => m.micromarket_id === filters.micromarketId);
    const geo = mm ? `${mm.micromarket_name}, ${city?.city_name}` : city ? city.city_name : "All covered cities";
    const period = filters.quarter === "all" ? `CY ${filters.year}` : periodLabel({ year: filters.year, quarter: filters.quarter });
    const pt = filters.propertyType === "all" ? "All property types" : catalog.propertyTypes.find((p) => p.id === filters.propertyType)?.label;
    return `${geo} · ${period} · ${pt}`;
  }, [catalog, filters]);

  const value = useMemo(
    () => ({ catalog, catalogError, filters, setFilter, resetFilters, scopeLabel, exports, registerExport }),
    [catalog, catalogError, filters, setFilter, resetFilters, scopeLabel, exports, registerExport],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
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
