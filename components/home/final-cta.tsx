import { homeContent } from "@/lib/config/home";
import { Container } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/** The single commercial call to action on the home page. */
export function FinalCta() {
  return (
    <section className="border-t border-line bg-white py-28 sm:py-32" aria-label="Request a demonstration">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-[2px] w-12 bg-brand" aria-hidden />
          <h2 className="display mt-8 text-[38px] leading-[1.1] sm:text-[52px]">{homeContent.cta.title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2">{homeContent.cta.body}</p>
          <div className="mt-10">
            <ButtonLink href="/contact?type=demonstration" size="lg" variant="primary">
              Request a demonstration
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
