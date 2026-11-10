/**
 * Site-wide configuration. Every business fact that has not been formally
 * approved is `null` and renders as a clearly-marked placeholder. Fill these
 * values in once confirmed by MB Research / Magicbricks.
 */

export const siteConfig = {
  name: "MB Research Intelligence",
  shortName: "MB Research",
  parentBrand: "Magicbricks",
  tagline: "Understand Markets. Anticipate Demand. Make Better Decisions.",
  altTagline: "The Real Estate Market Has a Story. We Give You the Intelligence to Read It.",
  description:
    "MB Research Intelligence transforms real estate market data into actionable intelligence through comprehensive analysis of demand, supply, pricing and evolving market dynamics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  contact: {
    /** e.g. "research@magicbricks.com" — to be approved */
    email: null as string | null,
    /** e.g. "+91 …" — to be approved */
    phone: null as string | null,
    /** postal address — to be approved */
    address: null as string | null,
    /** business hours text */
    hours: null as string | null,
  },

  social: {
    linkedin: null as string | null,
    x: null as string | null,
    youtube: null as string | null,
  },

  /** Approved hero / section photography. Drop files into /public/images and set paths. */
  imagery: {
    hero: null as string | null,
    aboutResearch: null as string | null,
    aboutTeam: null as string | null,
    platform: null as string | null,
  },
} as const;

export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "About Us", href: "/about" },
  { label: "Publications", href: "/publications" },
  { label: "Our Clients", href: "/clients" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Data Disclaimer", href: "/legal/disclaimer" },
] as const;
