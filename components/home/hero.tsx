"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/lib/config/site";
import { ButtonLink } from "@/components/ui/button";
import { ImageSlot } from "@/components/media/image-slot";

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <section className="bg-white pt-[72px]">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <motion.p {...fade(0.05)} className="kicker text-brand">
            MB Research · {siteConfig.parentBrand}
          </motion.p>
          <motion.h1 {...fade(0.12)} className="display mt-6 text-[46px] leading-[1.04] sm:text-[62px] lg:text-[70px]">
            Real Estate Intelligence.
            <span className="block text-brand">Beyond the Obvious.</span>
          </motion.h1>
          <motion.p {...fade(0.22)} className="mt-8 max-w-[34rem] text-[18px] leading-relaxed text-ink-2">
            Transforming real estate market data into meaningful intelligence through comprehensive analysis of demand, supply, pricing and market dynamics.
          </motion.p>
          <motion.div {...fade(0.3)} className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/platform" size="lg" variant="primary">
              Explore the Platform
            </ButtonLink>
            <ButtonLink href="/contact?type=demonstration" size="lg">
              Request a Demo
            </ButtonLink>
          </motion.div>
        </div>
        <motion.div {...fade(0.18)} className="lg:col-span-6">
          <ImageSlot src={siteConfig.imagery.hero} alt="Residential towers in an Indian city" priority className="aspect-[4/3] w-full shadow-[var(--shadow-soft)]" variant="skyline" />
        </motion.div>
      </div>
    </section>
  );
}
