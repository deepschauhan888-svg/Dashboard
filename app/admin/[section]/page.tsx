import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/admin-section";
import { ADMIN_SECTIONS, type AdminSectionSlug } from "@/lib/config/admin-sections";

export function generateStaticParams() {
  return Object.keys(ADMIN_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: ADMIN_SECTIONS[section as AdminSectionSlug] ?? "Admin" };
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in ADMIN_SECTIONS)) notFound();
  return <AdminSection slug={section as AdminSectionSlug} />;
}
