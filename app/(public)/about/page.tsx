import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { aboutConfig } from "@/lib/config/about";
import { siteConfig } from "@/lib/config/site";
import { Container, PageHero, SectionHeading } from "@/components/layout/section";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { PublicationsPreview } from "@/components/home/publications-preview";
import { ImageSlot } from "@/components/media/image-slot";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About MB Research",
  description: "MB Research is the research and analytics division of Magicbricks, studying India's residential real estate markets.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About MB Research" title="Research Is the Product." accent="Intelligence Is the Outcome." lede={aboutConfig.intro} />

      {/* Facts */}
      <section className="border-b border-rule bg-white" aria-label="MB Research at a glance">
        <Container>
          <dl className="grid grid-cols-2 divide-rule md:grid-cols-4 md:divide-x">
            {aboutConfig.facts.map((f) => (
              <div key={f.label} className="px-2 py-10 md:px-8">
                <dd className={f.value ? "font-mono text-[36px] text-ink-900" : "font-mono text-[28px] text-muted"}>{f.value ?? "TBC"}</dd>
                <dt className="mt-2 text-[13.5px] text-subtle">{f.label}</dt>
              </div>
            ))}
          </dl>
          {aboutConfig.facts.some((f) => !f.value) && (
            <p className="pb-6 text-[12px] text-muted">Figures marked TBC are configurable and will be published once approved.</p>
          )}
        </Container>
      </section>

      {/* Mission + imagery */}
      <section className="bg-white py-24 sm:py-28" aria-label="Mission">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-signal-600">Our mission</p>
            <p className="mt-6 font-serif text-[30px] font-light leading-[1.25] tracking-[-0.01em] text-ink-900 sm:text-[38px]">{aboutConfig.mission}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ImageSlot src={siteConfig.imagery.aboutResearch} alt="MB Research" label="Research imagery" variant="data" className="aspect-[16/11]" />
          </Reveal>
        </Container>
      </section>

      {/* Capabilities */}
      <section className="bg-mist py-24 sm:py-28" aria-label="Capabilities">
        <Container>
          <SectionHeading index="01" eyebrow="Capabilities" title="Research and" accent="Analytical Capabilities." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-xs bg-rule ring-1 ring-rule md:grid-cols-2 lg:grid-cols-3">
            {aboutConfig.capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05} className="bg-white p-8">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[19px] font-semibold tracking-tight text-ink-900">{c.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-subtle">{c.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Methodology */}
      <section className="bg-ink-900 py-24 text-white sm:py-28" aria-label="Methodology">
        <Container>
          <SectionHeading tone="dark" index="02" eyebrow="Methodology" title="A Repeatable" accent="Research Method." lede="Every indicator on the platform passes through the same five stages, so a number means the same thing wherever it appears." />
          <ol className="mt-16 grid gap-px overflow-hidden rounded-xs bg-white/10 ring-1 ring-white/10 md:grid-cols-5">
            {aboutConfig.methodology.map((m, i) => (
              <li key={m.step} className="bg-ink-900">
                <Reveal delay={i * 0.08} className="flex h-full flex-col p-6">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-signal-400">STAGE {i + 1}</span>
                  <h3 className="mt-4 text-[20px] font-semibold">{m.step}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/55">{m.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Data-driven approach */}
      <section className="bg-white py-24 sm:py-28" aria-label="Data-driven approach">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow="Approach" title="Data-Driven," accent="by Design." lede="The principles that govern how MB Research builds and presents market intelligence." />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            {aboutConfig.principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06} className="border-t-2 border-ink-900 pt-5">
                <h3 className="text-[18px] font-semibold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-subtle">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <PublicationsPreview />

      <section className="bg-mist py-24 sm:py-28" aria-label="Institutional collaborations">
        <Container>
          <SectionHeading
            index="04"
            eyebrow="Collaborations"
            title="Institutional"
            accent="Collaborations."
            aside={
              <ButtonLink href="/clients" variant="outline">
                View all <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            }
          />
          <div className="mt-12">
            <ClientsGrid categories={["Academic & Research", "Industry Bodies"]} />
          </div>
        </Container>
      </section>
    </>
  );
}
