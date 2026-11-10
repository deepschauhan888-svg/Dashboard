import Image from "next/image";
import type { Publication } from "@/lib/config/publications";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/ui/logo";

/** Editorial typographic cover, used until approved cover artwork is supplied. */
export function PublicationCover({ pub, className, size = "md" }: { pub: Publication; className?: string; size?: "sm" | "md" | "lg" }) {
  if (pub.coverImage) {
    return (
      <div className={cn("relative aspect-[3/4] overflow-hidden rounded-xs border border-line bg-paper", className)}>
        <Image src={pub.coverImage} alt={`${pub.title} cover`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
      </div>
    );
  }
  const date = new Date(pub.date);
  const pad = size === "sm" ? "p-3" : "p-5";
  return (
    <div className={cn("relative flex aspect-[3/4] flex-col overflow-hidden rounded-xs border border-line bg-white shadow-[var(--shadow-soft)]", className)} aria-hidden>
      <div className={cn("flex items-center justify-between", pad)}>
        <LogoMark className={size === "sm" ? "h-5 w-5" : "h-6 w-6"} />
        <span className="text-[9.5px] font-medium tracking-[0.14em] text-ink-2">{date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()}</span>
      </div>
      <div className="relative flex-1">
        <Pattern variant={pub.cover} />
      </div>
      <div className={cn("border-t border-line bg-white", pad)}>
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand">{pub.category}</p>
        <p className={cn("mt-1.5 font-serif leading-[1.15] text-ink", size === "lg" ? "text-[26px]" : size === "sm" ? "text-[14px]" : "text-[19px]")}>{pub.title}</p>
      </div>
    </div>
  );
}

function Pattern({ variant }: { variant: Publication["cover"] }) {
  const stroke = "#D4D4D4";
  const red = "#B5122B";
  const common = { className: "absolute inset-0 h-full w-full", preserveAspectRatio: "xMidYMid slice" as const, viewBox: "0 0 300 260" };
  switch (variant) {
    case "bars":
      return (
        <svg {...common}>
          {Array.from({ length: 12 }).map((_, i) => {
            const h = 40 + ((i * 47) % 150);
            return <rect key={i} x={24 + i * 22} y={230 - h} width="12" height={h} fill={i === 8 ? red : "#E6E6E6"} />;
          })}
          <line x1="16" y1="230.5" x2="284" y2="230.5" stroke="#252525" />
        </svg>
      );
    case "rings":
      return (
        <svg {...common}>
          {[24, 48, 72, 96, 120].map((r) => (
            <circle key={r} cx="190" cy="120" r={r} fill="none" stroke={stroke} />
          ))}
          <circle cx="190" cy="120" r="5" fill={red} />
        </svg>
      );
    case "contour":
      return (
        <svg {...common}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M-10 ${40 + i * 28} C 80 ${10 + i * 30}, 170 ${90 + i * 22}, 310 ${30 + i * 28}`} fill="none" stroke={i === 3 ? red : stroke} strokeWidth={i === 3 ? 1.5 : 1} />
          ))}
        </svg>
      );
    case "columns":
      return (
        <svg {...common}>
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={30 + i * 50} y={40 + (i % 3) * 26} width="34" height={180 - (i % 3) * 26} fill="none" stroke={i === 2 ? red : stroke} />
          ))}
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M0 ${60 + i * 26} Q 75 ${30 + i * 26}, 150 ${60 + i * 26} T 300 ${60 + i * 26}`} fill="none" stroke={i === 2 ? red : stroke} strokeWidth={i === 2 ? 1.5 : 1} />
          ))}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="260" stroke="#EDEDED" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 32} x2="300" y2={i * 32} stroke="#EDEDED" />
          ))}
          <rect x="160" y="96" width="32" height="32" fill={red} />
        </svg>
      );
  }
}
