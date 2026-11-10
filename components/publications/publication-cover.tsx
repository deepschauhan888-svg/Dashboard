import Image from "next/image";
import type { Publication } from "@/lib/config/publications";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/ui/logo";

/** Typographic, generated cover used until approved cover artwork is supplied. */
export function PublicationCover({ pub, className, size = "md" }: { pub: Publication; className?: string; size?: "sm" | "md" | "lg" }) {
  if (pub.coverImage) {
    return (
      <div className={cn("relative aspect-[3/4] overflow-hidden rounded-xs bg-ink-900", className)}>
        <Image src={pub.coverImage} alt={`${pub.title} cover`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
      </div>
    );
  }
  const date = new Date(pub.date);
  return (
    <div className={cn("relative flex aspect-[3/4] flex-col overflow-hidden rounded-xs bg-ink-900 text-white shadow-[0_24px_48px_-24px_rgba(7,20,38,0.6)]", className)} aria-hidden>
      <Pattern variant={pub.cover} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-900/60 to-transparent" />
      <div className={cn("relative flex items-center justify-between", size === "sm" ? "p-3" : "p-5")}>
        <LogoMark className={size === "sm" ? "h-5 w-5" : "h-6 w-6"} />
        <span className="font-mono text-[9px] tracking-[0.2em] text-white/50">{date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()}</span>
      </div>
      <div className={cn("relative mt-auto", size === "sm" ? "p-3" : "p-5")}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-signal-200">{pub.category}</p>
        <p className={cn("mt-2 font-serif leading-[1.1] tracking-[-0.01em]", size === "lg" ? "text-[30px]" : size === "sm" ? "text-[15px]" : "text-[21px]")}>{pub.title}</p>
        <div className="mt-4 h-0.5 w-10 bg-signal-500" />
      </div>
    </div>
  );
}

function Pattern({ variant }: { variant: Publication["cover"] }) {
  const stroke = "rgba(169,209,255,0.28)";
  switch (variant) {
    case "bars":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400" preserveAspectRatio="none">
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 60 + ((i * 47) % 180);
            return <rect key={i} x={12 + i * 20} y={260 - h} width="10" height={h} rx="1" fill={i === 9 ? "#318BFF" : stroke} />;
          })}
        </svg>
      );
    case "rings":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400">
          {[30, 60, 90, 120, 150, 180].map((r) => (
            <circle key={r} cx="230" cy="110" r={r} fill="none" stroke={stroke} />
          ))}
          <circle cx="230" cy="110" r="6" fill="#318BFF" />
        </svg>
      );
    case "contour":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d={`M-10 ${60 + i * 26} C 80 ${20 + i * 30}, 160 ${120 + i * 18}, 310 ${50 + i * 28}`} fill="none" stroke={i === 3 ? "#318BFF" : stroke} />
          ))}
        </svg>
      );
    case "columns":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400">
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={20 + i * 45} y={40 + (i % 3) * 30} width="30" height={180 - (i % 3) * 30} fill="none" stroke={i === 2 ? "#318BFF" : stroke} />
          ))}
        </svg>
      );
    case "wave":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M0 ${80 + i * 22} Q 75 ${40 + i * 22}, 150 ${80 + i * 22} T 300 ${80 + i * 22}`} fill="none" stroke={i === 2 ? "#318BFF" : stroke} />
          ))}
        </svg>
      );
    default:
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="260" stroke={stroke} strokeWidth="0.6" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 32} x2="300" y2={i * 32} stroke={stroke} strokeWidth="0.6" />
          ))}
          <rect x="128" y="96" width="32" height="32" fill="#318BFF" opacity="0.8" />
        </svg>
      );
  }
}
