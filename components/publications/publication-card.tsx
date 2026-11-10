import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Publication } from "@/lib/config/publications";
import { PlaceholderBadge } from "@/components/ui/badge";
import { PublicationCover } from "./publication-cover";

export function formatPubDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <Link href={`/publications/${pub.slug}`} className="group flex flex-col outline-none">
      <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
        <PublicationCover pub={pub} />
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <span className="eyebrow text-signal-600">{pub.category}</span>
        {pub.isPlaceholder && <PlaceholderBadge className="text-subtle" />}
      </div>
      <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight text-ink-900 group-hover:text-signal-600">{pub.title}</h3>
      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-subtle">{pub.summary}</p>
      <div className="mt-4 flex items-center justify-between border-t border-rule pt-3 text-[12.5px] text-muted">
        <time dateTime={pub.date}>{formatPubDate(pub.date)}</time>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-600" aria-hidden />
      </div>
    </Link>
  );
}
