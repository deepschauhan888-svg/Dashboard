"use client";

import { useMemo } from "react";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { gapOption, shareComparisonOption, shareTrendOption, volumeBarsOption } from "@/lib/charts/options";
import { breakdownTable } from "@/lib/charts/tables";
import { BHK_LABELS } from "@/lib/config/dimensions";
import { formatNumber, formatPct, formatPp, formatPsf, formatRatio, round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useWorkspace } from "@/components/dashboard/workspace-context";
import type { BhkConfiguration, BreakdownRow } from "@/types/market";

export function ConfigurationModule() {
  const { filters } = useWorkspace();
  const svc = getMarketDataService();

  const { data, loading } = useAsync(async () => {
    const [bhk, shares, kpis] = await Promise.all([svc.getBreakdown(filters, "bhk"), svc.getShareTrend(filters, "bhk", 8), svc.getKpis(filters)]);
    return { bhk, shares, kpis };
  }, [filters.cityId, filters.micromarketId, filters.year, filters.quarter, filters.propertyType]);

  const empty = !!data && data.kpis.current.recordCount === 0;
  const cats = (["1BHK", "2BHK", "3BHK", "4BHK+"] as BhkConfiguration[]).map((b) => ({ id: b, label: BHK_LABELS[b] }));

  const opts = useMemo(() => {
    if (!data) return null;
    return {
      volume: volumeBarsOption(data.bhk),
      share: shareComparisonOption(data.bhk),
      gap: gapOption(data.bhk),
      demandShift: shareTrendOption(data.shares.map((s) => s.label), cats, (id) => data.shares.map((s) => s.demandShare[id] ?? 0)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tbl = data ? breakdownTable(data.bhk, "Configuration") : undefined;
  const shiftTbl: TableData | undefined = data
    ? { columns: ["Quarter", ...cats.flatMap((c) => [`${c.label} demand %`, `${c.label} supply %`])], rows: data.shares.map((s) => [s.label, ...cats.flatMap((c) => [round(s.demandShare[c.id] ?? 0, 1), round(s.supplyShare[c.id] ?? 0, 1)])]) }
    : undefined;
  useRegisterExport("Configuration — demand vs supply", tbl);
  useRegisterExport("Configuration — quarterly mix", shiftTbl);

  return (
    <div>
      <WorkspacePageHeader code="ANALYST · D" title="Configuration Intelligence" description="1, 2, 3 and 4+ BHK compared on demand, supply, share of market, price and the gap between what buyers want and what is being built." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {((data?.bhk ?? cats.map(() => null)) as (BreakdownRow | null)[]).map((r, i) => (
          <article key={r?.id ?? i} className={cn("rounded-xs bg-ink-800 p-4 ring-1 ring-inset ring-ink-600/60", loading && "opacity-60")}>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-white">{r?.label ?? cats[i].label}</h3>
              {r && (
                <span className={cn("rounded-xs px-1.5 py-0.5 font-mono text-[11px]", r.gapPp > 0.5 ? "bg-signal-500/15 text-signal-200" : r.gapPp < -0.5 ? "bg-series-supply/15 text-[#F2A877]" : "bg-white/[0.06] text-white/70")}>
                  {r.gapPp > 0.5 ? "Under-supplied" : r.gapPp < -0.5 ? "Over-supplied" : "Balanced"}
                </span>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
              <Stat label="Demand" value={formatNumber(r?.demand)} sub={r ? `${r.demandShare.toFixed(1)}% share` : ""} />
              <Stat label="Supply" value={formatNumber(r?.supply)} sub={r ? `${r.supplyShare.toFixed(1)}% share` : ""} />
              <Stat label="Gap" value={formatPp(r?.gapPp)} sub={`D/S ${formatRatio(r?.dsRatio)}`} />
              <Stat label="Avg price" value={formatPsf(r?.avgPrice)} sub={`YoY ${formatPct(r?.priceYoY)}`} />
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel code="D.1" title="Demand vs supply by configuration" subtitle="Units in the selected period" option={opts?.volume ?? null} table={tbl} loading={loading} empty={empty} />
        <ChartPanel code="D.2" title="Share of demand vs share of supply" subtitle="% of total" option={opts?.share ?? null} table={tbl} loading={loading} empty={empty} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel code="D.3" title="Configuration gap" subtitle="Demand share − supply share, percentage points (blue: demand-led · orange: supply-led)" option={opts?.gap ?? null} table={tbl} loading={loading} empty={empty} height={260} />
        <ChartPanel code="D.4" title="Demand mix shift" subtitle="Share of demand by configuration, last 8 quarters" option={opts?.demandShift ?? null} table={shiftTbl} loading={loading} empty={empty} height={260} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-[15px] text-white">{value}</dd>
      <dd className="text-[11px] text-muted">{sub}</dd>
    </div>
  );
}
