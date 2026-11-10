import { AnalyticsPreview } from "@/components/home/analytics-preview";
import { CoverageMap } from "@/components/home/coverage-map";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { CapabilityOverview, Introduction } from "@/components/home/introduction";

/**
 * Home: A hero · B introduction · C capability overview · D analytics preview
 * · E coverage preview · F one call to action. Nothing else — every other
 * subject lives on its own page.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Introduction />
      <CapabilityOverview />
      <AnalyticsPreview />
      <CoverageMap />
      <FinalCta />
    </>
  );
}
