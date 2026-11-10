import type { Metadata } from "next";
import { ArrowUpRight, Building, GraduationCap, Landmark, Users } from "lucide-react";
import { clientsConfig } from "@/lib/config/clients";
import { Container, PageHero, SectionHeading } from "@/components/layout/section";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Clients & Collaborations",
  description: "Organisations that work with MB Research — developers, financial institutions, research institutions and industry bodies.",
};

const MODELS = [
  { icon: Building, title: "Platform subscriptions", body: "Developers and investors access the intelligence platform for their markets of interest." },
  { icon: Users, title: "Custom research", body: "Commissioned studies for specific micromarkets, product formats or strategic questions." },
  { icon: GraduationCap, title: "Research collaborations", body: "Joint research with academic and policy institutions on housing-market questions." },
  { icon: Landmark, title: "Industry engagement", body: "Data and insight contributions to industry forums, associations and public bodies." },
];

export default function ClientsPage() {
  const approved = clientsConfig.entries.filter((e) => e.approved).length;
  return (
    <>
      <PageHero
        eyebrow="Clients & Collaborations"
        title="Built With"
        accent="the Industry."
        lede="MB Research works with organisations across the real estate ecosystem. This showcase displays approved relationships only; empty slots mark where approved logos will appear."
      />

      <section className="bg-white py-24" aria-label="Engagement models">
        <Container>
          <SectionHeading index="01" eyebrow="How we work together" title="Four Ways to" accent="Engage." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-xs bg-rule ring-1 ring-rule md:grid-cols-2 lg:grid-cols-4">
            {MODELS.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06} className="bg-white p-8">
                <m.icon className="h-5 w-5 text-signal-500" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-5 text-[17px] font-semibold text-ink-900">{m.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-subtle">{m.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24" aria-label="Organisations">
        <Container>
          <SectionHeading
            index="02"
            eyebrow="Organisations"
            title="Clients and"
            accent="Collaborators."
            lede={approved ? undefined : "No organisations have been approved for display yet. Logo slots below are placeholders and imply no relationship."}
          />
          <div className="mt-14">
            <ClientsGrid />
          </div>
        </Container>
      </section>

      <section className="bg-ink-900 py-20 text-white" aria-label="Become a partner">
        <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight sm:text-[34px]">
              Interested in a <span className="font-serif font-light italic text-signal-200">research collaboration?</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] text-white/60">Tell us about your organisation and the questions you are working on.</p>
          </div>
          <ButtonLink href="/contact?type=collaboration" size="lg">
            Start a conversation <ArrowUpRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
