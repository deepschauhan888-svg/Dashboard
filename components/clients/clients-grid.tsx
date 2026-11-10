import Image from "next/image";
import { clientsConfig, type ClientCategory } from "@/lib/config/clients";
import { cn } from "@/lib/utils/cn";

/** Logo wall. Shows approved entries; while approvals are pending, labelled empty slots. */
export function ClientsGrid({ categories, tone = "light", slots }: { categories?: ClientCategory[]; tone?: "light" | "dark"; slots?: number }) {
  const cats = clientsConfig.categories.filter((c) => !categories || categories.includes(c.id));
  const dark = tone === "dark";
  return (
    <div className="space-y-10">
      {cats.map((cat) => {
        const entries = clientsConfig.entries.filter((e) => e.approved && e.category === cat.id);
        const placeholderCount = clientsConfig.showPlaceholders ? Math.max(0, (slots ?? clientsConfig.placeholderSlotsPerCategory) - entries.length) : 0;
        if (!entries.length && !placeholderCount) return null;
        return (
          <div key={cat.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className={cn("text-[15px] font-semibold", dark ? "text-white" : "text-ink-900")}>{cat.id}</h3>
              <p className={cn("text-[13px]", dark ? "text-white/45" : "text-muted")}>{cat.blurb}</p>
            </div>
            <ul className={cn("mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xs ring-1 sm:grid-cols-4", dark ? "bg-white/10 ring-white/10" : "bg-rule ring-rule")}>
              {entries.map((e) => (
                <li key={e.id} className={cn("flex h-28 items-center justify-center p-6", dark ? "bg-ink-900" : "bg-white")}>
                  {e.logo ? (
                    <Image src={e.logo} alt={e.name} width={140} height={48} className="max-h-12 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  ) : (
                    <span className={cn("text-center text-[14px] font-medium", dark ? "text-white/80" : "text-ink-900")}>{e.name}</span>
                  )}
                </li>
              ))}
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <li key={`ph-${i}`} className={cn("flex h-28 flex-col items-center justify-center gap-1.5 p-6", dark ? "bg-ink-900" : "bg-white")}>
                  <span className={cn("flex h-9 w-24 items-center justify-center rounded-xs border border-dashed", dark ? "border-white/15" : "border-rule")}>
                    <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.16em]", dark ? "text-white/30" : "text-muted")}>Logo slot</span>
                  </span>
                  <span className={cn("text-[11px]", dark ? "text-white/30" : "text-muted")}>Pending approval</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
