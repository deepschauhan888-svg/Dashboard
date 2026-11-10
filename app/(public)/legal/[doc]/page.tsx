import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageHero } from "@/components/layout/section";

const DOCS = {
  disclaimer: {
    title: "Data Disclaimer",
    body: [
      "Figures shown in the platform preview, on the website and in the demonstration workspace are synthetic demonstration data generated for presentation purposes. They are not Magicbricks or MB Research market statistics and must not be relied upon for any decision.",
      "City and locality names are used for realism only. Markets shown on the coverage map are illustrative unless marked as live.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "In the current version of this website, enquiry forms are validated in your browser and are not transmitted to or stored on any server.",
      "Demonstration access stores a session marker in your browser's storage so that the workspace stays open between pages. Signing out removes it.",
      "No analytics, advertising or tracking cookies are set by this website.",
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
      <PageHero kicker="Legal" title={d.title} />
      <section className="bg-white py-16">
        <Container>
          <div className="max-w-3xl space-y-5 text-[16.5px] leading-relaxed">
            {d.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
