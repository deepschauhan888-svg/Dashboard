import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, FileDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublication, PUBLICATION_CATEGORIES, visiblePublications } from "@/lib/config/publications";
import { Container } from "@/components/layout/section";
import { PublicationCard, formatPubDate } from "@/components/publications/publication-card";
import { PublicationCover } from "@/components/publications/publication-cover";
import { SampleBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() {
  return visiblePublications().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pub = getPublication(slug);
  return pub ? { title: pub.title, description: pub.summary } : { title: "Publication not found" };
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = getPublication(slug);
  if (!pub) notFound();

  const all = visiblePublications();
  const categoryInfo = PUBLICATION_CATEGORIES.find((c) => c.id === pub.category);
  const related = all.filter((p) => p.slug !== pub.slug && p.category === pub.category).slice(0, 3);

  return (
    <>
      <section className="border-b border-line bg-white pb-16 pt-32">
        <Container>
          <Link href="/publications" className="inline-flex items-center gap-2 text-[13.5px] text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All publications
          </Link>
          <div className="mt-10 grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="kicker text-brand">{pub.category}</span>
                {pub.isPlaceholder && <SampleBadge />}
              </div>
              <h1 className="display mt-5 text-[40px] leading-[1.08] sm:text-[52px]">{pub.title}</h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink-2">{pub.summary}</p>
              <p className="mt-6 text-[13.5px] text-ink-2">
                Published <time dateTime={pub.date} className="font-medium text-ink">{formatPubDate(pub.date)}</time>
              </p>

              <h2 className="kicker mt-14 text-ink">What this publication covers</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {pub.scope.map((s) => (
                  <li key={s} className="flex items-center gap-4 py-4 text-[16px]">
                    <span className="h-px w-4 bg-brand" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              {categoryInfo && <p className="mt-8 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">{categoryInfo.description}</p>}
            </div>
            <aside className="lg:col-span-4" aria-label="Access">
              <PublicationCover pub={pub} size="lg" className="mx-auto max-w-[300px]" />
              <div className="mt-8 flex flex-col gap-3">
                {pub.pdfUrl && (
                  <ButtonLink href={pub.pdfUrl} external variant="primary">
                    <FileDown className="h-4 w-4" aria-hidden /> Download PDF
                  </ButtonLink>
                )}
                {pub.externalUrl && (
                  <ButtonLink href={pub.externalUrl} external>
                    <ExternalLink className="h-4 w-4" aria-hidden /> View original publication
                  </ButtonLink>
                )}
                <ButtonLink href={`/contact?type=custom&topic=${encodeURIComponent(pub.title)}`}>Discuss this research</ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-20" aria-label="More in this category">
          <Container>
            <h2 className="display text-[28px]">More in {pub.category}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PublicationCard key={p.slug} pub={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
