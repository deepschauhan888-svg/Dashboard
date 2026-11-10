"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { siteConfig } from "@/lib/config/site";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import { formatNumber, formatPct, formatPsf, formatRatio } from "@/lib/utils/format";
import { periodLabel } from "@/lib/analytics/period";
import { ButtonLink } from "@/components/ui/button";
import { DemoDataBadge } from "@/components/ui/badge";
import { HeroCanvas } from "./hero-canvas";
import { CountUp } from "./count-up";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const snap = useMemo(() => getMarketingSnapshot(), []);
  const reduce = useReducedMotion();
  const k = snap.kpis;
  const rise = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease } });

  const readouts = [
    { label: "Demand units", value: k.current.demand, fmt: formatNumber, change: pct(k.current.demand, k.comparison?.demand) },
    { label: "Supply units", value: k.current.supply, fmt: formatNumber, change: pct(k.current.supply, k.comparison?.supply), neutral: true },
    { label: "Avg price ₹/sq ft", value: k.current.avgPrice ?? 0, fmt: formatPsf, change: k.priceAppreciationYoY, yoy: true },
    { label: "Demand / supply", value: k.current.dsRatio ?? 0, fmt: formatRatio, change: null },
  ];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink-900 text-white">
      {siteConfig.imagery.hero && (
        <Image src={siteConfig.imagery.hero} alt="" fill priority className="-z-20 object-cover opacity-35 mix-blend-luminosity" sizes="100vw" />
      )}
      <HeroCanvas className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_25%_45%,rgba(7,20,38,0.96)_0%,rgba(7,20,38,0.75)_45%,rgba(7,20,38,0.2)_100%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink-900 to-transparent" aria-hidden />

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 pb-16 pt-32 sm:px-8">
        <motion.div {...rise(0.1)} className="flex items-center gap-3">
          <span className="h-px w-10 bg-signal-500" aria-hidden />
          <span className="eyebrow text-signal-200">MB Research · {siteConfig.parentBrand}</span>
        </motion.div>

        <h1 className="mt-7 max-w-[15ch] text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[84px]">
          <motion.span {...rise(0.2)} className="block">
            Real Estate Intelligence.
          </motion.span>
          <motion.span {...rise(0.35)} className="block font-serif font-light italic tracking-[-0.02em] text-signal-200">
            Beyond the Obvious.
          </motion.span>
        </h1>

        <motion.p {...rise(0.5)} className="mt-8 max-w-xl text-[17px] leading-relaxed text-white/65 sm:text-[18px]">
          Transforming real estate market data into actionable intelligence through comprehensive analysis of demand, supply, pricing and evolving market dynamics.
        </motion.p>

        <motion.div {...rise(0.65)} className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/platform" size="lg">
            Explore the Platform <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/contact?type=demonstration" size="lg" variant="secondary">
            Request a Demo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </motion.div>
      </div>

      {/* Terminal readout strip */}
      <motion.div {...rise(0.85)} className="relative mx-auto w-full max-w-[1320px] px-5 pb-10 sm:px-8">
        <div className="frame rounded-xs border border-white/10 bg-ink-900/70 backdrop-blur-sm [--frame-color:var(--color-signal-500)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-signal-500" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-500" />
              </span>
              <span className="eyebrow text-white/60">Platform preview · All covered cities · {periodLabel(snap.latest)}</span>
            </div>
            <DemoDataBadge />
          </div>
          <dl className="grid grid-cols-2 divide-white/10 md:grid-cols-4 md:divide-x">
            {readouts.map((r) => (
              <div key={r.label} className="px-5 py-4">
                <dt className="eyebrow text-white/45">{r.label}</dt>
                <dd className="mt-2 flex items-baseline gap-3">
                  <span className="font-mono text-[22px] text-white sm:text-[26px]">
                    <CountUp value={r.value} format={r.fmt} />
                  </span>
                  {r.change !== null && r.change !== undefined && (
                    <span className={"neutral" in r && r.neutral ? "font-mono text-[12px] text-white/55" : r.change >= 0 ? "font-mono text-[12px] text-positive" : "font-mono text-[12px] text-negative"}>
                      {formatPct(r.change)} {r.yoy ? "YoY" : "QoQ"}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </section>
  );
}

function pct(a: number, b: number | undefined) {
  return b ? ((a - b) / b) * 100 : null;
}
