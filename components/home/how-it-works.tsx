"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Database, FlaskConical, LayoutDashboard, Target } from "lucide-react";
import { Container, SectionHeading } from "@/components/layout/section";

const STEPS = [
  { icon: Database, title: "Market Data", body: "Demand, supply and pricing signals collected continuously across residential markets." },
  { icon: FlaskConical, title: "Research & Analysis", body: "Cleaned, validated and structured by MB Research analysts with consistent definitions." },
  { icon: LayoutDashboard, title: "Intelligence Platform", body: "Delivered as interactive dashboards with city, micromarket and configuration depth." },
  { icon: Target, title: "Better Decisions", body: "Positioning, product mix, pricing and launch timing grounded in evidence." },
];

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-ink-900 py-24 text-white sm:py-32" aria-label="How it works">
      <Container>
        <SectionHeading tone="dark" index="04" eyebrow="Process" title="From Signal" accent="to Strategy." lede="A disciplined pipeline that turns raw market activity into intelligence you can act on." />
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 md:block" aria-hidden>
            <motion.div
              className="h-px origin-left bg-gradient-to-r from-signal-500 via-signal-400 to-signal-200"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xs bg-ink-750 ring-1 ring-inset ring-signal-500/40">
                <s.icon className="h-5 w-5 text-signal-200" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-signal-400">STEP {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[20px] font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 max-w-[30ch] text-[14.5px] leading-relaxed text-white/55">{s.body}</p>
            </motion.li>
          ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
