"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

/** Clean white header with a hairline that appears on scroll. Login sits apart from content navigation. */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300", scrolled || open ? "shadow-[0_1px_0_#EAEAEA]" : "")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-xs focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="MB Research Intelligence — home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn("relative px-3 py-2 text-[14px] transition-colors", isActive(item.href) ? "font-medium text-ink" : "text-ink-2 hover:text-ink")}
            >
              {item.label}
              {isActive(item.href) && <span className="absolute inset-x-3 -bottom-[17px] h-[2px] bg-brand" aria-hidden />}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:block">
          <Link href="/login" className="inline-flex h-9 items-center rounded-sm px-4 text-[14px] font-medium text-ink ring-1 ring-inset ring-line-strong transition-colors hover:ring-ink/40">
            Login
          </Link>
        </div>

        <button type="button" className="rounded-xs p-2 text-ink xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-white xl:hidden">
          <ul className="mx-auto flex max-w-[1280px] flex-col px-5 py-3 sm:px-8">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={cn("flex items-center justify-between border-b border-line py-3.5 text-[15px]", isActive(item.href) ? "font-medium text-brand" : "text-ink")}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-4">
              <Link href="/login" className="flex h-11 items-center justify-center rounded-sm text-[15px] font-medium text-ink ring-1 ring-inset ring-line-strong">
                Login
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
