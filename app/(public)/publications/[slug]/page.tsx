import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, FileDown, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublication, PUBLICATION_CATEGORIES, publications } from "@/lib/config/publications";
import { Container } from "@/components/layout/section";
import { PublicationCard, formatPubDate } from "@/components/publications/publication-card";
import { PublicationCover } from "@/components/publications/publication-cover";
import { PlaceholderBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pub = getPublication(slug);
  if (!pub) return { title: "Publication not found" };
  return { title: pub.title, description: pub.summary };
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = getPublication(slug);
  if (!pub) notFound();

  const categoryInfo = PUBLICATION_CATEGORIES.find((c) => c.id === pub.category);
  const related = publications.filter((p) => p.slug !== pub.slug && p.category === pub.category).slice(0, 3);
  const more = related.length ? related : publications.filter((p) => p.slug !== pub.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-900 pb-20 pt-36 text-white">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <Container className="relative">
          <Link href="/publications" className="inline-flex items-center gap-2 text-[13px] text-white/55 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All publications
          </Link>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow text-signal-200">{pub.category}</span>
                {pub.isPlaceholder && <PlaceholderBadge className="text-white/70" />}
              </div>
              <h1 className="mt-5 text-[38px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[52px]">{pub.title}</h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60">{pub.summary}</p>
              <p className="mt-6 font-mono text-[12px] tracking-[0.12em] text-white/45">
                PUBLISHED <time dateTime={pub.date}>{formatPubDate(pub.date).toUpperCase()}</time>
                {pub.isPlaceholder && " · SAMPLE DATE"}
              </p>
            </div>
            <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
              <PublicationCover pub={pub} size="lg" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-14 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <h2 className="eyebrow text-subtle">Scope of this publication</h2>
            <ul className="mt-5 divide-y divide-rule border-y border-rule">
              {pub.scope.map((s, i) => (
                <li key={s} className="flex items-center gap-5 py-4 text-[16px] text-ink-900">
                  <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ul>
            {categoryInfo && (
              <div className="mt-10">
                <h2 className="eyebrow text-subtle">About {pub.category}</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-text">{categoryInfo.description}</p>
              </div>
            )}
            {pub.isPlaceholder && (
              <div className="mt-10 flex gap-3 rounded-xs bg-mist p-5 text-[14px] text-subtle">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-signal-500" aria-hidden />
                <p>
                  This is a sample entry demonstrating the publication detail layout. It does not describe a released report. Replace it in <code className="font-mono text-[12.5px] text-ink-900">lib/config/publications.ts</code> with the approved title, summary and original publication link.
                </p>
              </div>
            )}
          </article>

          <aside className="lg:col-span-4" aria-label="Access">
            <div className="rounded-xs border border-rule p-6">
              <h2 className="text-[15px] font-semibold text-ink-900">Access this publication</h2>
              <div className="mt-5 flex flex-col gap-3">
                {pub.pdfUrl ? (
                  <ButtonLink href={pub.pdfUrl} external>
                    <FileDown className="h-4 w-4" aria-hidden /> Download PDF
                  </ButtonLink>
                ) : null}
                {pub.externalUrl ? (
                  <ButtonLink href={pub.externalUrl} external variant="outline">
                    <ExternalLink className="h-4 w-4" aria-hidden /> View original publication
                  </ButtonLink>
                ) : null}
                {!pub.pdfUrl && !pub.externalUrl && (
                  <p className="rounded-xs border border-dashed border-rule p-4 text-[13.5px] text-subtle">
                    Original publication link and PDF are not yet configured for this entry.
                  </p>
                )}
                <ButtonLink href={`/contact?type=custom&topic=${encodeURIComponent(pub.title)}`} variant="outline">
                  Discuss this research
                </ButtonLink>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-t border-rule bg-mist py-20" aria-label="Related publications">
        <Container>
          <h2 className="text-[24px] font-semibold tracking-tight text-ink-900">Related publications</h2>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PublicationCard key={p.slug} pub={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
