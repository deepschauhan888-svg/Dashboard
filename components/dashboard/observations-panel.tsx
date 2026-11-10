"use client";

import { ArrowDownRight, ArrowUpRight, CircleDot, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Observation } from "@/types/market";
import { cn } from "@/lib/utils/cn";
import { DemoDataBadge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/states";

const KIND_LABEL: Record<Observation["kind"], string> = {
  demand_shift: "Demand",
  supply_shift: "Supply",
  price_movement: "Price",
  mismatch: "Mismatch",
  inventory: "Inventory",
  leader: "Leader",
};

export function ObservationsPanel({ items, loading, className }: { items: Observation[] | null; loading?: boolean; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className={cn("frame flex flex-col rounded-xs bg-ink-800 ring-1 ring-inset ring-ink-600/60", className)} aria-label="Key market observations">
      <header className="flex items-start justify-between gap-3 border-b border-ink-600/50 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-signal-400">G</span>
            <DemoDataBadge compact className="!text-[9.5px]" />
          </div>
          <h3 className="mt-1 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
            <Sparkles className="h-4 w-4 text-signal-400" aria-hidden /> Key market observations
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Generated from the numbers on this page. Expand for evidence.</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-thin" aria-busy={loading}>
        {loading && !items ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : items && items.length ? (
          <ol className={cn("divide-y divide-ink-600/40 transition-opacity", loading && "opacity-50")}>
            {items.map((o) => {
              const Icon = o.tone === "positive" ? ArrowUpRight : o.tone === "negative" ? ArrowDownRight : CircleDot;
              const expanded = open === o.id;
              return (
                <li key={o.id}>
                  <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : o.id)} className="flex w-full gap-3 px-5 py-4 text-left hover:bg-white/[0.02]">
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xs",
                        o.tone === "positive" && "bg-positive/12 text-positive",
                        o.tone === "negative" && "bg-negative/12 text-negative",
                        o.tone === "neutral" && "bg-signal-500/12 text-signal-400",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{KIND_LABEL[o.kind]}</span>
                      <span className="mt-0.5 block text-[13.5px] font-medium leading-snug text-white">{o.headline}</span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-white/55">{o.detail}</span>
                      {expanded && (
                        <dl className="mt-3 grid grid-cols-2 gap-2">
                          {o.evidence.map((ev) => (
                            <div key={ev.label} className="rounded-xs bg-ink-900/60 px-2.5 py-2 ring-1 ring-inset ring-ink-600/50">
                              <dt className="truncate text-[10.5px] text-muted">{ev.label}</dt>
                              <dd className="font-mono text-[12.5px] text-white">{ev.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState title="No notable movements">No indicator crossed an observation threshold for this selection.</EmptyState>
        )}
      </div>
    </section>
  );
}
