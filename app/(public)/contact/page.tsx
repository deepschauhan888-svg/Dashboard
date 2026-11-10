import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/lib/config/site";
import { Container, PageHero } from "@/components/layout/section";
import { EnquiryForm } from "@/components/forms/enquiry-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Request a platform demonstration, enquire about subscriptions or commission custom micromarket research from MB Research.",
};

const REASONS = [
  { title: "Platform demonstration", body: "A guided walkthrough of the platform on your markets of interest." },
  { title: "Subscriptions", body: "Access for your organisation, scoped to the cities and modules you need." },
  { title: "Custom micromarket research", body: "Commissioned analysis of a specific locality, format or question." },
  { title: "Institutional enquiries", body: "Research collaborations, data partnerships and media requests." },
];

export default function ContactPage() {
  const details = [
    { label: "Email", value: siteConfig.contact.email },
    { label: "Phone", value: siteConfig.contact.phone },
    { label: "Office", value: siteConfig.contact.address },
    { label: "Hours", value: siteConfig.contact.hours },
  ].filter((d): d is { label: string; value: string } => !!d.value);

  return (
    <>
      <PageHero kicker="Contact" title="Talk to MB Research." lede="Tell us what you are working on. One form covers every type of enquiry." />
      <section className="bg-paper py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-[640px] rounded-sm border border-line bg-white" />}>
              <EnquiryForm />
            </Suspense>
          </div>
          <aside className="lg:col-span-4" aria-label="How we can help">
            <h2 className="kicker text-ink-2">How we can help</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {REASONS.map((r) => (
                <li key={r.title} className="py-4">
                  <p className="text-[15px] font-medium">{r.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{r.body}</p>
                </li>
              ))}
            </ul>
            {details.length > 0 && (
              <dl className="mt-8 space-y-4">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt className="text-[12px] text-ink-2">{d.label}</dt>
                    <dd className="mt-0.5 text-[15px]">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </Container>
      </section>
    </>
  );
}
