import Link from "next/link";
import { legalNav, primaryNav, siteConfig } from "@/lib/config/site";
import { Logo } from "@/components/ui/logo";

/** Charcoal footer band. Shows only configured contact details — nothing unconfirmed. */
export function SiteFooter() {
  const contact = [siteConfig.contact.email, siteConfig.contact.phone, siteConfig.contact.address].filter((v): v is string => !!v);
  const socials = Object.entries(siteConfig.social).filter(([, v]) => v) as [string, string][];
  const year = new Date().getFullYear();
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo inverse />
            <p className="mt-6 max-w-sm font-serif text-[19px] leading-snug text-white/85">{siteConfig.tagline}</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-3">
            <ul className="space-y-2.5">
              {primaryNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-[14px] text-white/65 transition-colors hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            {contact.length > 0 && (
              <ul className="mb-6 space-y-2 text-[14px] text-white/75">
                {contact.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            <Link href="/contact" className="inline-flex h-10 items-center rounded-sm bg-white px-4 text-[14px] font-medium text-ink hover:bg-mist">
              Make an enquiry
            </Link>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-5 text-[13px]">
                {socials.map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="capitalize text-white/60 hover:text-white">
                    {k === "x" ? "X" : k}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12.5px] text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.parentBrand}. MB Research Intelligence is a product of MB Research.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
