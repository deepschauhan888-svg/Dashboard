"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PUBLICATION_CATEGORIES, publications, type PublicationCategory } from "@/lib/config/publications";
import { cn } from "@/lib/utils/cn";
import { Select } from "@/components/ui/form-controls";
import { PublicationCard } from "./publication-card";

type Sort = "newest" | "oldest" | "title";

export function PublicationLibrary() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCat = params.get("category");
  const [category, setCategory] = useState<PublicationCategory | "all">(
    PUBLICATION_CATEGORIES.some((c) => c.id === initialCat) ? (initialCat as PublicationCategory) : "all",
  );
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");

  const years = useMemo(() => [...new Set(publications.map((p) => p.date.slice(0, 4)))].sort().reverse(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => year === "all" || p.date.startsWith(year))
      .filter((p) => !q || [p.title, p.summary, p.category, ...p.scope].some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  }, [category, query, year, sort]);

  function pickCategory(c: PublicationCategory | "all") {
    setCategory(c);
    const sp = new URLSearchParams(params.toString());
    if (c === "all") sp.delete("category");
    else sp.set("category", c);
    router.replace(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  }

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    publications.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <aside className="lg:col-span-3" aria-label="Filters">
        <div className="lg:sticky lg:top-28">
          <label htmlFor="pub-search" className="eyebrow text-subtle">
            Search
          </label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="pub-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, topic or scope…"
              className="h-11 w-full rounded-sm bg-white pl-9 pr-9 text-sm text-text outline-none ring-1 ring-inset ring-rule placeholder:text-muted focus:ring-signal-500"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xs p-1 text-muted hover:text-text">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="eyebrow mt-8 text-subtle" id="cat-label">
            Category
          </p>
          <ul className="mt-3 space-y-0.5" role="listbox" aria-labelledby="cat-label">
            {[{ id: "all" as const, n: publications.length, label: "All publications" }, ...PUBLICATION_CATEGORIES.map((c) => ({ id: c.id, n: counts.get(c.id) ?? 0, label: c.id }))].map((c) => (
              <li key={c.id} role="option" aria-selected={category === c.id}>
                <button
                  type="button"
                  onClick={() => pickCategory(c.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xs px-3 py-2 text-left text-[14px] transition-colors",
                    category === c.id ? "bg-ink-900 text-white" : "text-text hover:bg-mist",
                  )}
                >
                  {c.label}
                  <span className={cn("font-mono text-[11px]", category === c.id ? "text-white/60" : "text-muted")}>{c.n}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Select skin="light" label="Year" value={year} onChange={(e) => setYear(e.target.value)} options={[{ value: "all", label: "All years" }, ...years.map((y) => ({ value: y, label: y }))]} />
            <Select
              skin="light"
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              options={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "title", label: "Title A–Z" },
              ]}
            />
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9">
        <div className="flex items-baseline justify-between border-b border-rule pb-4">
          <p className="text-[14px] text-subtle" aria-live="polite">
            <span className="font-mono text-ink-900">{results.length}</span> {results.length === 1 ? "publication" : "publications"}
            {category !== "all" && <> in <span className="text-ink-900">{category}</span></>}
          </p>
          {(category !== "all" || query || year !== "all") && (
            <button
              type="button"
              className="text-[13px] font-medium text-signal-600 hover:text-signal-500"
              onClick={() => {
                pickCategory("all");
                setQuery("");
                setYear("all");
              }}
            >
              Reset filters
            </button>
          )}
        </div>
        {results.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <PublicationCard key={p.slug} pub={p} />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-xs border border-dashed border-rule p-12 text-center">
            <p className="text-[15px] font-medium text-ink-900">No publications match these filters.</p>
            <p className="mt-2 text-[14px] text-subtle">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
