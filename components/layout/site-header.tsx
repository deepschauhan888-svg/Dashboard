"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Lock, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

/**
 * Transparent over dark heroes, condensing to a solid navy bar on scroll.
 * Every public page opens with a dark hero, so the header is always light-on-dark.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "bg-ink-900/92 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-xs focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-ink-900">
        Skip to content
      </a>
      <div className={cn("mx-auto flex max-w-[1320px] items-center justify-between px-5 transition-all duration-500 sm:px-8", scrolled ? "h-16" : "h-20")}>
        <Link href="/" aria-label="MB Research Intelligence — home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative px-3 py-2 text-[13.5px] font-medium transition-colors",
                isActive(item.href) ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              {item.label}
              {isActive(item.href) && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-px bg-signal-500" />}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="inline-flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-medium text-white/70 hover:text-white">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Login
          </Link>
          <ButtonLink href="/contact?type=demonstration" size="sm" className="h-9 px-4">
            Request a Demo <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </ButtonLink>
        </div>

        <button
          type="button"
          className="rounded-xs p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-ink-900 lg:hidden"
          >
            <ul className="flex flex-col px-5 py-4">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn("block border-b border-white/5 py-3.5 text-[15px]", isActive(item.href) ? "text-white" : "text-white/70")}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 flex gap-3">
                <ButtonLink href="/login" variant="outline-light" className="flex-1">
                  Login
                </ButtonLink>
                <ButtonLink href="/contact?type=demonstration" className="flex-1">
                  Request a Demo
                </ButtonLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
