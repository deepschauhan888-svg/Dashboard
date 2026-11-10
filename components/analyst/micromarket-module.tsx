"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { comparisonTrendOption, entityBarsOption, mixStackOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { formatNumber, formatPct, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChartPanel, DataTable, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/states";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useWorkspace } from "@/components/dashboard/workspace-context";

const MAX = 5;
const DEFAULT_SELECTION = ["gur-dwarka-expy", "noi-sector-150", "blr-whitefield"];

export function MicromarketModule() {
  const { filters, catalog } = useWorkspace();
  const svc = getMarketDataService();
  // id → colour slot. Survivors keep their slot when another market is removed.
  const [slots, setSlots] = useState<Record<string, number>>(() => Object.fromEntries(DEFAULT_SELECTION.map((id, i) => [id, i])));
  const [query, setQuery] = useState("");
  const [trendMetric, setTrendMetric] = useState<"avgPrice" | "demand" | "supply" | "dsRatio">("avgPrice");
  const selected = useMemo(() => Object.keys(slots).sort((a, b) => slots[a] - slots[b]), [slots]);
  const colorFor = (id: string) => chartColors.categorical[slots[id] ?? 0];

  function toggle(id: string) {
    setSlots((s) => {
      if (id in s) {
        const next = { ...s };
        delete next[id];
        return next;
      }
      if (Object.keys(s).length >= MAX) return s;
      const used = new Set(Object.values(s));
      let slot = 0;
      while (used.has(slot)) slot++;
      return { ...s, [id]: slot };
    });
  }

  const { data, loading } = useAsync(
    () => svc.compare(selected, "micromarket", { year: filters.year, quarter: filters.quarter, propertyType: filters.propertyType }, 12),
    [selected.join(","), filters.year, filters.quarter, filters.propertyType],
  );

  const groups = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.cities
      .map((c) => ({ city: c, items: c.micromarkets.filter((m) => !q || m.micromarket_name.toLowerCase().includes(q) || c.city_name.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length);
  }, [catalog, query]);

  const nameOf = (id: string) => {
    for (const c of catalog?.cities ?? []) {
      const m = c.micromarkets.find((x) => x.micromarket_id === id);
      if (m) return { mm: m.micromarket_name, city: c.city_name };
    }
    return { mm: id, city: "" };
  };

  const opts = useMemo(() => {
    if (!data || !data.length || !catalog) return null;
    const names = data.map((d) => d.label);
    const bhkCats = catalog.bhkConfigurations.map((b) => ({ id: b, label: b.replace("BHK", " BHK") }));
    const tCats = catalog.ticketBrackets.map((b) => ({ id: b.id, label: b.label }));
    return {
      volume: entityBarsOption(names, [
        { name: "Demand", data: data.map((d) => d.aggregate.demand), color: chartColors.demand },
        { name: "Supply", data: data.map((d) => d.aggregate.supply), color: chartColors.supply },
      ]),
      price: entityBarsOption(names, [{ name: "Avg ₹/sq ft", data: data.map((d) => (d.aggregate.avgPrice === null ? null : Math.round(d.aggregate.avgPrice))), color: chartColors.price }], { format: (v) => formatPsf(v) }),
      trend: comparisonTrendOption(data, colorFor, trendMetric),
      bhk: mixStackOption(names, bhkCats, (ei, id) => data[ei].bhkMix.find((r) => r.id === id)?.demandShare ?? 0),
      ticket: mixStackOption(names, tCats, (ei, id) => data[ei].ticketMix.find((r) => r.id === id)?.demandShare ?? 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, catalog, trendMetric, slots]);

  const summary: TableData | undefined = data
    ? {
        columns: ["Micromarket", "City", "Demand", "Supply", "D/S", "Avg ₹/sq ft", "Price YoY %", "Inventory"],
        rows: data.map((d) => [d.label, d.cityName, d.aggregate.demand, d.aggregate.supply, d.aggregate.dsRatio === null ? null : round(d.aggregate.dsRatio, 2), d.aggregate.avgPrice === null ? null : Math.round(d.aggregate.avgPrice), d.priceYoY === null ? null : round(d.priceYoY, 1), d.aggregate.inventory]),
      }
    : undefined;
  const display: TableData | undefined = data
    ? {
        columns: summary!.columns,
        rows: data.map((d) => [d.label, d.cityName, formatNumber(d.aggregate.demand), formatNumber(d.aggregate.supply), formatRatio(d.aggregate.dsRatio), formatPsf(d.aggregate.avgPrice), formatPct(d.priceYoY), formatNumber(d.aggregate.inventory)]),
      }
    : undefined;
  useRegisterExport("Micromarket comparison", summary);

  const trendTitles = { avgPrice: "Average price", demand: "Demand", supply: "Supply", dsRatio: "Demand–supply ratio" } as const;

  return (
    <div>
      <WorkspacePageHeader code="ANALYST · G" title="Micromarket Intelligence" description={`Select up to ${MAX} micromarkets from any city and compare demand, supply, prices, configuration mix, ticket-size mix and historical movement. Period and property type follow the global filters.`} />

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Selector */}
        <section className="flex max-h-[720px] flex-col rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60 xl:col-span-3" aria-label="Select micromarkets">
          <div className="border-b border-ink-600/50 p-4">
            <p className="text-[13.5px] font-semibold text-white">
              Selected <span className="font-mono text-muted">{selected.length}/{MAX}</span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {selected.map((id) => {
                const n = nameOf(id);
                return (
                  <li key={id} className="flex items-center gap-2 rounded-xs bg-ink-900/60 py-1.5 pl-2 pr-1 text-[12.5px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: colorFor(id) }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-white">
                      {n.mm} <span className="text-muted">· {n.city}</span>
                    </span>
                    <button type="button" onClick={() => toggle(id)} className="rounded-xs p-1 text-muted hover:bg-white/5 hover:text-white" aria-label={`Remove ${n.mm}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
            {!selected.length && <p className="mt-2 text-[12px] text-muted">Pick micromarkets below to begin.</p>}
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search micromarket or city"
                aria-label="Search micromarkets"
                className="h-8 w-full rounded-sm bg-ink-850 pl-8 pr-2 text-[12.5px] text-white outline-none ring-1 ring-inset ring-ink-600 placeholder:text-muted focus:ring-signal-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {groups.map((g) => (
              <div key={g.city.city_id} className="mb-2">
                <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{g.city.city_name}</p>
                <ul>
                  {g.items.map((m) => {
                    const on = m.micromarket_id in slots;
                    const disabled = !on && selected.length >= MAX;
                    return (
                      <li key={m.micromarket_id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          disabled={disabled}
                          onClick={() => toggle(m.micromarket_id)}
                          className={cn("flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left text-[13px] transition-colors", on ? "bg-ink-750 text-white" : "text-white/70 hover:bg-white/[0.03] hover:text-white", disabled && "cursor-not-allowed opacity-40")}
                        >
                          {on ? <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: colorFor(m.micromarket_id) }} /> : <Plus className="h-3 w-3 text-muted" aria-hidden />}
                          {m.micromarket_name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {!groups.length && <p className="p-3 text-[12.5px] text-muted">No micromarkets match “{query}”.</p>}
          </div>
        </section>

        {/* Results */}
        <div className="space-y-4 xl:col-span-9">
          {!selected.length ? (
            <div className="rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60">
              <EmptyState title="No micromarkets selected" className="min-h-[360px]">
                Choose up to {MAX} micromarkets from the list to compare them side by side.
              </EmptyState>
            </div>
          ) : (
            <>
              <section className="rounded-xs bg-ink-800 p-3 ring-1 ring-inset ring-ink-600/60" aria-label="Comparison summary">
                {display ? <DataTable table={display} /> : <div className="h-40 animate-pulse rounded-xs bg-white/[0.03]" />}
              </section>
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartPanel code="G.1" title="Demand vs supply" subtitle="Units in the selected period" option={opts?.volume ?? null} table={summary} loading={loading} />
                <ChartPanel code="G.2" title="Average price" subtitle="₹/sq ft in the selected period" option={opts?.price ?? null} table={summary} loading={loading} />
              </div>
              <ChartPanel
                code="G.3"
                title={`Historical movement — ${trendTitles[trendMetric]}`}
                subtitle="Last 12 quarters to the selected period · each market keeps its colour"
                option={opts?.trend ?? null}
                loading={loading}
                height={320}
                controls={
                  <Segmented
                    ariaLabel="Trend metric"
                    value={trendMetric}
                    onChange={setTrendMetric}
                    options={[
                      { value: "avgPrice", label: "Price" },
                      { value: "demand", label: "Demand" },
                      { value: "supply", label: "Supply" },
                      { value: "dsRatio", label: "D/S" },
                    ]}
                  />
                }
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartPanel code="G.4" title="Configuration mix (demand)" subtitle="Share of demand by BHK, %" option={opts?.bhk ?? null} loading={loading} height={Math.max(220, selected.length * 52 + 60)} />
                <ChartPanel code="G.5" title="Ticket-size mix (demand)" subtitle="Share of demand by budget bracket, %" option={opts?.ticket ?? null} loading={loading} height={Math.max(220, selected.length * 52 + 60)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
