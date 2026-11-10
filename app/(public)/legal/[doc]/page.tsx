import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageHero } from "@/components/layout/section";

const DOCS = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "This page is a placeholder for the MB Research Intelligence privacy policy, to be supplied and approved by Magicbricks' legal team before launch.",
      "In the current showcase build, enquiry forms are validated in the browser only and no personal data is transmitted to, or stored on, any server. Demo access stores a session flag in your browser's local storage, which you can clear at any time by signing out.",
    ],
  },
  terms: {
    title: "Terms of Use",
    body: [
      "This page is a placeholder for the platform's terms of use, including subscription terms, permitted use of data and intellectual property provisions, to be supplied and approved by Magicbricks' legal team.",
    ],
  },
  disclaimer: {
    title: "Data Disclaimer",
    body: [
      "All figures shown in this showcase — on the website and in the demo workspace — are synthetic demonstration data generated for presentation purposes. They are not Magicbricks or MB Research market statistics and must not be relied upon for any decision.",
      "City and locality names are used for realism only. Coverage shown on maps is illustrative unless explicitly marked as live.",
    ],
  },
} as const;

type DocKey = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return { title: doc in DOCS ? DOCS[doc as DocKey].title : "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!(doc in DOCS)) notFound();
  const d = DOCS[doc as DocKey];
  return (
    <>
      <PageHero eyebrow="Legal" title={d.title} />
      <section className="bg-white py-20">
        <Container>
          <div className="max-w-3xl space-y-5 text-[16px] leading-relaxed text-text">
            {d.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
