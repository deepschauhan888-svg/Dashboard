import Link from "next/link";
import { legalNav, primaryNav, siteConfig } from "@/lib/config/site";
import { PUBLICATION_CATEGORIES } from "@/lib/config/publications";
import { Logo } from "@/components/ui/logo";

function ConfigValue({ value, label }: { value: string | null; label: string }) {
  return value ? <span>{value}</span> : <span className="text-white/35">{label} — to be configured</span>;
}

export function SiteFooter() {
  const socials = Object.entries(siteConfig.social).filter(([, v]) => v) as [string, string][];
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-white/55">{siteConfig.tagline}</p>
            <p className="mt-6 max-w-sm text-[12.5px] leading-relaxed text-white/40">
              A product of MB Research, the research and analytics division of {siteConfig.parentBrand}.
            </p>
          </div>

          <FooterCol title="Navigate">
            {primaryNav.map((n) => (
              <FooterLink key={n.href} href={n.href}>
                {n.label}
              </FooterLink>
            ))}
            <FooterLink href="/login">Client Login</FooterLink>
          </FooterCol>

          <FooterCol title="Publications">
            {PUBLICATION_CATEGORIES.map((c) => (
              <FooterLink key={c.id} href={`/publications?category=${encodeURIComponent(c.id)}`}>
                {c.id}
              </FooterLink>
            ))}
          </FooterCol>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-white/40">Contact</h2>
            <ul className="mt-5 space-y-3 text-[13.5px] text-white/70">
              <li>
                <ConfigValue value={siteConfig.contact.email} label="Email" />
              </li>
              <li>
                <ConfigValue value={siteConfig.contact.phone} label="Phone" />
              </li>
              <li>
                <ConfigValue value={siteConfig.contact.address} label="Address" />
              </li>
            </ul>
            <div className="mt-6 flex gap-4 text-[13px]">
              {socials.length ? (
                socials.map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="capitalize text-white/60 hover:text-white">
                    {k === "x" ? "X" : k}
                  </a>
                ))
              ) : (
                <span className="text-white/35">Social channels — to be configured</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.parentBrand}. MB Research Intelligence. All figures shown in this showcase are demonstration data.
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

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lg:col-span-2">
      <h2 className="eyebrow text-white/40">{title}</h2>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[13.5px] text-white/65 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
