import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/reveal";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8", className)}>{children}</div>;
}

/** Editorial section heading: kicker, serif title, optional lede and aside. */
export function SectionHeading({
  kicker,
  title,
  lede,
  aside,
  className,
  tone = "light",
}: {
  kicker: string;
  title: ReactNode;
  lede?: string;
  aside?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Reveal className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <p className={cn("kicker", dark ? "text-white/60" : "text-brand")}>{kicker}</p>
        <h2 className={cn("display mt-4 text-[34px] leading-[1.12] sm:text-[42px]", dark ? "text-white" : "text-ink")}>{title}</h2>
        {lede && <p className={cn("mt-5 max-w-2xl text-[17px] leading-relaxed", dark ? "text-white/70" : "text-ink-2")}>{lede}</p>}
      </div>
      {aside}
    </Reveal>
  );
}

/** Interior page hero — white, typographic, with a fine rule. */
export function PageHero({ kicker, title, lede, children }: { kicker: string; title: ReactNode; lede?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-white pb-16 pt-36 sm:pb-20 sm:pt-44">
      <Container>
        <Reveal>
          <p className="kicker text-brand">{kicker}</p>
          <h1 className="display mt-5 max-w-4xl text-[42px] leading-[1.06] sm:text-[58px]">{title}</h1>
          {lede && <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink-2">{lede}</p>}
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
