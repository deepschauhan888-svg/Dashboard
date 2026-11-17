import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

type LogoAsset = (typeof siteConfig.logos)[keyof typeof siteConfig.logos];

/**
 * Shows a supplied logo file unaltered, framed to the region that contains the
 * mark so it reads at a sensible size. The image keeps its intrinsic aspect
 * ratio (height: auto) — it is never stretched, recoloured or redrawn.
 */
function FramedLogo({ logo, className }: { logo: LogoAsset; className: string }) {
  const { mark } = logo;
  return (
    <span className={cn("relative block shrink-0 overflow-hidden", className)} style={{ aspectRatio: `${mark.w} / ${mark.h}` }}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority
        sizes="200px"
        className="absolute max-w-none"
        style={{
          width: `${(logo.width / mark.w) * 100}%`,
          height: "auto",
          left: `${(-mark.x / mark.w) * 100}%`,
          top: `${(-mark.y / mark.h) * 100}%`,
        }}
      />
    </span>
  );
}

/** Official MB Research and Magicbricks logos, top-right of the sign-in page. */
export function PartnerLogos({ className }: { className?: string }) {
  const { mbResearch, magicbricks } = siteConfig.logos;
  return (
    <div className={cn("flex items-center gap-3 sm:gap-6", className)}>
      <FramedLogo logo={mbResearch} className="h-7 sm:h-10" />
      <span className="h-7 w-px bg-line sm:h-10" aria-hidden />
      <FramedLogo logo={magicbricks} className="h-8 sm:h-11" />
    </div>
  );
}
