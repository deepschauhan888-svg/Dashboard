import { homeContent } from "@/lib/config/home";
import { Container } from "@/components/layout/section";
import { TextLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function Introduction() {
  return (
    <section className="border-t border-line bg-white py-24 sm:py-28" aria-label="Introduction">
      <Container className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="kicker text-brand">MB Research Intelligence</p>
          <p className="display mt-5 text-[30px] leading-[1.25] sm:text-[38px]">{homeContent.intro.statement}</p>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:pt-12">
          <p className="text-[16.5px] leading-relaxed text-ink-2">{homeContent.intro.body}</p>
          <div className="mt-6">
            <TextLink href="/about">About MB Research</TextLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function CapabilityOverview() {
  return (
    <section className="bg-paper py-24 sm:py-28" aria-label="What the platform answers">
      <Container>
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="kicker text-brand">The platform</p>
            <h2 className="display mt-4 max-w-2xl text-[34px] leading-[1.12] sm:text-[42px]">Four questions every development decision depends on.</h2>
          </div>
          <TextLink href="/platform">See all ten analytical modules</TextLink>
        </Reveal>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {homeContent.pillars.map((p, i) => (
            <li key={p.n} className="bg-white">
              <Reveal delay={i * 0.05} className="flex h-full flex-col p-8">
                <span className="text-[13px] font-medium text-brand">{p.n}</span>
                <h3 className="display mt-6 text-[23px] leading-snug">{p.question}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{p.answer}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
