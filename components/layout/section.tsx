import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/reveal";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8", className)}>{children}</div>;
}

/** Editorial section heading: index code, title with optional serif accent, and lede. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  lede,
  tone = "light",
  align = "left",
  className,
  aside,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  lede?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  aside?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <Reveal className={cn("flex flex-col gap-8 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
          {index && <span className={cn("eyebrow", dark ? "text-signal-400" : "text-signal-600")}>{index}</span>}
          <span className={cn("h-px w-8", dark ? "bg-white/20" : "bg-text/20")} aria-hidden />
          <span className={cn("eyebrow", dark ? "text-white/50" : "text-subtle")}>{eyebrow}</span>
        </div>
        <h2 className={cn("mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]", dark ? "text-white" : "text-ink-900")}>
          {title}
          {accent && (
            <>
              {" "}
              <span className={cn("font-serif font-light italic tracking-[-0.015em]", dark ? "text-signal-200" : "text-signal-600")}>{accent}</span>
            </>
          )}
        </h2>
        {lede && <p className={cn("mt-5 max-w-2xl text-[16.5px] leading-relaxed", dark ? "text-white/60" : "text-subtle", align === "center" && "mx-auto")}>{lede}</p>}
      </div>
      {aside}
    </Reveal>
  );
}

/** Dark page hero used by interior public pages. */
export function PageHero({ eyebrow, title, accent, lede, children }: { eyebrow: string; title: string; accent?: string; lede?: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 pb-20 pt-40 text-white sm:pb-24 sm:pt-44">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-signal-500/10 blur-[120px]" aria-hidden />
      <Container>
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-signal-500" aria-hidden />
            <span className="eyebrow text-signal-200">{eyebrow}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[56px] lg:text-[68px]">
            {title}
            {accent && (
              <>
                {" "}
                <span className="font-serif font-light italic text-signal-200">{accent}</span>
              </>
            )}
          </h1>
          {lede && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60">{lede}</p>}
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
