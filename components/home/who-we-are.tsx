import { ArrowRight, BookOpen, Activity, Handshake, Landmark, Radar, Scale } from "lucide-react";
import { aboutConfig } from "@/lib/config/about";
import { siteConfig } from "@/lib/config/site";
import { Container, SectionHeading } from "@/components/layout/section";
import { ImageSlot } from "@/components/media/image-slot";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const ICONS = [Radar, Activity, Landmark, Scale, BookOpen, Handshake];

export function WhoWeAre() {
  return (
    <section className="bg-mist py-24 sm:py-32" aria-label="Who we are">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="05" eyebrow="Who we are" title="The Research Behind" accent="the Intelligence." />
            <Reveal delay={0.1}>
              <p className="mt-6 text-[16.5px] leading-relaxed text-subtle">{aboutConfig.intro}</p>
              <blockquote className="mt-8 border-l-2 border-signal-500 pl-5 font-serif text-[21px] italic leading-snug text-ink-900">{aboutConfig.mission}</blockquote>
              <ButtonLink href="/about" variant="outline" className="mt-10">
                About MB Research <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <div className="grid grid-cols-5 gap-3">
                <ImageSlot src={siteConfig.imagery.aboutResearch} alt="MB Research analysts at work" label="Research team" variant="research" className="col-span-3 aspect-[4/3]" />
                <ImageSlot src={siteConfig.imagery.aboutTeam} alt="City skyline" label="City photography" variant="city" className="col-span-2 aspect-[3/4.5]" />
              </div>
            </Reveal>
            <div className="mt-10 grid gap-px overflow-hidden rounded-xs bg-rule ring-1 ring-rule sm:grid-cols-2 lg:grid-cols-3">
              {aboutConfig.capabilities.map((c, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <Reveal key={c.title} delay={i * 0.05} className="bg-white p-6">
                    <Icon className="h-5 w-5 text-signal-500" strokeWidth={1.5} aria-hidden />
                    <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{c.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-subtle">{c.body}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
