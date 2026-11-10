import type { Metadata } from "next";
import { clientsConfig } from "@/lib/config/clients";
import { siteConfig } from "@/lib/config/site";
import { Container, PageHero } from "@/components/layout/section";
import { LogoWall } from "@/components/clients/clients-grid";
import { SampleBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Clients & Collaborations",
  description: "Organisations that work with MB Research: clients using its market intelligence, and research and institutional collaborators.",
};

function Subsection({ id, letter, group, cta }: { id: string; letter: string; group: (typeof clientsConfig)["clients"]; cta: { label: string; href: string } }) {
  const showingSamples = group.entries.length === 0 && siteConfig.showSampleContent;
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-20 first:border-t-0" aria-labelledby={`${id}-title`}>
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="text-[13px] font-medium text-brand">{letter}</p>
          <h2 id={`${id}-title`} className="display mt-3 text-[32px] leading-tight">
            {group.title}
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{group.intro}</p>
          <ul className="mt-6 space-y-2">
            {group.segments.map((s) => (
              <li key={s} className="flex items-center gap-3 text-[14.5px]">
                <span className="h-px w-3 bg-brand" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-8">
          {showingSamples && (
            <div className="mb-3 flex items-center gap-3 text-[12.5px] text-ink-2">
              <SampleBadge /> Layout preview — approved names and logos will replace these slots.
            </div>
          )}
          <LogoWall entries={group.entries} sampleSlots={group.sampleSlots} />
        </Reveal>
      </div>
    </section>
  );
}

export default function ClientsPage() {
  return (
    <>
      <PageHero kicker="Clients & Collaborations" title="Who we work with." lede="MB Research serves organisations across the real estate ecosystem and collaborates with institutions on housing research. Only approved relationships are shown." />
      <div className="bg-white">
        <Container>
          <Subsection id="clients" letter="A" group={clientsConfig.clients} cta={{ label: "Become a client", href: "/contact?type=subscription" }} />
          <Subsection id="collaborations" letter="B" group={clientsConfig.collaborations} cta={{ label: "Propose a collaboration", href: "/contact?type=institutional" }} />
        </Container>
      </div>
    </>
  );
}
