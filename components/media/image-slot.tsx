import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Configurable photography slot. Renders the approved image when a path is
 * configured; otherwise a designed, clearly-labelled placeholder composition.
 */
export function ImageSlot({
  src,
  alt,
  label,
  className,
  variant = "city",
  priority,
}: {
  src: string | null;
  alt: string;
  label: string;
  className?: string;
  variant?: "city" | "research" | "data";
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-xs bg-ink-900", className)}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority={priority} />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden rounded-xs bg-ink-900", className)} role="img" aria-label={`${label} (image placeholder)`}>
      <div className="grid-lines absolute inset-0" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {variant === "city" &&
          Array.from({ length: 22 }).map((_, i) => {
            const h = 40 + ((i * 53) % 150);
            return <rect key={i} x={i * 18} y={300 - h} width="14" height={h} fill={i % 7 === 3 ? "rgba(49,139,255,0.5)" : "rgba(169,209,255,0.09)"} stroke="rgba(169,209,255,0.18)" strokeWidth="0.6" />;
          })}
        {variant === "research" &&
          Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={260} cy={120} r={20 + i * 26} fill="none" stroke={i === 2 ? "rgba(49,139,255,0.7)" : "rgba(169,209,255,0.14)"} />)}
        {variant === "data" &&
          Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M0 ${220 - i * 14} C 120 ${200 - i * 20}, 220 ${240 - i * 12}, 400 ${150 - i * 14}`} fill="none" stroke={i === 4 ? "rgba(49,139,255,0.8)" : "rgba(169,209,255,0.14)"} />
          ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
      <span className="absolute bottom-3 left-3 rounded-xs border border-dashed border-white/25 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
        Image slot · {label}
      </span>
    </div>
  );
}
