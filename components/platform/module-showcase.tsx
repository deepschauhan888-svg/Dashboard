"use client";

import type { EChartsOption } from "echarts";
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
    const yearScope = { ...snap.yearFilters };
    const mm = e.breakdown(yearScope, "micromarket").filter((r) => r.dsRatio !== null).sort((a, b) => (b.dsRatio ?? 0) - (a.dsRatio ?? 0)).slice(0, 8);
    const hist = e.history({ ...snap.yearFilters });
    const years = [...new Set(hist.map((h) => h.year))];
    const compare = e.compare(COMPARE_IDS, "micromarket", { ...snap.quarterFilters });
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
          <p className="kicker text-ink-2">Ten modules</p>
          <ol className="mt-5 border-l border-line">
            {platformModules.map((m) => (
              <li key={m.id}>
                <a
                  href={`#${m.id}`}
                  aria-current={active === m.id ? "true" : undefined}
                  className={cn("-ml-px flex items-baseline gap-3 border-l-2 py-2 pl-4 text-[14px] transition-colors", active === m.id ? "border-brand font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink")}
                >
                  <span className="w-5 text-[12px] tabular text-ink-3">{m.n}</span>
                  {m.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-t border-line pt-5">
            <DemoDataBadge />
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">Charts on this page are drawn from the synthetic demonstration dataset.</p>
          </div>
        </div>
      </nav>

      <div className="divide-y divide-line lg:col-span-9">
        {platformModules.map((m) => (
          <article key={m.id} id={m.id} className="scroll-mt-28 py-16 first:pt-0">
            <Reveal className="grid gap-8 xl:grid-cols-12">
              <div className="xl:col-span-5">
                <span className="text-[13px] font-medium text-brand">{m.n}</span>
                <h2 className="display mt-3 text-[32px] leading-tight">{m.title}</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-ink-2">{m.description}</p>
                <h3 className="kicker mt-8 text-ink">Analytical capabilities</h3>
                <ul className="mt-3 space-y-2">
                  {m.capabilities.map((c) => (
                    <li key={c} className="flex gap-3 text-[14.5px] text-ink">
                      <span className="mt-[9px] h-px w-3 shrink-0 bg-brand" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-l-2 border-brand bg-paper px-5 py-4">
                  <p className="kicker text-ink-2">Developer use case</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{m.useCase}</p>
                </div>
              </div>
              <div className="xl:col-span-7">
                <figure className="rounded-sm border border-line p-4">
                  <figcaption className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[13.5px] font-medium">{m.chartTitle}</span>
                    <DemoDataBadge compact />
                  </figcaption>
                  <EChart option={charts[m.id]} height={320} ariaLabel={`${m.chartTitle} (demonstration data)`} />
                </figure>
                <Link href={m.workspaceHref} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink hover:text-brand">
                  Open this module in the workspace <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  );
}
