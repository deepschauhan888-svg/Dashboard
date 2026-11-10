import { ArrowUpRight, Mail } from "lucide-react";
import { Container } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-28 text-white sm:py-36" aria-label="Get started">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-500/12 blur-[140px]" aria-hidden />
      <Container>
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="eyebrow text-signal-200">Next step</span>
          <h2 className="mt-6 text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
            Your Next Real Estate Decision Deserves <span className="font-serif font-light italic text-signal-200">Better Intelligence.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60">
            Explore the power of market intelligence and discover what the data can reveal about your next opportunity.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact?type=demonstration" size="lg">
              Request a Demo <ArrowUpRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              <Mail className="h-4 w-4" aria-hidden /> Contact MB Research
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
