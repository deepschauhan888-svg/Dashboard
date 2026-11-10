"use client";

import type { EChartsOption } from "echarts";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { platformModules } from "@/lib/config/platform-modules";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import {
  comparisonTrendOption,
  demandSupplyOption,
  gapOption,
  priceTrendOption,
  rankedBarsOption,
  seasonalOverlayOption,
  shareComparisonOption,
  volumeBarsOption,
} from "@/lib/charts/options";
import { chartColors } from "@/lib/charts/theme";
import { formatNumber, formatPct, formatRatio } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { EChart } from "@/components/charts/echart";
import { DemoDataBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

const COMPARE_IDS = ["gur-dwarka-expy", "blr-whitefield", "pun-kharadi"];

export function ModuleShowcase() {
  const snap = useMemo(() => getMarketingSnapshot(), []);
  const [active, setActive] = useState(platformModules[0].id);

  const charts = useMemo<Record<string, EChartsOption>>(() => {
    const e = snap.engine;
    const yearScope = { cityId: "all", micromarketId: "all", year: snap.latest.year, quarter: "all" as const, propertyType: "all" as const };
    const mm = e.breakdown(yearScope, "micromarket").filter((r) => r.dsRatio !== null).sort((a, b) => (b.dsRatio ?? 0) - (a.dsRatio ?? 0)).slice(0, 8);
    const hist = e.history({ cityId: "all", micromarketId: "all", propertyType: "all" });
    const years = [...new Set(hist.map((h) => h.year))];
    const compare = e.compare(COMPARE_IDS, "micromarket", { year: snap.latest.year, quarter: snap.latest.quarter, propertyType: "all" });
    return {
      demand: demandSupplyOption(snap.trend),
      supply: volumeBarsOption(snap.cities),
      price: priceTrendOption(snap.trend),
      configuration: shareComparisonOption(snap.bhk),
      ticket: gapOption(snap.ticket),
      size: shareComparisonOption(snap.size, { horizontal: false }),
      city: rankedBarsOption(
        [...snap.cities].sort((a, b) => (b.priceYoY ?? 0) - (a.priceYoY ?? 0)).map((c) => ({ label: c.label, value: c.priceYoY === null ? null : Math.round(c.priceYoY * 10) / 10 })),
        { seriesName: "Price YoY", color: chartColors.price, format: (v) => formatPct(v) },
      ),
      micromarket: rankedBarsOption(
        mm.map((r) => ({ label: r.label, value: r.dsRatio === null ? null : Math.round(r.dsRatio * 100) / 100 })),
        { seriesName: "Demand ÷ supply", color: chartColors.demand, format: (v) => formatRatio(v) },
      ),
      history: seasonalOverlayOption(
        years,
        (y, q) => hist.find((h) => h.year === y && h.quarter === q)?.demand ?? null,
        (y) => chartColors.categorical[years.indexOf(y) % chartColors.categorical.length],
        formatNumber,
      ),
      comparison: comparisonTrendOption(compare, (id) => chartColors.categorical[COMPARE_IDS.indexOf(id)], "avgPrice"),
    };
  }, [snap]);

  // scroll-spy for the module index
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    platformModules.forEach((m) => {
      const el = document.getElementById(m.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <nav aria-label="Modules" className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">
          <p className="eyebrow text-subtle">Analytical modules</p>
          <ol className="mt-5 space-y-0.5 border-l border-rule">
            {platformModules.map((m) => (
              <li key={m.id}>
                <a
                  href={`#${m.id}`}
                  aria-current={active === m.id ? "true" : undefined}
                  className={cn(
                    "-ml-px flex items-center gap-3 border-l py-2 pl-4 text-[13.5px] transition-colors",
                    active === m.id ? "border-signal-500 font-medium text-ink-900" : "border-transparent text-subtle hover:text-ink-900",
                  )}
                >
                  <span className="font-mono text-[10.5px] text-muted">{m.code}</span>
                  {m.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <DemoDataBadge />
            <p className="mt-3 text-[12px] leading-relaxed text-muted">Charts on this page run on the synthetic demonstration dataset.</p>
          </div>
        </div>
      </nav>

      <div className="space-y-24 lg:col-span-9">
        {platformModules.map((m, i) => (
          <article key={m.id} id={m.id} className="scroll-mt-28">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-signal-600">{m.code}</span>
                <span className="h-px w-8 bg-rule" aria-hidden />
                <span className="eyebrow text-subtle">{m.title}</span>
              </div>
              <h2 className="mt-4 max-w-2xl text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink-900 sm:text-[36px]">{m.headline}</h2>
            </Reveal>
            <div className={cn("mt-8 grid gap-8 xl:grid-cols-5", i % 2 === 1 && "xl:[&>*:first-child]:order-2")}>
              <Reveal className="xl:col-span-3">
                <div className="frame rounded-xs bg-ink-800 p-4 ring-1 ring-inset ring-ink-600/60 [--frame-color:var(--color-signal-500)]">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[13px] font-medium text-white/85">{m.chartTitle}</span>
                    <DemoDataBadge compact />
                  </div>
                  <EChart option={charts[m.id]} height={300} ariaLabel={`${m.chartTitle} (demonstration data)`} />
                </div>
              </Reveal>
              <Reveal delay={0.1} className="xl:col-span-2">
                <p className="text-[15.5px] leading-relaxed text-subtle">{m.explanation}</p>
                <div className="mt-6 border-t border-rule pt-5">
                  <p className="eyebrow text-ink-900">Business application</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-text">{m.application}</p>
                </div>
                <div className="mt-6 border-t border-rule pt-5">
                  <p className="eyebrow text-ink-900">Use cases</p>
                  <ul className="mt-3 space-y-2">
                    {m.useCases.map((u) => (
                      <li key={u} className="flex items-center gap-2.5 text-[14px] text-text">
                        <Check className="h-3.5 w-3.5 text-signal-500" aria-hidden /> {u}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={m.workspaceHref} className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-signal-600 hover:text-signal-500">
                  Open in workspace <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
