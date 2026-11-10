import Image from "next/image";
import type { RelationshipEntry } from "@/lib/config/clients";
import { siteConfig } from "@/lib/config/site";

/** Logo wall for approved entries. Sample slots render only in showcase mode. */
export function LogoWall({ entries, sampleSlots }: { entries: RelationshipEntry[]; sampleSlots: number }) {
  const slots = entries.length === 0 && siteConfig.showSampleContent ? sampleSlots : 0;
  if (!entries.length && !slots) return null;
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
      {entries.map((e) => (
        <li key={e.id} className="flex h-32 flex-col items-center justify-center gap-2 bg-white p-6 text-center">
          {e.logo ? <Image src={e.logo} alt={e.name} width={150} height={52} className="max-h-12 w-auto object-contain" /> : <span className="text-[15px] font-medium">{e.name}</span>}
          {e.note && <span className="text-[12px] text-ink-2">{e.note}</span>}
        </li>
      ))}
      {Array.from({ length: slots }).map((_, i) => (
        <li key={`slot-${i}`} className="flex h-32 items-center justify-center bg-white p-6">
          <span className="rounded-xs border border-dashed border-line-strong px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-2">Approved logo</span>
        </li>
      ))}
    </ul>
  );
}
