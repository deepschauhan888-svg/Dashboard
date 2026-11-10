import type { Metadata } from "next";
import { ArrowRight, Lock } from "lucide-react";
import { Container, PageHero } from "@/components/layout/section";
import { FinalCta } from "@/components/home/final-cta";
import { ModuleShowcase } from "@/components/platform/module-showcase";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Platform & Capabilities",
  description: "Ten analytical modules covering residential demand, supply, prices, configurations, ticket sizes, unit sizes, cities, micromarkets, history and comparison.",
};

const PILLARS = [
  { k: "10", v: "Analytical modules" },
  { k: "5", v: "Global filters on every view" },
  { k: "1", v: "Consistent data model" },
  { k: "8", v: "Analyst workspaces" },
];

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="One Platform."
        accent="Every Market Signal."
        lede="MB Research Intelligence brings demand, supply and pricing into a single analytical workspace — with the depth to go from national trends to a single micromarket in three clicks."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/login" size="lg">
            <Lock className="h-4 w-4" aria-hidden /> Enter demo workspace
          </ButtonLink>
          <ButtonLink href="/contact?type=demonstration" size="lg" variant="secondary">
            Request a guided demo <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xs bg-white/10 ring-1 ring-white/10 md:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.v} className="bg-ink-900 px-6 py-5">
              <dt className="sr-only">{p.v}</dt>
              <dd className="font-mono text-[30px] text-white">{p.k}</dd>
              <dd className="mt-1 text-[13px] text-white/50">{p.v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>
      <section className="bg-white py-24 sm:py-28">
        <Container>
          <ModuleShowcase />
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
