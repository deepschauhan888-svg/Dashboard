"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { comparisonTrendOption, entityBarsOption, mixStackOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { formatNumber, formatPct, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChartPanel, DataTable, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/states";
import { SectionTitle, WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useViewFilters, useWorkspace } from "@/components/dashboard/workspace-context";

const MAX = 5;
type Level = "micromarket" | "city";
const DEFAULTS: Record<Level, string[]> = {
  micromarket: ["gur-dwarka-expy", "noi-sector-150", "blr-whitefield"],
  city: ["mumbai", "bengaluru", "pune"],
};

/** id → colour slot per level. Survivors keep their slot when another market is removed. */
function initialSlots() {
  return {
    micromarket: Object.fromEntries(DEFAULTS.micromarket.map((id, i) => [id, i])),
    city: Object.fromEntries(DEFAULTS.city.map((id, i) => [id, i])),
  } as Record<Level, Record<string, number>>;
}

export function ComparisonModule() {
  const { catalog } = useWorkspace();
  const { filters, key } = useViewFilters("comparison");
  const svc = getMarketDataService();
  const [level, setLevel] = useState<Level>("micromarket");
  const [allSlots, setAllSlots] = useState(initialSlots);
  const [query, setQuery] = useState("");
  const [trendMetric, setTrendMetric] = useState<"avgPrice" | "demand" | "supply" | "dsRatio">("avgPrice");
  const slots = allSlots[level];
  const selected = useMemo(() => Object.keys(slots).sort((a, b) => slots[a] - slots[b]), [slots]);
  const colorFor = (id: string) => chartColors.categorical[slots[id] ?? 0];

  function toggle(id: string) {
    setAllSlots((all) => {
      const s = all[level];
      if (id in s) {
        const next = { ...s };
        delete next[id];
        return { ...all, [level]: next };
      }
      if (Object.keys(s).length >= MAX) return all;
      const used = new Set(Object.values(s));
      let slot = 0;
      while (used.has(slot)) slot++;
      return { ...all, [level]: { ...s, [id]: slot } };
    });
  }

  const { data, loading } = useAsync(() => svc.compare(selected, level, filters, 12), [selected.join(","), level, key]);

  const groups = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    if (level === "city") return [{ heading: "Cities", items: catalog.cities.filter((c) => !q || c.city_name.toLowerCase().includes(q)).map((c) => ({ id: c.city_id, label: c.city_name })) }];
    return catalog.cities
      .map((c) => ({ heading: c.city_name, items: c.micromarkets.filter((m) => !q || m.micromarket_name.toLowerCase().includes(q) || c.city_name.toLowerCase().includes(q)).map((m) => ({ id: m.micromarket_id, label: m.micromarket_name })) }))
      .filter((g) => g.items.length);
  }, [catalog, query, level]);

  const nameOf = (id: string) => {
    for (const c of catalog?.cities ?? []) {
      if (c.city_id === id) return { name: c.city_name, sub: c.state };
      const m = c.micromarkets.find((x) => x.micromarket_id === id);
      if (m) return { name: m.micromarket_name, sub: c.city_name };
    }
    return { name: id, sub: "" };
  };

  const opts = useMemo(() => {
    if (!data || !data.length || !catalog) return null;
    const names = data.map((d) => d.label);
    const bhkCats = catalog.bhkConfigurations.map((b) => ({ id: b, label: BHK_LABELS[b] }));
    const tCats = catalog.ticketBrackets.map((b) => ({ id: b.id, label: b.label }));
    return {
      volume: entityBarsOption(names, [
        { name: "Demand", data: data.map((d) => d.aggregate.demand), color: chartColors.demand },
        { name: "Supply", data: data.map((d) => d.aggregate.supply), color: chartColors.supply },
      ]),
      trend: comparisonTrendOption(data, colorFor, trendMetric),
      bhk: mixStackOption(names, bhkCats, (ei, id) => data[ei].bhkMix.find((r) => r.id === id)?.demandShare ?? 0),
      ticket: mixStackOption(names, tCats, (ei, id) => data[ei].ticketMix.find((r) => r.id === id)?.demandShare ?? 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, catalog, trendMetric, slots]);

  const summary: TableData | undefined = data
    ? {
        columns: [level === "city" ? "City" : "Micromarket", level === "city" ? "State" : "City", "Demand", "Supply", "D ÷ S", "Avg ₹/sq ft", "Price YoY %", "Inventory"],
        rows: data.map((d) => [d.label, level === "city" ? nameOf(d.id).sub : d.cityName, d.aggregate.demand, d.aggregate.supply, d.aggregate.dsRatio === null ? null : round(d.aggregate.dsRatio, 2), d.aggregate.avgPrice === null ? null : Math.round(d.aggregate.avgPrice), d.priceYoY === null ? null : round(d.priceYoY, 1), d.aggregate.inventory]),
      }
    : undefined;
  useRegisterExport("Market comparison", summary);

  const trendTitles = { avgPrice: "Average price", demand: "Demand", supply: "Supply", dsRatio: "Demand ÷ supply" } as const;
  const mixHeight = Math.max(200, selected.length * 48 + 70);

  return (
    <div>
      <WorkspacePageHeader
        kicker="Analyst · Comparison"
        title="Market Comparison"
        description={`Compare up to ${MAX} cities or micromarkets on every indicator. Each market keeps its colour throughout. Period and configuration follow the filters above.`}
        actions={<Segmented ariaLabel="Comparison level" size="md" value={level} onChange={(v) => { setLevel(v); setQuery(""); }} options={[{ value: "micromarket", label: "Micromarkets" }, { value: "city", label: "Cities" }]} />}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="flex max-h-[760px] flex-col rounded-sm border border-line xl:col-span-3" aria-label={`Select ${level === "city" ? "cities" : "micromarkets"}`}>
          <div className="border-b border-line p-4">
            <p className="text-[13.5px] font-semibold">
              Selected <span className="font-normal text-ink-2">{selected.length} of {MAX}</span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {selected.map((id) => {
                const n = nameOf(id);
                return (
                  <li key={id} className="flex items-center gap-2 rounded-xs bg-paper py-1.5 pl-2 pr-1 text-[12.5px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: colorFor(id) }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      {n.name} <span className="text-ink-2">· {n.sub}</span>
                    </span>
                    <button type="button" onClick={() => toggle(id)} className="rounded-xs p-1 text-ink-2 hover:bg-mist hover:text-ink" aria-label={`Remove ${n.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-2" aria-hidden />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${level === "city" ? "cities" : "micromarkets or cities"}`} aria-label="Search markets" className="h-8 w-full rounded-sm bg-white pl-8 pr-2 text-[12.5px] outline-none ring-1 ring-inset ring-line-strong placeholder:text-ink-2/70 focus:ring-2 focus:ring-brand" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {groups.map((g) => (
              <div key={g.heading} className="mb-2">
                <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-2">{g.heading}</p>
                <ul>
                  {g.items.map((m) => {
                    const on = m.id in slots;
                    const disabled = !on && selected.length >= MAX;
                    return (
                      <li key={m.id}>
                        <button type="button" aria-pressed={on} disabled={disabled} onClick={() => toggle(m.id)} className={cn("flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left text-[13px] transition-colors", on ? "bg-brand-tint font-medium text-ink" : "text-ink-2 hover:bg-paper hover:text-ink", disabled && "cursor-not-allowed opacity-40")}>
                          {on ? <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: colorFor(m.id) }} /> : <Plus className="h-3 w-3 text-ink-3" aria-hidden />}
                          {m.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {!groups.length && <p className="p-3 text-[12.5px] text-ink-2">No markets match “{query}”.</p>}
          </div>
        </section>

        <div className="space-y-6 xl:col-span-9">
          {!selected.length ? (
            <div className="rounded-sm border border-line">
              <EmptyState title="Nothing selected" className="min-h-[360px]">
                Choose up to {MAX} {level === "city" ? "cities" : "micromarkets"} from the list to compare them side by side.
              </EmptyState>
            </div>
          ) : (
            <>
              <section className="rounded-sm border border-line p-3" aria-label="Comparison summary">
                {data ? (
                  <DataTable
                    table={{
                      columns: summary!.columns,
                      rows: data.map((d) => [d.label, level === "city" ? nameOf(d.id).sub : d.cityName, formatNumber(d.aggregate.demand), formatNumber(d.aggregate.supply), formatRatio(d.aggregate.dsRatio), formatPsf(d.aggregate.avgPrice), formatPct(d.priceYoY), formatNumber(d.aggregate.inventory)]),
                    }}
                  />
                ) : (
                  <div className="h-40 animate-pulse rounded-xs bg-paper" />
                )}
              </section>
              <ChartPanel
                title={`${trendTitles[trendMetric]} over time`}
                subtitle="Last 12 quarters to the selected period"
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
                      { value: "dsRatio", label: "D ÷ S" },
                    ]}
                  />
                }
              />
              <ChartPanel title="Demand and supply" subtitle="Units in the selected period" option={opts?.volume ?? null} table={summary} loading={loading} height={280} />
              <SectionTitle title="Product mix" description="Share of each market's demand" />
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartPanel title="Configuration mix" subtitle="% of demand by BHK" option={opts?.bhk ?? null} loading={loading} height={mixHeight} />
                <ChartPanel title="Ticket-size mix" subtitle="% of demand by budget bracket" option={opts?.ticket ?? null} loading={loading} height={mixHeight} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
