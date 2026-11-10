import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ANALYST_MODULE_SLUGS, analystNav, type AnalystModuleSlug } from "@/lib/config/workspace-nav";
import { AnalystModule } from "@/components/analyst/analyst-module";

export function generateStaticParams() {
  return ANALYST_MODULE_SLUGS.map((module) => ({ module }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module } = await params;
  const item = analystNav.find((n) => n.href.endsWith(`/${module}`));
  return { title: item?.label ?? "Analyst workspace" };
}

export default async function AnalystPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!(ANALYST_MODULE_SLUGS as readonly string[]).includes(module)) notFound();
  return <AnalystModule slug={module as AnalystModuleSlug} />;
}
