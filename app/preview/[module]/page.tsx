import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ANALYST_MODULE_SLUGS, isAnalystSlug, viewBySlug } from "@/lib/config/workspace-nav";
import { AnalystModule } from "@/components/analyst/analyst-module";

export function generateStaticParams() {
  return ANALYST_MODULE_SLUGS.map((slug) => ({ module: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: slug } = await params;
  return { title: isAnalystSlug(slug) ? viewBySlug(slug).label : "Platform Preview" };
}

export default async function PreviewModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  if (!isAnalystSlug(slug)) notFound();
  return <AnalystModule slug={slug} />;
}
