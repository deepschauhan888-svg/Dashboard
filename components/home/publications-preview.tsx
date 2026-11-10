import { ArrowRight } from "lucide-react";
import { sortedPublications } from "@/lib/config/publications";
import { Container, SectionHeading } from "@/components/layout/section";
import { PublicationCard } from "@/components/publications/publication-card";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function PublicationsPreview() {
  const items = sortedPublications().slice(0, 4);
  return (
    <section className="bg-white py-24 sm:py-32" aria-label="Publications">
      <Container>
        <SectionHeading
          index="06"
          eyebrow="Publications"
          title="Research That"
          accent="Shapes the Conversation."
          lede="Indices, market studies and special reports from MB Research. The entries shown are sample placeholders pending approved publications."
          aside={
            <ButtonLink href="/publications" variant="outline">
              View the library <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.07}>
              <PublicationCard pub={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
