"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Observation } from "@/types/market";
import { cn } from "@/lib/utils/cn";
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
    <section className={cn("flex flex-col rounded-sm border border-line bg-white", className)} aria-label="Key market observations">
      <header className="px-5 pb-3 pt-4">
        <h3 className="text-[15px] font-semibold">Key market observations</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-2">Derived from the figures on this page. Select one to see its evidence.</p>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-thin" aria-busy={loading}>
        {loading && !items ? (
          <div className="space-y-3 px-5 pb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : items && items.length ? (
          <ol className={cn("border-t border-line transition-opacity", loading && "opacity-50")}>
            {items.map((o, i) => {
              const expanded = open === o.id;
              return (
                <li key={o.id} className="border-b border-line last:border-b-0">
                  <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : o.id)} className="flex w-full gap-4 px-5 py-4 text-left hover:bg-paper">
                    <span className={cn("mt-0.5 text-[12px] font-semibold tabular", o.tone === "negative" ? "text-negative" : "text-brand")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">{KIND_LABEL[o.kind]}</span>
                      <span className="mt-0.5 block text-[14px] font-medium leading-snug text-ink">{o.headline}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">{o.detail}</span>
                      {expanded && (
                        <dl className="mt-3 grid grid-cols-2 gap-2">
                          {o.evidence.map((ev) => (
                            <div key={ev.label} className="rounded-xs bg-paper px-3 py-2">
                              <dt className="truncate text-[11px] text-ink-2">{ev.label}</dt>
                              <dd className="text-[13px] font-medium tabular">{ev.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </span>
                    <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-ink-2 transition-transform", expanded && "rotate-180")} aria-hidden />
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
