import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHero } from "@/components/layout/section";
import { PublicationLibrary } from "@/components/publications/publication-library";

export const metadata: Metadata = {
  title: "Publications",
  description: "The MB Research library: PropIndex, housing and rental market reports, micromarket reports, the Housing Sentiment Index and special research reports.",
};

export default function PublicationsPage() {
  return (
    <>
      <PageHero kicker="Publications" title="The research library." lede="Indices, market reports and special studies from MB Research — searchable by title, topic and category." />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <Suspense fallback={<div className="h-96" />}>
            <PublicationLibrary />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
