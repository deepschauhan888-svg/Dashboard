"use client";

import { Check, PencilRuler } from "lucide-react";
import { useMemo, useState } from "react";
import type { Bracket } from "@/types/market";
import { getMarketDataService } from "@/lib/services";
import { useAsync } from "@/lib/hooks/use-async";
import { entityBarsOption, gapOption, shareComparisonOption, shareTrendOption, volumeBarsOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { breakdownTable } from "@/lib/charts/tables";
import { formatPp, round } from "@/lib/utils/format";
import { parseBreakpoints } from "@/lib/analytics/brackets";
import { ChartPanel, type TableData } from "@/components/charts/chart-panel";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/dashboard/page-header";
import { useRegisterExport, useWorkspace } from "@/components/dashboard/workspace-context";

type Dim = "ticket" | "size";

const COPY = {
  ticket: {
    code: "ANALYST · E",
    letter: "E",
    title: "Ticket Size Intelligence",
    description: "Demand share, supply share and market imbalance across budget brackets. Choose a preset or define your own brackets.",
    unitHint: "Breakpoints in ₹ lakh, comma-separated (e.g. 40, 80, 150, 300)",
    multiplier: 100_000,
    defaultCustom: "40, 80, 150, 300",
    noun: "budget bracket",
  },
  size: {
    code: "ANALYST · F",
    letter: "F",
    title: "Size Intelligence",
    description: "Demand and supply across property area ranges (sq ft, super built-up). Choose a preset or define your own ranges.",
    unitHint: "Breakpoints in sq ft, comma-separated (e.g. 650, 1100, 1600, 2400)",
    multiplier: 1,
    defaultCustom: "650, 1100, 1600, 2400",
    noun: "size range",
  },
} as const;

export function BracketModule({ dim }: { dim: Dim }) {
  const { filters, catalog } = useWorkspace();
  const svc = getMarketDataService();
  const copy = COPY[dim];
  const presets = dim === "ticket" ? catalog?.ticketPresets ?? [] : catalog?.sizePresets ?? [];
  const [preset, setPreset] = useState<string>("standard");
  const [customText, setCustomText] = useState<string>(copy.defaultCustom);
  const [applied, setApplied] = useState<string>(copy.defaultCustom);
  const parsed = useMemo(() => parseBreakpoints(customText, dim), [customText, dim]);
  const appliedParsed = useMemo(() => parseBreakpoints(applied, dim), [applied, dim]);

  const brackets: Bracket[] | undefined = preset === "custom" ? appliedParsed.brackets ?? undefined : presets.find((p) => p.id === preset)?.brackets;
  const bracketKey = brackets?.map((b) => `${b.min}-${b.max}`).join("|") ?? "";

  const { data, loading } = useAsync(async () => {
    const opts = { brackets };
    const [rows, shares, kpis] = await Promise.all([svc.getBreakdown(filters, dim, opts), svc.getShareTrend(filters, dim, 8, opts), svc.getKpis(filters)]);
    return { rows, shares, kpis };
  }, [filters.cityId, filters.micromarketId, filters.year, filters.quarter, filters.propertyType, bracketKey]);

  const empty = !!data && data.kpis.current.recordCount === 0;
  const cats = useMemo(() => (data ? data.rows.map((r) => ({ id: r.id, label: r.label })) : []), [data]);

  const qChange = useMemo(() => {
    if (!data || data.shares.length < 2) return [];
    const a = data.shares[data.shares.length - 2];
    const b = data.shares[data.shares.length - 1];
    return cats.map((c) => ({
      label: c.label,
      demand: (b.demandShare[c.id] ?? 0) - (a.demandShare[c.id] ?? 0),
      supply: (b.supplyShare[c.id] ?? 0) - (a.supplyShare[c.id] ?? 0),
      from: a.label,
      to: b.label,
    }));
  }, [data, cats]);

  const opts = useMemo(() => {
    if (!data) return null;
    return {
      share: shareComparisonOption(data.rows),
      gap: gapOption(data.rows),
      volume: volumeBarsOption(data.rows),
      shift: shareTrendOption(data.shares.map((s) => s.label), cats, (id) => data.shares.map((s) => s.demandShare[id] ?? 0)),
      qchange: entityBarsOption(
        qChange.map((q) => q.label),
        [
          { name: "Δ demand share (pp)", data: qChange.map((q) => round(q.demand, 2)), color: chartColors.demand },
          { name: "Δ supply share (pp)", data: qChange.map((q) => round(q.supply, 2)), color: chartColors.supply },
        ],
        { format: (v) => formatPp(v, 2) },
      ),
    };
  }, [data, cats, qChange]);

  const tbl = data ? breakdownTable(data.rows, dim === "ticket" ? "Ticket size" : "Unit size") : undefined;
  const qTbl: TableData = { columns: ["Bracket", "Δ demand share (pp)", "Δ supply share (pp)"], rows: qChange.map((q) => [q.label, round(q.demand, 2), round(q.supply, 2)]) };
  useRegisterExport(`${copy.title} — distribution`, tbl);
  useRegisterExport(`${copy.title} — quarterly change`, qTbl);

  const widest = data ? [...data.rows].sort((a, b) => b.gapPp - a.gapPp)[0] : null;
  const over = data ? [...data.rows].sort((a, b) => a.gapPp - b.gapPp)[0] : null;
  const L = copy.letter;

  return (
    <div>
      <WorkspacePageHeader code={copy.code} title={copy.title} description={copy.description} />

      <section className="mb-4 flex flex-wrap items-end gap-4 rounded-xs bg-ink-800 p-4 ring-1 ring-inset ring-ink-600/60" aria-label="Bracket configuration">
        <div>
          <p className="eyebrow mb-1.5 !text-[10px] text-muted">Bracket preset</p>
          <Segmented
            ariaLabel="Bracket preset"
            size="md"
            value={preset}
            onChange={setPreset}
            options={[...presets.map((p) => ({ value: p.id, label: p.label })), { value: "custom", label: "Custom" }]}
          />
        </div>
        {preset === "custom" ? (
          <form
            className="flex flex-1 flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (parsed.brackets) setApplied(customText);
            }}
          >
            <div className="min-w-[260px] flex-1">
              <label htmlFor={`bp-${dim}`} className="eyebrow mb-1.5 block !text-[10px] text-muted">
                Custom breakpoints
              </label>
              <input
                id={`bp-${dim}`}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="h-9 w-full rounded-sm bg-ink-850 px-3 font-mono text-[13px] text-white outline-none ring-1 ring-inset ring-ink-600 focus:ring-signal-500"
                aria-describedby={`bp-${dim}-hint`}
                aria-invalid={!!parsed.error}
              />
              <p id={`bp-${dim}-hint`} className={parsed.error ? "mt-1 text-[11.5px] text-negative" : "mt-1 text-[11.5px] text-muted"}>
                {parsed.error ?? copy.unitHint}
              </p>
            </div>
            <Button type="submit" size="sm" className="mb-5 h-9" disabled={!!parsed.error || customText === applied}>
              <Check className="h-3.5 w-3.5" aria-hidden /> Apply
            </Button>
          </form>
        ) : (
          <p className="flex items-center gap-2 pb-2 text-[12.5px] text-muted">
            <PencilRuler className="h-3.5 w-3.5" aria-hidden />
            {presets.find((p) => p.id === preset)?.description}. Records are re-bucketed from their representative {dim === "ticket" ? "ticket value" : "unit size"}.
          </p>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          code={`${L}.1`}
          title="Demand share vs supply share"
          subtitle={`% of total by ${copy.noun}`}
          option={opts?.share ?? null}
          table={tbl}
          loading={loading}
          empty={empty}
          height={330}
        />
        <ChartPanel
          code={`${L}.2`}
          title="Market imbalance"
          subtitle="Demand share − supply share (pp) · blue: under-supplied · orange: over-supplied"
          option={opts?.gap ?? null}
          table={tbl}
          loading={loading}
          empty={empty}
          height={330}
          footer={widest && over ? <>Most under-supplied: <span className="text-white">{widest.label}</span> ({formatPp(widest.gapPp)}). Most over-supplied: <span className="text-white">{over.label}</span> ({formatPp(over.gapPp)}).</> : undefined}
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartPanel code={`${L}.3`} title="Demand and supply units" subtitle={`Absolute units by ${copy.noun}`} option={opts?.volume ?? null} table={tbl} loading={loading} empty={empty} height={300} />
        <ChartPanel code={`${L}.4`} title="Demand share over time" subtitle="Last 8 quarters" option={opts?.shift ?? null} loading={loading} empty={empty} height={300} />
        <ChartPanel
          code={`${L}.5`}
          title="Quarterly change in share"
          subtitle={qChange[0] ? `${qChange[0].from} → ${qChange[0].to}, percentage points` : "Latest quarter vs previous"}
          option={opts?.qchange ?? null}
          table={qTbl}
          loading={loading}
          empty={empty}
          height={300}
        />
      </div>
    </div>
  );
}
