import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Suspense } from "react";
import { siteConfig } from "@/lib/config/site";
import { Container, PageHero } from "@/components/layout/section";
import { EnquiryForm } from "@/components/forms/enquiry-form";

export const metadata: Metadata = {
  title: "Contact & Request a Demo",
  description: "Request a demonstration of MB Research Intelligence or discuss custom research requirements with MB Research.",
};

const CONTACT_ROWS = [
  { icon: Mail, label: "Email", value: siteConfig.contact.email },
  { icon: Phone, label: "Phone", value: siteConfig.contact.phone },
  { icon: MapPin, label: "Office", value: siteConfig.contact.address },
  { icon: Clock, label: "Hours", value: siteConfig.contact.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s Talk"
        accent="About Your Market."
        lede="Request a product demonstration, discuss a subscription, or brief us on custom research. A member of the MB Research team will respond."
      />
      <section className="bg-mist py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-[640px] rounded-xs border border-rule bg-white" />}>
              <EnquiryForm />
            </Suspense>
          </div>
          <aside className="space-y-6 lg:col-span-4" aria-label="Contact details">
            <div className="rounded-xs bg-ink-900 p-7 text-white">
              <h2 className="eyebrow text-signal-200">MB Research</h2>
              <ul className="mt-6 space-y-5">
                {CONTACT_ROWS.map((r) => (
                  <li key={r.label} className="flex gap-4">
                    <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" aria-hidden />
                    <div>
                      <p className="text-[12px] text-white/45">{r.label}</p>
                      <p className={r.value ? "mt-0.5 text-[14.5px]" : "mt-0.5 text-[13.5px] text-white/35"}>{r.value ?? "To be configured"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xs border border-rule bg-white p-7">
              <h2 className="text-[15px] font-semibold text-ink-900">What happens next</h2>
              <ol className="mt-4 space-y-4 text-[14px] text-subtle">
                {["We review your requirement and markets of interest.", "A research specialist schedules a walkthrough.", "You receive a tailored demonstration or proposal."].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="font-mono text-[11px] text-signal-600">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
