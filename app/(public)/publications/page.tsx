import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHero } from "@/components/layout/section";
import { PublicationLibrary } from "@/components/publications/publication-library";

export const metadata: Metadata = {
  title: "Publications",
  description: "The MB Research publication library: PropIndex, housing and rental market research, micromarket reports, special reports and the Housing Sentiment Index.",
};

export default function PublicationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Publications"
        title="The Research"
        accent="Library."
        lede="Indices, market studies and special reports from MB Research. Entries currently shown are sample placeholders that demonstrate the library — they will be replaced with approved publications and links."
      />
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <Suspense fallback={<div className="h-96" />}>
            <PublicationLibrary />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
