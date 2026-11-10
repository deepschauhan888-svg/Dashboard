import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/layout/section";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { CoverageMap } from "@/components/home/coverage-map";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { IntelligenceCards } from "@/components/home/intelligence-cards";
import { MarketsDecoded } from "@/components/home/markets-decoded";
import { PublicationsPreview } from "@/components/home/publications-preview";
import { WhoWeAre } from "@/components/home/who-we-are";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntelligenceCards />
      <MarketsDecoded />
      <CoverageMap />
      <HowItWorks />
      <WhoWeAre />
      <PublicationsPreview />
      <section className="bg-mist py-24 sm:py-32" aria-label="Clients and collaborations">
        <Container>
          <SectionHeading
            index="07"
            eyebrow="Clients & Collaborations"
            title="Built for"
            accent="the Ecosystem."
            lede="Developers, institutions and research partners. Organisations appear here only once relationships and logo usage are approved."
            aside={
              <ButtonLink href="/clients" variant="outline">
                All collaborations <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            }
          />
          <div className="mt-14">
            <ClientsGrid categories={["Real Estate Developers", "Financial Institutions"]} />
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
