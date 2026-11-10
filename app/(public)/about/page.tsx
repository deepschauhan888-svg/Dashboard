import type { Metadata } from "next";
import { aboutConfig } from "@/lib/config/about";
import { siteConfig } from "@/lib/config/site";
import { Container, PageHero, SectionHeading } from "@/components/layout/section";
import { ImageSlot } from "@/components/media/image-slot";
import { TextLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About MB Research",
  description: "MB Research is the research and analytics division of Magicbricks, studying India's residential real estate markets.",
};

export default function AboutPage() {
  const facts = aboutConfig.facts.filter((f) => f.value);
  return (
    <>
      <PageHero kicker="About MB Research" title="Research behind the intelligence." lede={aboutConfig.intro} />

      {facts.length > 0 && (
        <section className="border-b border-line bg-white" aria-label="At a glance">
          <Container>
            <dl className="grid grid-cols-2 md:grid-cols-4">
              {facts.map((f, i) => (
                <div key={f.label} className={i > 0 ? "border-l border-line px-6 py-10" : "py-10 pr-6"}>
                  <dd className="display text-[40px]">{f.value}</dd>
                  <dt className="mt-1 text-[14px] text-ink-2">{f.label}</dt>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* Philosophy */}
      <section className="bg-white py-24 sm:py-28" aria-label="Research philosophy">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="kicker text-brand">Research philosophy</p>
            <p className="display mt-5 text-[32px] leading-[1.22] sm:text-[38px]">{aboutConfig.philosophy.statement}</p>
          </Reveal>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-6 lg:pt-10">
            {aboutConfig.philosophy.principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05} className="border-t border-ink pt-4">
                <h3 className="text-[16px] font-semibold">{p.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Methodology */}
      <section className="bg-paper py-24 sm:py-28" aria-label="Research methodology">
        <Container>
          <SectionHeading kicker="Methodology" title="Five stages, applied to every indicator." lede="A number means the same thing wherever it appears because every number travels the same path." />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-5">
            {aboutConfig.methodology.map((m, i) => (
              <li key={m.step} className="bg-white">
                <Reveal delay={i * 0.05} className="flex h-full flex-col p-6">
                  <span className="text-[13px] font-medium tabular text-brand">0{i + 1}</span>
                  <h3 className="display mt-4 text-[24px]">{m.step}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{m.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Capabilities + expertise */}
      <section className="bg-white py-24 sm:py-28" aria-label="Capabilities and expertise">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading kicker="Analytical capabilities" title="What the research team does." />
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {aboutConfig.capabilities.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.05}>
                  <h3 className="text-[16px] font-semibold">{c.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{c.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <p className="kicker text-brand">Research expertise</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {aboutConfig.expertise.map((e) => (
                <li key={e} className="py-3.5 text-[15.5px]">
                  {e}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* Institutional background */}
      <section className="border-t border-line bg-white py-24 sm:py-28" aria-label="Institutional background">
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <ImageSlot src={siteConfig.imagery.about} alt="MB Research" variant="facade" className="aspect-[4/3]" />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
            <p className="kicker text-brand">Institutional background</p>
            <p className="display mt-5 text-[26px] leading-snug">{aboutConfig.background}</p>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-2">MB Research also works with institutions and industry partners on research collaborations.</p>
            <div className="mt-6 flex flex-wrap gap-6">
              <TextLink href="/clients">Clients & Collaborations</TextLink>
              <TextLink href="/publications">Publications</TextLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
