"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import { multiLineOption, priceTrendOption, shareComparisonOption } from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { formatNumber, formatPct, formatPp, formatPsf } from "@/lib/utils/format";
import { EChart } from "@/components/charts/echart";
import { Container, SectionHeading } from "@/components/layout/section";
import { DemoDataBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type TabId = "demand" | "supply" | "price" | "bhk" | "ticket";

export function MarketsDecoded() {
  const snap = useMemo(() => getMarketingSnapshot(), []);
  const [tab, setTab] = useState<TabId>("demand");

  const tabs = useMemo(() => {
    const t = snap.trend;
    const labels = t.map((p) => p.label);
    const first = t[0];
    const last = t[t.length - 1];
    const topBhk = [...snap.bhk].sort((a, b) => b.gapPp - a.gapPp)[0];
    const topTicket = [...snap.ticket].sort((a, b) => b.demandShare - a.demandShare)[0];
    const items: { id: TabId; label: string; metric: string; caption: string; option: EChartsOption; insight: string }[] = [
      {
        id: "demand",
        label: "Demand trend",
        metric: formatPct(((last.demand - first.demand) / first.demand) * 100),
        caption: `${first.label} → ${last.label}`,
        option: multiLineOption(labels, [{ name: "Demand units", data: t.map((p) => p.demand), color: chartColors.demand }]),
        insight: `Quarterly buyer demand across all covered cities, ${first.label} to ${last.label}. Festive-quarter peaks and monsoon softness are visible in the seasonal pattern.`,
      },
      {
        id: "supply",
        label: "Supply trend",
        metric: formatPct(((last.supply - first.supply) / first.supply) * 100),
        caption: `${first.label} → ${last.label}`,
        option: multiLineOption(labels, [
          { name: "Supply units", data: t.map((p) => p.supply), color: chartColors.supply },
        ]),
        insight: `New supply entering the market each quarter. Compare against demand to see where the market is tightening.`,
      },
      {
        id: "price",
        label: "Price movement",
        metric: formatPsf(last.avgPrice),
        caption: `Avg ₹/sq ft · ${last.label}`,
        option: priceTrendOption(t),
        insight: `Supply-weighted average price with year-on-year appreciation for every quarter. Latest YoY: ${formatPct(last.priceYoY)}.`,
      },
      {
        id: "bhk",
        label: "BHK distribution",
        metric: formatPp(topBhk.gapPp),
        caption: `${topBhk.label} demand–supply gap`,
        option: shareComparisonOption(snap.bhk),
        insight: `Share of demand versus share of supply by configuration for ${snap.yearPeriodLabel}. ${topBhk.label} shows the widest positive gap.`,
      },
      {
        id: "ticket",
        label: "Ticket-size distribution",
        metric: `${topTicket.demandShare.toFixed(1)}%`,
        caption: `of demand in ${topTicket.label}`,
        option: shareComparisonOption(snap.ticket),
        insight: `Where buyers' budgets sit against where supply is priced, ${snap.yearPeriodLabel}. ${formatNumber(topTicket.demand)} demand units fall in the ${topTicket.label} bracket.`,
      },
    ];
    return items;
  }, [snap]);

  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  return (
    <section className="relative overflow-hidden bg-ink-900 py-24 text-white sm:py-32" aria-label="Real estate markets, decoded">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
      <Container className="relative">
        <SectionHeading
          tone="dark"
          index="02"
          eyebrow="Analytics"
          title="Real Estate Markets,"
          accent="Decoded."
          lede="A preview of the analytical engine running on the platform's demonstration dataset. Every figure here is computed live from the same data the dashboards use."
          aside={<DemoDataBadge />}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <div role="tablist" aria-label="Market indicator" className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0">
            {tabs.map((t) => {
              const selected = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls="decoded-panel"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "group relative min-w-[200px] shrink-0 rounded-xs px-5 py-4 text-left ring-1 ring-inset transition-all lg:min-w-0",
                    selected ? "bg-ink-750 ring-signal-500/50" : "bg-transparent ring-white/10 hover:bg-white/[0.03] hover:ring-white/20",
                  )}
                >
                  {selected && <motion.span layoutId="decoded-bar" className="absolute inset-y-3 left-0 w-0.5 bg-signal-500" />}
                  <span className="eyebrow text-white/45">{t.label}</span>
                  <span className="mt-2 flex items-baseline gap-2">
                    <span className="font-mono text-[22px] text-white">{t.metric}</span>
                    <span className="text-[12px] text-white/45">{t.caption}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id="decoded-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="frame rounded-xs bg-ink-800 p-5 ring-1 ring-inset ring-ink-600/60 lg:col-span-8 [--frame-color:var(--color-signal-500)]">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <EChart option={active.option} height={360} ariaLabel={`${active.label} chart (demonstration data)`} />
                <p className="mt-4 border-t border-ink-600/60 pt-4 text-[14px] leading-relaxed text-white/60">{active.insight}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <ButtonLink href="/login" variant="outline-light">
            Open the full analytical workspace <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
