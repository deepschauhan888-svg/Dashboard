"use client";

import { useMemo, useState } from "react";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import { demandSupplyOption, gapOption, priceTrendOption } from "@/lib/charts/options";
import { formatPct, formatPp, formatPsf } from "@/lib/utils/format";
import { EChart } from "@/components/charts/echart";
import { Container } from "@/components/layout/section";
import { DemoDataBadge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils/cn";

type Tab = "flow" | "price" | "gap";

/** Three carefully chosen views — not the dashboard. */
export function AnalyticsPreview() {
  const snap = useMemo(() => getMarketingSnapshot(), []);
  const [tab, setTab] = useState<Tab>("flow");

  const views = useMemo(() => {
    const last = snap.trend[snap.trend.length - 1];
    const gap = [...snap.bhk].sort((a, b) => b.gapPp - a.gapPp)[0];
    return {
      flow: {
        label: "Demand and supply",
        title: "Is the market absorbing what is being built?",
        caption: `Quarterly buyer demand against new supply, ${snap.trend[0].label} to ${last.label}. Bars beneath show the gap between the two.`,
        option: demandSupplyOption(snap.trend),
      },
      price: {
        label: "Price trajectory",
        title: "How fast are prices moving?",
        caption: `Supply-weighted average price per sq ft with year-on-year appreciation — ${formatPsf(last.avgPrice)} in ${last.label}, ${formatPct(last.priceYoY)} on a year earlier.`,
        option: priceTrendOption(snap.trend),
      },
      gap: {
        label: "Configuration gap",
        title: "Which homes is the market short of?",
        caption: `Share of demand minus share of supply by configuration for ${snap.yearPeriodLabel}. ${gap.label} shows the widest shortfall at ${formatPp(gap.gapPp)}.`,
        option: gapOption(snap.bhk),
      },
    } as const;
  }, [snap]);

  const v = views[tab];

  return (
    <section className="bg-white py-24 sm:py-28" aria-label="Analytics preview">
      <Container>
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="kicker text-brand">Inside the platform</p>
            <h2 className="display mt-4 max-w-2xl text-[34px] leading-[1.12] sm:text-[42px]">A preview of the analytics.</h2>
          </div>
          <TextLink href="/login">Open the demo workspace</TextLink>
        </Reveal>

        <Reveal className="mt-12 rounded-sm border border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
            <div role="tablist" aria-label="Preview" className="flex gap-6 overflow-x-auto">
              {(Object.keys(views) as Tab[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  id={`pv-${k}`}
                  aria-selected={tab === k}
                  aria-controls="pv-panel"
                  onClick={() => setTab(k)}
                  className={cn("relative whitespace-nowrap py-4 text-[14px] transition-colors", tab === k ? "font-medium text-ink" : "text-ink-2 hover:text-ink")}
                >
                  {views[k].label}
                  {tab === k && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brand" aria-hidden />}
                </button>
              ))}
            </div>
            <DemoDataBadge />
          </div>
          <div id="pv-panel" role="tabpanel" aria-labelledby={`pv-${tab}`} className="grid gap-8 p-4 sm:p-6 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:py-4">
              <h3 className="display text-[26px] leading-snug">{v.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{v.caption}</p>
              <p className="mt-6 text-[12.5px] text-ink-2">All covered cities · synthetic demonstration dataset</p>
            </div>
            <div className="lg:col-span-8">
              <EChart key={tab} option={v.option} height={360} ariaLabel={`${v.label} (demonstration data)`} />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
