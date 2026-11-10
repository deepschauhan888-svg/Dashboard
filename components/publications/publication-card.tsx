import Link from "next/link";
import type { Publication } from "@/lib/config/publications";
import { SampleBadge } from "@/components/ui/badge";
import { PublicationCover } from "./publication-cover";

export function formatPubDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <Link href={`/publications/${pub.slug}`} className="group flex flex-col outline-none">
      <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
        <PublicationCover pub={pub} />
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-brand">{pub.category}</span>
        {pub.isPlaceholder && <SampleBadge />}
      </div>
      <h3 className="mt-2 font-serif text-[20px] leading-snug text-ink group-hover:text-brand">{pub.title}</h3>
      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{pub.summary}</p>
      <time dateTime={pub.date} className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-2">
        {formatPubDate(pub.date)}
      </time>
    </Link>
  );
}
