"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building2, IndianRupee, Layers, MapPinned, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { intelligenceAreas } from "@/lib/config/modules";
import { Container, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/ui/reveal";

const ICONS = {
  demand: TrendingUp,
  supply: Building2,
  price: IndianRupee,
  configuration: Layers,
  ticket: Wallet,
  micromarket: MapPinned,
} as const;

/** Small abstract glyph per card that animates on hover — signals "data", not decoration. */
function Glyph({ id }: { id: string }) {
  const common = "stroke-current";
  switch (id) {
    case "demand":
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          <motion.path d="M0 34 L20 30 L40 31 L60 22 L80 18 L100 10 L120 6" fill="none" strokeWidth="1.5" className={common} variants={{ rest: { pathLength: 0.35 }, hover: { pathLength: 1 } }} transition={{ duration: 0.8 }} />
        </svg>
      );
    case "supply":
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.rect key={i} x={i * 15 + 2} width="9" rx="1" className="fill-current" variants={{ rest: { y: 34, height: 6 }, hover: { y: 40 - (10 + ((i * 13) % 26)), height: 10 + ((i * 13) % 26) } }} transition={{ duration: 0.5, delay: i * 0.03 }} />
          ))}
        </svg>
      );
    case "price":
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          <motion.path d="M0 36 C30 34, 50 26, 70 20 S110 6, 120 4" fill="none" strokeWidth="1.5" className={common} variants={{ rest: { pathLength: 0.3 }, hover: { pathLength: 1 } }} transition={{ duration: 0.8 }} />
        </svg>
      );
    case "configuration":
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          {[18, 38, 30, 14].map((v, i) => (
            <g key={i}>
              <motion.rect x={i * 30 + 2} width="11" rx="1" className="fill-current" variants={{ rest: { y: 36, height: 4 }, hover: { y: 40 - v, height: v } }} transition={{ duration: 0.5, delay: i * 0.05 }} />
              <motion.rect x={i * 30 + 14} width="11" rx="1" className="fill-current opacity-40" variants={{ rest: { y: 36, height: 4 }, hover: { y: 40 - (v * 0.8 + 4), height: v * 0.8 + 4 } }} transition={{ duration: 0.5, delay: i * 0.05 + 0.05 }} />
            </g>
          ))}
        </svg>
      );
    case "ticket":
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          {[6, 18, 32, 22, 12, 6].map((v, i) => (
            <motion.rect key={i} x={i * 20 + 2} width="16" rx="1" className="fill-current" variants={{ rest: { y: 38, height: 2 }, hover: { y: 40 - v, height: v } }} transition={{ duration: 0.5, delay: i * 0.04 }} />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 40" className="h-10 w-full">
          {[
            [12, 28],
            [34, 12],
            [58, 26],
            [80, 10],
            [104, 22],
          ].map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} className="fill-current" variants={{ rest: { r: 2 }, hover: { r: 4.5 } }} transition={{ duration: 0.4, delay: i * 0.05 }} />
          ))}
          <motion.path d="M12 28 L34 12 L58 26 L80 10 L104 22" fill="none" strokeWidth="1" className="stroke-current opacity-50" variants={{ rest: { pathLength: 0 }, hover: { pathLength: 1 } }} transition={{ duration: 0.7 }} />
        </svg>
      );
  }
}

export function IntelligenceCards() {
  return (
    <section className="relative bg-mist py-24 sm:py-32" aria-label="The intelligence behind every market">
      <div className="grid-lines-light pointer-events-none absolute inset-0" aria-hidden />
      <Container className="relative">
        <SectionHeading
          index="01"
          eyebrow="Platform"
          title="The Intelligence Behind"
          accent="Every Market."
          lede="Six analytical lenses on the residential market — each built on the same consistent data model, so every view reconciles with every other."
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-xs bg-rule ring-1 ring-rule sm:grid-cols-2 lg:grid-cols-3">
          {intelligenceAreas.map((a, i) => {
            const Icon = ICONS[a.id as keyof typeof ICONS];
            return (
              <Reveal key={a.id} delay={i * 0.06} className="bg-white">
                <motion.div initial="rest" whileHover="hover" whileFocus="hover" animate="rest" className="group relative h-full">
                  <Link href={`/platform#${a.id}`} className="flex h-full flex-col p-8 outline-none focus-visible:bg-signal-100/40">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-ink-900 text-signal-200 transition-colors duration-300 group-hover:bg-signal-500 group-hover:text-white">
                        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.2em] text-muted">{a.code}</span>
                    </div>
                    <h3 className="mt-8 text-[20px] font-semibold tracking-tight text-ink-900">{a.title}</h3>
                    <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-subtle">{a.description}</p>
                    <div className="mt-8 text-signal-500/70 transition-colors group-hover:text-signal-500">
                      <Glyph id={a.id} />
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-900">
                      Explore module
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-signal-500 transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
                  </Link>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
