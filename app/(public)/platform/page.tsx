import type { Metadata } from "next";
import { Container, PageHero } from "@/components/layout/section";
import { ModuleShowcase } from "@/components/platform/module-showcase";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Platform",
  description: "Ten analytical modules covering residential demand, supply, price, configuration, ticket size, property size, cities, micromarkets, history and market comparison.",
};

export default function PlatformPage() {
  return (
    <>
      <PageHero
        kicker="Platform"
        title="Ten analytical modules. One consistent view of the market."
        lede="Every module draws on the same data model and the same definitions, so a figure in one view always reconciles with the figure in another."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/contact?type=demonstration" size="lg" variant="primary">
            Request a Demo
          </ButtonLink>
          <ButtonLink href="/login" size="lg">
            Open the demo workspace
          </ButtonLink>
        </div>
      </PageHero>
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <ModuleShowcase />
        </Container>
      </section>
    </>
  );
}
